# VoxAI - Dashboard d'Analyse de Sentiment

VoxAI est un outil d'analyse de sentiment intelligent doté d'une interface utilisateur dynamique (Glassmorphism) et d'un backend puissant propulsé par l'IA (NLP). Il permet aux entreprises d'analyser, classer et extraire des insights à partir de retours clients ou de commentaires en un clic.

## Fonctionnalités Principales
- **Importation CSV Intelligente** : Détection automatique des colonnes de texte et des notes clients, quel que soit le délimiteur.
- **Analyse NLP Avancée** : Analyse des sentiments (Positif, Neutre, Négatif), extraction de mots-clés et détection des thèmes principaux en temps réel.
- **Tableau de Bord Premium** : Design réactif avec effets de survol, animations, et graphiques interactifs (Recharts).
- **Mode Clair / Sombre** : Basculez manuellement entre le thème clair et le mode sombre "Premium Glassmorphism".
- **Gestion des Données** : Pagination intégrée (50 avis par page) et options de suppression pour un contrôle total.

## Stack Technique
- **Frontend** : React 18, Vite, Lucide-React, Recharts, CSS Vanilla (Architecture Theme-Ready).
- **Backend** : FastAPI (Python), SQLAlchemy (SQLite), HuggingFace Transformers (NLP).

## Prérequis
- Python 3.9+
- Node.js 18+

## Démarrage Rapide

### 1. Lancement du Backend
```bash
cd backend
pip install -r requirements.txt
python -m spacy download fr_core_news_sm
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
L'API sera disponible sur : http://localhost:8000/docs

### 2. Lancement du Frontend
Ouvrez un nouveau terminal et exécutez :
```bash
cd frontend-premium
npm install
npm run dev
```
L'application web sera disponible sur : http://localhost:5173

## Auteur
Développé dans le cadre d'un projet d'analyse de sentiment avec IA générative.
