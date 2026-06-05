import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./reviews.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Product(Base):
    """Produit ou service auquel les avis sont associés."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="product")


class Review(Base):
    """Avis client provenant de différentes sources."""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(50), index=True)          # WhatsApp, Email, Facebook, Google, Twitter
    text = Column(Text, nullable=False)
    sentiment = Column(String(20), index=True)        # Positif, Négatif, Neutre
    score = Column(Integer)                           # 1 to 5 (intensité)
    user_rating = Column(Integer, nullable=True)      # Note donnée par l'utilisateur (optionnelle)
    confidence = Column(Float, default=0.0)           # Confiance du modèle (0-1)
    keywords = Column(Text, default="")               # Comma-separated noun chunks
    themes = Column(Text, default="")                 # Comma-separated detected themes
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)

    product = relationship("Product", back_populates="reviews")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
