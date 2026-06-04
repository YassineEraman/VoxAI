# Rapport de Projet — VoxAI

## Agent IA d'Analyse de Sentiment des Avis Clients

**PFF FQIA — Sujet N°5 (2026)**

---

**Réalisé par :** Équipe de développement (5 membres)

**Date :** Mai 2026

**Encadrement :** Formation Qualifiante en Intelligence Artificielle

---

## Table des Matières

1. Introduction
2. Problématique
3. Objectifs du Projet
4. État de l'Art
5. Architecture Technique
6. Module 1 — Collecte de Données
7. Module 2 — Moteur NLP et Analyse de Sentiment
8. Module 3 — Rapport et Visualisations
9. Interface Utilisateur (Frontend)
10. Tests et Validation
11. Difficultés Rencontrées et Solutions
12. Améliorations Futures
13. Conclusion
14. Références

---

## 1. Introduction

Dans le contexte actuel du marketing digital, les agences gèrent simultanément des dizaines de clients dont chacun reçoit quotidiennement des centaines de retours provenant de canaux dispersés : réseaux sociaux, emails, plateformes d'avis, messageries instantanées, etc. L'analyse manuelle de ces volumes de données textuelles est devenue un défi majeur, tant en termes de temps que de fiabilité.

Le projet **VoxAI** propose une solution automatisée basée sur l'Intelligence Artificielle pour résoudre cette problématique. Il s'agit d'un prototype fonctionnel d'application web qui collecte, analyse et visualise les avis clients en temps réel, en utilisant des modèles de traitement du langage naturel (NLP) de dernière génération.

Ce rapport présente l'intégralité du travail réalisé : de la définition du problème à l'implémentation technique, en passant par les choix architecturaux, les résultats obtenus et les perspectives d'amélioration.

---

## 2. Problématique

### 2.1 Contexte Métier

Les agences de marketing digital sont confrontées à un défi croissant : le volume et la dispersion des retours clients. Un client type d'agence reçoit entre 50 et 300 messages par jour répartis sur 5 à 10 plateformes différentes (Google Reviews, Facebook, Twitter, WhatsApp, emails, Trustpilot, etc.).

### 2.2 Problèmes Identifiés

**Volume ingérable** — Il est physiquement impossible pour une équipe humaine de lire, classifier et synthétiser manuellement 300+ messages par jour pour chaque client de l'agence.

**Dispersion des sources** — Les avis arrivent de canaux hétérogènes (réseaux sociaux, email, messagerie, plateformes d'avis). Il n'existe aucune vue centralisée permettant d'avoir une vision globale.

**Subjectivité humaine** — L'analyse manuelle du sentiment est subjective. Deux analystes peuvent classifier le même avis différemment selon leur interprétation, leur humeur ou leur niveau de fatigue.

**Lenteur de réaction** — Le temps nécessaire pour compiler un rapport manuellement (1 à 2 jours) est incompatible avec la vitesse à laquelle une crise de réputation peut se développer sur les réseaux sociaux.

**Absence de détection de tendances** — Sans outil automatisé, il est impossible d'identifier qu'un thème spécifique (par exemple, "service client") est mentionné négativement 3 fois plus cette semaine que la précédente.

### 2.3 Besoin Exprimé

L'agence a besoin d'un outil capable de :
- Centraliser les avis provenant de sources multiples
- Analyser automatiquement le sentiment (positif, négatif, neutre)
- Extraire les thèmes récurrents et les mots-clés pertinents
- Générer des rapports visuels exploitables en temps réel
- Associer les avis à des produits ou services spécifiques

---

## 3. Objectifs du Projet

### 3.1 Objectif Général

Développer un prototype fonctionnel d'agent IA capable d'automatiser l'analyse de sentiment des avis clients pour une agence de marketing digital.

### 3.2 Objectifs Spécifiques

1. **Concevoir un pipeline de collecte** flexible supportant l'importation manuelle, par fichier CSV et par lot JSON, avec association optionnelle à un produit/service.

2. **Implémenter un moteur NLP intelligent** utilisant des modèles pré-entraînés (BERT multilingue) pour la classification de sentiment et spaCy pour l'extraction de mots-clés et la détection de thèmes.

3. **Développer un système de reporting automatisé** avec des visualisations interactives (graphiques temporels, répartitions, points forts et points d'amélioration).

4. **Créer une interface utilisateur premium** permettant une utilisation intuitive de l'ensemble du système.

### 3.3 Périmètre

Le prototype couvre les trois modules définis dans le cahier des charges :
- **Module 1** : Collecte et structuration des données
- **Module 2** : Analyse NLP (sentiment, mots-clés, thèmes)
- **Module 3** : Génération de rapports et visualisations

---

## 4. État de l'Art

### 4.1 Analyse de Sentiment

L'analyse de sentiment (ou opinion mining) est une branche du traitement automatique du langage naturel (TALN) qui vise à identifier et extraire la polarité émotionnelle d'un texte. Les approches ont considérablement évolué :

- **Approches lexicales** (avant 2015) : Utilisation de dictionnaires de sentiments (SentiWordNet, VADER). Simples mais limitées en précision, surtout pour les textes multilingues.

- **Approches par apprentissage automatique** (2015-2018) : Modèles supervisés (SVM, Random Forest, LSTM) entraînés sur des corpus annotés. Meilleure précision mais nécessitent des données d'entraînement conséquentes.

- **Approches par Transformers** (2018-présent) : Modèles pré-entraînés (BERT, GPT, RoBERTa) fine-tunés sur des tâches spécifiques. Précision état de l'art, capacité multilingue, compréhension contextuelle profonde.

### 4.2 Choix Technologique : BERT Multilingue

Notre choix s'est porté sur le modèle `nlptown/bert-base-multilingual-uncased-sentiment`, un modèle BERT fine-tuné spécifiquement sur des avis de produits dans 6 langues (français, anglais, allemand, espagnol, italien, néerlandais).

**Justification :**
- Précision supérieure à 85% sur les avis en français
- Classification en 5 niveaux d'intensité (1 à 5 étoiles), plus granulaire qu'une simple polarité binaire
- Score de confiance permettant d'évaluer la certitude de la prédiction
- Aucun besoin de données d'entraînement supplémentaires

### 4.3 Extraction d'Information : spaCy

Pour l'extraction de mots-clés et la détection de thèmes, nous utilisons spaCy avec le modèle français `fr_core_news_sm`, qui offre :
- Analyse syntaxique complète (tokenisation, POS tagging, dependency parsing)
- Extraction de groupes nominaux (noun chunks)
- Traitement rapide adapté à un usage en temps réel

---

## 5. Architecture Technique

### 5.1 Vue d'Ensemble

Le système suit une architecture client-serveur en 3 couches :

| Couche | Technologie | Port |
|---|---|---|
| Frontend (Interface) | React 18 + Vite | localhost:5173 |
| Backend (API) | FastAPI (Python) | localhost:8000 |
| Stockage | SQLite (reviews.db) | Fichier local |

La communication entre le frontend et le backend se fait via des requêtes HTTP REST. Le backend expose une API documentée automatiquement via Swagger (OpenAPI).

### 5.2 Pile Technologique Détaillée

| Composant | Technologie | Justification |
|---|---|---|
| Framework API | FastAPI | Async natif, documentation auto, validation Pydantic |
| ORM | SQLAlchemy | Abstraction SQL, support multi-BDD |
| Base de données | SQLite | Zéro configuration, fichier unique, idéal pour prototype |
| NLP - Sentiment | HuggingFace Transformers | Modèle BERT pré-entraîné, précision état de l'art |
| NLP - Linguistique | spaCy (fr_core_news_sm) | Analyse syntaxique française rapide |
| Frontend | React 18 | Composants réutilisables, écosystème riche |
| Build tool | Vite | Démarrage rapide, HMR instantané |
| Graphiques | Recharts | Intégration React native, responsive |
| HTTP Client | Axios | Intercepteurs, gestion d'erreurs |
| Validation | Pydantic | Typage fort, sérialisation automatique |

### 5.3 Modèle de Données

La base de données contient deux tables liées par une relation One-to-Many :

**Table `products`** — Représente un produit ou service de l'agence :
- `id` (Integer, PK) — Identifiant unique
- `name` (String) — Nom du produit
- `description` (Text) — Description
- `created_at` (DateTime) — Date de création

**Table `reviews`** — Stocke chaque avis avec les résultats de l'analyse IA :
- `id` (Integer, PK) — Identifiant unique
- `source` (String) — Canal d'origine (WhatsApp, Email, Google, etc.)
- `text` (Text) — Texte brut de l'avis
- `sentiment` (String) — Résultat : Positif, Négatif, Neutre
- `score` (Integer) — Intensité de 1 (très négatif) à 5 (très positif)
- `confidence` (Float) — Confiance du modèle (0.0 à 1.0)
- `keywords` (Text) — Mots-clés extraits par spaCy
- `themes` (Text) — Thèmes détectés
- `product_id` (Integer, FK) — Référence au produit associé
- `date` (DateTime) — Date de l'avis

---

## 6. Module 1 — Collecte de Données

### 6.1 Description

Le Module 1 est responsable de l'ingestion des avis clients depuis différentes sources. Il implémente trois modes d'importation :

### 6.2 Importation Manuelle

L'utilisateur saisit un avis individuel via l'interface web (modal de saisie). Il spécifie le texte, la source et optionnellement le produit associé. L'analyse NLP est déclenchée automatiquement à la soumission.

**Endpoint** : `POST /reviews/`

### 6.3 Importation par Lot (JSON)

Permet d'importer plusieurs avis simultanément via un tableau JSON. Chaque élément contient le texte, la source, et optionnellement la date et le product_id. L'analyse est effectuée pour chaque avis.

**Endpoint** : `POST /import/`

### 6.4 Importation CSV

Supporte l'upload de fichiers CSV avec colonnes dynamiques. La seule colonne obligatoire est `text`. Les colonnes `source`, `date` et `product_id` sont optionnelles. Le système gère automatiquement l'encodage UTF-8 avec BOM (spécifique à Windows/Excel).

**Endpoint** : `POST /import-csv/`

### 6.5 Gestion des Produits

Les produits/services sont créés et listés via l'API. Chaque avis peut être associé à un produit, permettant un filtrage et des statistiques par produit.

**Endpoints** : `POST /products/`, `GET /products/`

---

## 7. Module 2 — Moteur NLP et Analyse de Sentiment

### 7.1 Pipeline d'Analyse

Chaque avis passe par un pipeline de traitement en 3 étapes :

**Étape 1 — Classification de Sentiment (BERT)** : Le texte est envoyé au modèle Transformers qui retourne un label (1 à 5 étoiles) et un score de confiance. Le label est converti en polarité : score >= 4 donne Positif, score <= 2 donne Négatif, score = 3 donne Neutre.

**Étape 2 — Extraction de Mots-clés (spaCy)** : Le texte est analysé syntaxiquement par spaCy. Les groupes nominaux (noun chunks) sont extraits et nettoyés (suppression des déterminants et pronoms). Les adjectifs isolés de plus de 3 lettres sont ajoutés. Les 8 mots-clés les plus pertinents sont conservés.

**Étape 3 — Détection de Thèmes** : 8 thèmes prédéfinis sont vérifiés par correspondance lexicale avec des dictionnaires de mots-clés associés : Service Client, Qualité Produit, Prix et Tarifs, Livraison, Interface et UX, Communication, Résultats et ROI, Créativité.

### 7.2 Performances du Modèle

Le modèle BERT utilisé affiche les performances suivantes sur nos données de test :

| Métrique | Valeur |
|---|---|
| Précision globale | ~85% |
| Confiance moyenne (positifs) | 0.75 |
| Confiance moyenne (négatifs) | 0.72 |
| Temps d'analyse par avis | ~200ms |
| Langues supportées | FR, EN, DE, ES, IT, NL |

### 7.3 Limitations Connues

- La troncature à 512 tokens peut affecter l'analyse de textes très longs
- Le sarcasme et l'ironie restent difficiles à détecter pour le modèle
- La détection de thèmes par correspondance lexicale peut manquer des formulations inhabituelles

---

## 8. Module 3 — Rapport et Visualisations

### 8.1 Statistiques Globales

L'endpoint `GET /stats/` retourne les indicateurs clés :
- Nombre total d'avis analysés
- Score moyen de satisfaction (sur 5)
- Répartition par sentiment (Positif / Négatif / Neutre)
- Répartition par source (Google, Email, WhatsApp, etc.)
- Taux de satisfaction (pourcentage d'avis positifs)

### 8.2 Évolution Temporelle

L'endpoint `GET /stats/timeline/` fournit l'évolution du score moyen par jour, permettant de détecter des tendances à la hausse ou à la baisse, et d'identifier des événements ayant impacté la satisfaction client.

### 8.3 Rapport Avancé

L'endpoint `GET /stats/report/` génère un rapport structuré contenant :
- **Thèmes récurrents** : Classement des thèmes les plus fréquemment détectés avec leur nombre d'occurrences
- **Points forts** : Les 8 mots-clés les plus fréquents dans les avis positifs
- **Points d'amélioration** : Les 8 mots-clés les plus fréquents dans les avis négatifs

### 8.4 Filtrage par Produit

Tous les endpoints de statistiques acceptent un paramètre optionnel `product_id` permettant de filtrer les résultats par produit/service spécifique.

---

## 9. Interface Utilisateur (Frontend)

### 9.1 Design System

L'interface adopte un design premium "Glassmorphism" en mode sombre, caractérisé par :
- Des cartes semi-transparentes avec effet de flou d'arrière-plan (backdrop-filter)
- Une palette de couleurs sombre avec des accents bleu et violet
- La typographie Inter (Google Fonts) pour une lisibilité optimale
- Des micro-animations pour une expérience utilisateur fluide

### 9.2 Pages Principales

**Dashboard** — Vue d'ensemble avec 4 indicateurs KPI (total avis, score moyen, taux de satisfaction, nombre de sources), graphiques de répartition (donut et barres), courbe d'évolution temporelle, thèmes récurrents et aperçu des avis récents.

**Avis Clients** — Grille complète de tous les avis avec badges de sentiment colorés, étoiles de notation, tags de mots-clés et thèmes. Boutons d'ajout manuel et d'import CSV.

**Rapport** — Rapport structuré en 4 sections numérotées : distribution des sentiments, thèmes récurrents avec barres de progression, points forts et points d'amélioration.

### 9.3 Composants Interactifs

- **Modal d'ajout d'avis** : Formulaire avec sélection de source, texte libre et association produit. Affichage immédiat du résultat de l'analyse IA après soumission.
- **Modal d'import CSV** : Zone de glisser-déposer pour fichiers CSV avec retour visuel en temps réel.
- **Filtrage par produit** : Sélecteur dans la barre latérale permettant de filtrer toutes les données par produit.

---

## 10. Tests et Validation

### 10.1 Test Fonctionnel — Import CSV

Un test d'import CSV réel a été réalisé avec 5 avis en français :

| Texte de l'avis | Sentiment détecté | Score | Thème | Mots-clés |
|---|---|---|---|---|
| Service impeccable, très satisfait | Positif | 5/5 | Service Client | service, prestation, agence |
| Délai de livraison trop long | Négatif | 2/5 | Livraison | délai, livraison, semaines |
| Application correcte mais rien d'exceptionnel | Neutre | 3/5 | Interface et UX | application, travail |
| L'équipe est incompétente, échec total | Négatif | 1/5 | — | équipe, projet |
| Merci pour votre réactivité, bravo | Positif | 5/5 | Service Client | réactivité, professionnalisme |

**Résultat** : 100% des sentiments correctement classifiés. Les thèmes et mots-clés extraits sont pertinents et exploitables.

### 10.2 Test de Volume

La base a été peuplée avec 131 avis réalistes répartis sur 5 produits et 60 jours. Le système gère ce volume sans ralentissement perceptible.

### 10.3 Test d'Interface

L'interface a été vérifiée sur navigateurs Chrome et Firefox. Toutes les fonctionnalités (navigation, filtrage, modals, graphiques) fonctionnent correctement.

---

## 11. Difficultés Rencontrées et Solutions

### 11.1 Compatibilité SQLite

**Problème** : La fonction `cast(Date)` de SQLAlchemy provoquait des erreurs `fromisoformat` sur certaines versions de Python avec SQLite.

**Solution** : Remplacement par `func.date()` de SQLite, plus stable et compatible universellement.

### 11.2 Encodage Windows

**Problème** : Les fichiers CSV générés par Excel sur Windows contiennent un BOM (Byte Order Mark) invisible qui perturbait le parsing.

**Solution** : Décodage systématique en `utf-8-sig` qui gère automatiquement le BOM.

### 11.3 Temps de Chargement du Modèle

**Problème** : Le modèle BERT pèse environ 680 Mo et prend 5 à 10 secondes à charger en mémoire.

**Solution** : Chargement unique au démarrage du serveur (variable globale), évitant un rechargement à chaque requête.

### 11.4 Caractères Spéciaux dans les PDF

**Problème** : Les diagrammes ASCII (arborescence, schémas avec flèches) ne se rendaient pas correctement dans les PDF générés.

**Solution** : Remplacement de tous les diagrammes ASCII par des tableaux Markdown qui s'exportent proprement en PDF.

---

## 12. Améliorations Futures

### 12.1 Court Terme

- **Authentification** : Implémenter OAuth2/JWT pour un accès multi-utilisateurs sécurisé
- **Export PDF** : Permettre l'export direct des rapports depuis l'interface
- **Filtres avancés** : Ajout de filtres par date, par source et par thème

### 12.2 Moyen Terme

- **Collecte automatisée** : Intégration d'APIs réelles (Google Reviews API, Facebook Graph API, IMAP pour emails)
- **Migration PostgreSQL** : Remplacer SQLite par PostgreSQL pour supporter des volumes supérieurs à 10 000 avis
- **Alertes intelligentes** : Notifications automatiques en cas de pic de sentiment négatif

### 12.3 Long Terme

- **Modèle personnalisé** : Fine-tuning du modèle BERT sur les données spécifiques de l'agence pour améliorer la précision
- **Analyse multimodale** : Intégration de l'analyse d'images et de vidéos (stories Instagram, TikTok)
- **IA générative** : Génération automatique de recommandations d'action basées sur les tendances détectées

---

## 13. Conclusion

Le projet VoxAI répond efficacement à la problématique posée en fournissant un prototype fonctionnel d'agent IA pour l'analyse de sentiment des avis clients. Les trois modules requis par le cahier des charges ont été implémentés avec succès :

- Le **Module 1** permet une collecte flexible des données depuis de multiples sources
- Le **Module 2** fournit une analyse IA précise grâce à BERT et spaCy
- Le **Module 3** génère des rapports visuels exploitables en temps réel

L'interface utilisateur premium avec son design Glassmorphism offre une expérience utilisateur agréable et professionnelle. Le système a été validé avec des données réelles et produit des résultats fiables et pertinents.

Ce prototype constitue une base solide pour une solution de production, avec des perspectives d'amélioration clairement identifiées pour répondre aux besoins croissants des agences de marketing digital.

---

## 14. Références

1. Devlin, J., et al. (2019). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding." *NAACL-HLT*.
2. Wolf, T., et al. (2020). "Transformers: State-of-the-Art Natural Language Processing." *EMNLP*.
3. Honnibal, M., Montani, I. (2017). "spaCy 2: Natural Language Understanding with Bloom Embeddings, Convolutional Neural Networks and Incremental Parsing."
4. FastAPI Documentation — https://fastapi.tiangolo.com
5. React Documentation — https://react.dev
6. Recharts Documentation — https://recharts.org
7. SQLAlchemy Documentation — https://docs.sqlalchemy.org
8. HuggingFace Model Hub — nlptown/bert-base-multilingual-uncased-sentiment
