"""
Backend API – FastAPI
Endpoints couvrant les 3 modules du cahier des charges :
  Module 1 : Collecte (ajout manuel, import CSV, gestion des produits/services)
  Module 2 : Analyse (sentiment, mots-clés, thèmes)
  Module 3 : Rapport (stats, évolution temporelle, points forts/faibles, thèmes)
"""

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import csv
import io

from .database import engine, get_db, init_db, Review, Product
from .nlp_engine import (
    analyze_sentiment,
    aggregate_themes,
    extract_strengths_weaknesses,
)

# Initialisation de la BDD
init_db()

app = FastAPI(
    title="VoxAI – API d'Analyse de Sentiment",
    description="Agent IA d'analyse de sentiment des avis clients",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================================================
# Pydantic Schemas
# ========================================================================

class ProductCreate(BaseModel):
    name: str
    description: str = ""

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime
    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    source: str
    text: str
    product_id: Optional[int] = None
    date: Optional[datetime] = None
    user_rating: Optional[int] = None

class ReviewResponse(BaseModel):
    id: int
    source: str
    text: str
    sentiment: str
    score: int
    user_rating: Optional[int]
    confidence: float
    keywords: str
    themes: str
    product_id: Optional[int]
    date: datetime
    class Config:
        from_attributes = True

class ReviewPaginatedResponse(BaseModel):
    total: int
    items: List[ReviewResponse]

# ========================================================================
# Module 1 – Collecte : Produits
# ========================================================================

@app.get("/")
def root():
    return {"message": "VoxAI – API d'analyse de sentiment v2"}

@app.post("/products/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.name == product.name).first()
    if existing:
        raise HTTPException(400, "Ce produit/service existe déjà.")
    p = Product(name=product.name, description=product.description)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@app.get("/products/", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.name).all()

# ========================================================================
# Module 1 – Collecte : Avis (ajout unitaire + import)
# ========================================================================

@app.post("/reviews/", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    """Ajoute un avis, l'analyse automatiquement et l'enregistre."""
    analysis = analyze_sentiment(review.text)
    db_review = Review(
        source=review.source,
        text=review.text,
        sentiment=analysis["sentiment"],
        score=analysis["score"],
        user_rating=review.user_rating,
        confidence=analysis["confidence"],
        keywords=analysis["keywords"],
        themes=analysis["themes"],
        product_id=review.product_id,
        date=review.date or datetime.utcnow(),
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@app.post("/import/")
def import_reviews(reviews: List[ReviewCreate], db: Session = Depends(get_db)):
    """Importe un lot d'avis en JSON."""
    count = 0
    for r in reviews:
        a = analyze_sentiment(r.text)
        db.add(Review(
            source=r.source, text=r.text,
            sentiment=a["sentiment"], score=a["score"],
            user_rating=r.user_rating,
            confidence=a["confidence"], keywords=a["keywords"],
            themes=a["themes"], product_id=r.product_id,
            date=r.date or datetime.utcnow(),
        ))
        count += 1
    db.commit()
    return {"message": f"{count} avis importés et analysés."}

@app.post("/import-csv/")
async def import_csv(
    file: UploadFile = File(...),
    source: str = Form("CSV"),
    product_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Importe des avis depuis un fichier CSV.
    Le CSV doit contenir au minimum une colonne 'text'.
    Colonnes optionnelles : 'source', 'date', 'product_id'.
    """
    content = await file.read()
    decoded = content.decode("utf-8-sig")
    
    # Détection dynamique du délimiteur (virgule, point-virgule, tabulation...)
    try:
        dialect = csv.Sniffer().sniff(decoded, delimiters=";,|\t")
    except:
        dialect = csv.excel

    reader = csv.DictReader(io.StringIO(decoded), dialect=dialect)

    count = 0
    headers = reader.fieldnames
    if not headers:
        return {"message": "CSV vide ou invalide."}
    
    # Trouver la colonne contenant 'text' (insensible à la casse)
    text_keywords = ["text", "avis", "review", "comment", "content", "message"]
    text_col = next((h for h in headers if any(k in h.lower() for k in text_keywords)), None)
    
    # Si non trouvé, on évite la première colonne (souvent ID ou Nom), on prend la dernière
    if not text_col:
        text_col = headers[-1] if len(headers) > 1 else headers[0]

    # Trouver la colonne contenant 'rating'
    rating_keywords = ["rating", "score", "note", "stars", "etoiles"]
    rating_col = next((h for h in headers if any(k in h.lower() for k in rating_keywords)), None)

    for row in reader:
        text = row.get(text_col, "").strip()
        if not text:
            continue

        row_source = row.get("source", source).strip() if "source" in row else source
        row_pid = row.get("product_id") if "product_id" in row else None
        pid = int(row_pid) if row_pid and str(row_pid).strip() else product_id
        
        u_rating = None
        if rating_col and row.get(rating_col):
            try:
                # Gérer "5" ou "5/5" ou "5.0"
                val = row.get(rating_col).split('/')[0].strip()
                u_rating = int(float(val))
            except:
                pass

        a = analyze_sentiment(text)
        db.add(Review(
            source=row_source or source, text=text,
            sentiment=a["sentiment"], score=a["score"],
            user_rating=u_rating,
            confidence=a["confidence"], keywords=a["keywords"],
            themes=a["themes"], product_id=pid,
            date=datetime.utcnow(),
        ))
        count += 1

    db.commit()
    return {"message": f"{count} avis importés depuis CSV."}

# ========================================================================
# Module 2 – Consultation des avis analysés
# ========================================================================

@app.get("/reviews/", response_model=ReviewPaginatedResponse)
def get_reviews(
    skip: int = 0,
    limit: int = 50,
    product_id: Optional[int] = None,
    sentiment: Optional[str] = None,
    source: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Récupère les avis avec pagination et filtres."""
    q = db.query(Review)
    if product_id:
        q = q.filter(Review.product_id == product_id)
    if sentiment:
        q = q.filter(Review.sentiment == sentiment)
    if source:
        q = q.filter(Review.source == source)
        
    total = q.count()
    items = q.order_by(Review.date.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@app.delete("/reviews/all")
def delete_all_reviews(db: Session = Depends(get_db)):
    """Supprime tous les avis."""
    count = db.query(Review).delete()
    db.commit()
    return {"message": f"{count} avis supprimés."}

@app.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    """Supprime un avis spécifique."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(404, "Avis non trouvé")
    db.delete(review)
    db.commit()
    return {"message": "Avis supprimé."}

# ========================================================================
# Module 3 – Rapport : Statistiques globales
# ========================================================================

@app.get("/stats/")
def get_stats(product_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Review)
    if product_id:
        q = q.filter(Review.product_id == product_id)

    total = q.count()
    if total == 0:
        return {"total": 0, "average_score": 0, "sentiments": {}, "sources": {}}

    # Répartition par sentiment
    sentiments = dict(q.with_entities(Review.sentiment, func.count(Review.id)).group_by(Review.sentiment).all())
    # Répartition par source
    sources = dict(q.with_entities(Review.source, func.count(Review.id)).group_by(Review.source).all())
    # Score moyen
    avg = q.with_entities(func.avg(Review.score)).scalar()

    return {
        "total": total,
        "average_score": round(avg, 2) if avg else 0,
        "sentiments": sentiments,
        "sources": sources,
    }

# ========================================================================
# Module 3 – Rapport : Évolution du sentiment dans le temps
# ========================================================================

@app.get("/stats/timeline/")
def get_timeline(product_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Retourne le score moyen et le comptage par jour."""
    day_col = func.date(Review.date).label("day")
    q = db.query(
        day_col,
        func.avg(Review.score).label("avg_score"),
        func.count(Review.id).label("count"),
    )
    if product_id:
        q = q.filter(Review.product_id == product_id)

    rows = q.group_by(day_col).order_by(day_col).all()
    return [
        {"day": r.day, "avg_score": round(r.avg_score, 2), "count": r.count}
        for r in rows
    ]

# ========================================================================
# Module 3 – Rapport : Thèmes récurrents + Points forts / Améliorations
# ========================================================================

@app.get("/stats/report/")
def get_report(product_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Rapport synthétique complet :
      - Répartition des sentiments
      - Thèmes récurrents
      - Points forts
      - Points d'amélioration
    """
    q = db.query(Review)
    if product_id:
        q = q.filter(Review.product_id == product_id)

    reviews_raw = q.all()
    if not reviews_raw:
        return {"themes": {}, "strengths": {}, "weaknesses": {}}

    data = [
        {"sentiment": r.sentiment, "keywords": r.keywords or "", "themes": r.themes or ""}
        for r in reviews_raw
    ]

    themes = aggregate_themes(data)
    sw = extract_strengths_weaknesses(data)

    return {
        "themes": themes,
        "points_forts": sw["points_forts"],
        "points_amelioration": sw["points_amelioration"],
    }
