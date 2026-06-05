"""
Module IA – Analyse de sentiment, extraction de mots-clés, détection de thèmes.

Utilise :
  - Transformers (nlptown/bert-base-multilingual-uncased-sentiment) pour le score de sentiment
  - spaCy (fr_core_news_sm) pour l'extraction linguistique (noun chunks, adjectifs, thèmes)
"""

import spacy
from collections import Counter
from transformers import pipeline
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Chargement des modèles au démarrage
# ---------------------------------------------------------------------------

logger.info("Chargement du modèle Transformers d'analyse de sentiment...")
try:
    sentiment_analyzer = pipeline(
        "sentiment-analysis",
        model="nlptown/bert-base-multilingual-uncased-sentiment",
    )
    logger.info("Modèle Transformers chargé avec succès.")
except Exception as e:
    logger.error(f"Erreur Transformers : {e}")
    sentiment_analyzer = None

logger.info("Chargement du modèle spaCy (fr_core_news_sm)...")
try:
    nlp = spacy.load("fr_core_news_sm")
    logger.info("Modèle spaCy chargé avec succès.")
except Exception as e:
    logger.error(f"Erreur spaCy : {e}")
    nlp = None

# ---------------------------------------------------------------------------
# Thèmes prédéfinis pour une agence de marketing digital
# ---------------------------------------------------------------------------
THEME_KEYWORDS = {
    "Service Client": ["service", "support", "assistance", "aide", "réponse", "réactivité", "réactif", "écoute", "accueil"],
    "Qualité Produit": ["produit", "qualité", "fiable", "solide", "défaut", "cassé", "abîmé", "fonctionnel", "performance"],
    "Prix & Tarifs": ["prix", "tarif", "cher", "coût", "abordable", "rapport", "budget", "facture", "paiement"],
    "Livraison": ["livraison", "délai", "rapide", "lent", "colis", "emballage", "expédition", "retard", "arrivé"],
    "Interface & UX": ["site", "interface", "application", "navigation", "intuitif", "design", "ergonomie", "lent", "bug"],
    "Communication": ["communication", "email", "message", "notification", "informé", "suivi", "campagne", "marketing"],
    "Résultats & ROI": ["résultat", "vente", "augmenté", "performance", "trafic", "conversion", "retour", "investissement", "croissance"],
    "Créativité": ["créatif", "créativité", "idée", "original", "innovant", "contenu", "visuel", "design"],
}


def extract_keywords(text: str) -> list[str]:
    """Extrait les groupes nominaux et adjectifs pertinents avec spaCy."""
    if not nlp or not text:
        return []

    doc = nlp(text)
    keywords = []

    # Noun chunks (groupes nominaux)
    for chunk in doc.noun_chunks:
        if chunk.root.pos_ == "PRON":
            continue
        clean = " ".join(
            tok.text for tok in chunk if tok.pos_ not in ("DET", "PUNCT", "ADP")
        ).strip()
        if len(clean) > 2:
            keywords.append(clean.lower())

    # Adjectifs isolés
    for tok in doc:
        if tok.pos_ == "ADJ" and len(tok.text) > 3 and tok.text.lower() not in keywords:
            keywords.append(tok.text.lower())

    # Dédoublonner tout en gardant l'ordre
    seen = set()
    unique = []
    for kw in keywords:
        if kw not in seen:
            seen.add(kw)
            unique.append(kw)
    return unique[:8]


def detect_themes(text: str) -> list[str]:
    """Détecte les thèmes récurrents dans un texte via correspondance lexicale."""
    if not text:
        return []

    text_lower = text.lower()
    detected = []
    for theme, words in THEME_KEYWORDS.items():
        if any(w in text_lower for w in words):
            detected.append(theme)
    return detected


def detect_double_negation(text: str) -> bool:
    """
    Détecte les doubles négations en français.
    Exemples : "pas insatisfait", "pas mauvais", "jamais déçu", "ne regrette pas"
    Retourne True si une double négation est détectée (= sens positif).
    """
    if not text:
        return False

    text_lower = text.lower()

    # Mots négatifs (négation)
    negation_words = ["pas", "jamais", "plus", "aucun", "aucune", "ni", "sans", "rien"]
    # Mots à polarité négative (si niés = positif)
    negative_words = [
        "insatisfait", "insatisfaite", "mécontent", "mécontente",
        "déçu", "déçue", "mauvais", "mauvaise", "mal",
        "horrible", "terrible", "nul", "nulle",
        "pire", "décevant", "décevante", "problème", "problèmes",
        "défaut", "défauts", "ennuyeux", "ennuyeuse",
        "lent", "lente", "inutile", "difficile",
        "compliqué", "compliquée", "regret", "regrette",
        "insupportable", "inadmissible", "inacceptable",
        "insuffisant", "insuffisante", "incompétent", "incompétente",
        "désagréable", "frustrant", "frustrante",
        "unhappy", "dissatisfied", "bad", "poor", "terrible",
        "horrible", "worst", "disappointed", "disappointing",
    ]

    # Cherche un mot de négation suivi (dans les 4 mots) d'un mot négatif
    words = text_lower.split()
    for i, word in enumerate(words):
        if word in negation_words:
            # Regarde les 4 mots suivants
            window = words[i+1:i+5]
            for w in window:
                # Nettoyer la ponctuation
                clean_w = w.strip(".,!?;:'\"()[]")
                if clean_w in negative_words:
                    return True
    return False


def analyze_sentiment(text: str) -> dict:
    """
    Analyse complète d'un avis :
      - sentiment (Positif / Négatif / Neutre)
      - score (1 à 5, intensité)
      - confidence (0-1)
      - keywords (liste -> str)
      - themes  (liste -> str)

    Inclut un post-traitement pour détecter les doubles négations
    (ex: "pas insatisfait" = Positif).
    """
    result = {
        "sentiment": "Neutre",
        "score": 3,
        "confidence": 0.0,
        "keywords": "",
        "themes": "",
    }

    if not text or not text.strip():
        return result

    # --- Sentiment via Transformers ---
    if sentiment_analyzer:
        try:
            res = sentiment_analyzer(text[:512])[0]
            score_val = int(res["label"].split()[0])  # "4 stars" -> 4
            confidence = round(res["score"], 3)

            # --- Post-traitement : Double Négation ---
            has_double_neg = detect_double_negation(text)
            if has_double_neg:
                # Inverser le score : 1->5, 2->4, 4->2, 5->1, 3 reste 3
                score_val = 6 - score_val
                logger.info(f"Double négation détectée, score inversé -> {score_val} | texte: {text[:80]}")

            result["score"] = score_val
            result["confidence"] = confidence

            if score_val >= 4:
                result["sentiment"] = "Positif"
            elif score_val <= 2:
                result["sentiment"] = "Négatif"
            else:
                result["sentiment"] = "Neutre"
        except Exception as e:
            logger.error(f"Erreur Transformers : {e}")

    # --- Keywords via spaCy ---
    kws = extract_keywords(text)
    result["keywords"] = ", ".join(kws)

    # --- Thèmes ---
    themes = detect_themes(text)
    result["themes"] = ", ".join(themes)

    return result


def aggregate_themes(reviews_data: list[dict]) -> dict:
    """
    Agrège les thèmes sur un ensemble d'avis et renvoie un comptage.
    reviews_data : liste de dicts avec au minimum 'themes' (str csv).
    """
    counter = Counter()
    for r in reviews_data:
        if r.get("themes"):
            for t in r["themes"].split(", "):
                t = t.strip()
                if t:
                    counter[t] += 1
    return dict(counter.most_common(10))


def extract_strengths_weaknesses(reviews_data: list[dict]) -> dict:
    """
    Sépare les mots-clés des avis positifs (points forts)
    de ceux des avis négatifs (points d'amélioration).
    """
    strengths = Counter()
    weaknesses = Counter()

    for r in reviews_data:
        kws = [k.strip() for k in r.get("keywords", "").split(",") if k.strip()]
        if r.get("sentiment") == "Positif":
            strengths.update(kws)
        elif r.get("sentiment") == "Négatif":
            weaknesses.update(kws)

    return {
        "points_forts": dict(strengths.most_common(8)),
        "points_amelioration": dict(weaknesses.most_common(8)),
    }
