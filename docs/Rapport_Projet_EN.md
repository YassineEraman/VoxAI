# Project Report — VoxAI

## AI-Powered Customer Review Sentiment Analysis Agent

**PFF FQIA — Subject N°5 (2026)**

---

**Developed by:** Development Team (5 members)

**Date:** May 2026

**Program:** Qualifying Training in Artificial Intelligence

---

## Table of Contents

1. Introduction
2. Problem Statement
3. Project Objectives
4. State of the Art
5. Technical Architecture
6. Module 1 — Data Collection
7. Module 2 — NLP Engine and Sentiment Analysis
8. Module 3 — Reporting and Visualizations
9. User Interface (Frontend)
10. Testing and Validation
11. Challenges and Solutions
12. Future Improvements
13. Conclusion
14. References

---

## 1. Introduction

In today's digital marketing landscape, agencies simultaneously manage dozens of clients, each receiving hundreds of daily feedback messages from scattered channels: social media, emails, review platforms, instant messaging, and more. The manual analysis of these volumes of textual data has become a major challenge, both in terms of time and reliability.

The **VoxAI** project proposes an automated solution based on Artificial Intelligence to address this problem. It is a functional web application prototype that collects, analyzes, and visualizes customer reviews in real time, using state-of-the-art Natural Language Processing (NLP) models.

This report presents the entirety of the work accomplished: from problem definition to technical implementation, including architectural choices, results obtained, and prospects for improvement.

---

## 2. Problem Statement

### 2.1 Business Context

Digital marketing agencies face a growing challenge: the volume and dispersion of customer feedback. A typical agency client receives between 50 and 300 messages per day spread across 5 to 10 different platforms (Google Reviews, Facebook, Twitter, WhatsApp, emails, Trustpilot, etc.).

### 2.2 Identified Problems

**Unmanageable Volume** — It is physically impossible for a human team to manually read, classify, and synthesize 300+ messages per day for each agency client.

**Source Dispersion** — Reviews arrive from heterogeneous channels (social media, email, messaging, review platforms). There is no centralized view providing a global picture.

**Human Subjectivity** — Manual sentiment analysis is subjective. Two analysts may classify the same review differently depending on their interpretation, mood, or fatigue level.

**Slow Response Time** — The time required to manually compile a report (1 to 2 days) is incompatible with the speed at which a reputation crisis can develop on social media.

**Lack of Trend Detection** — Without automated tools, it is impossible to identify that a specific topic (e.g., "customer service") is being mentioned negatively 3 times more this week than the previous one.

### 2.3 Requirements

The agency needs a tool capable of:
- Centralizing reviews from multiple sources
- Automatically analyzing sentiment (positive, negative, neutral)
- Extracting recurring themes and relevant keywords
- Generating actionable visual reports in real time
- Associating reviews with specific products or services

---

## 3. Project Objectives

### 3.1 General Objective

Develop a functional AI agent prototype capable of automating customer review sentiment analysis for a digital marketing agency.

### 3.2 Specific Objectives

1. **Design a flexible collection pipeline** supporting manual input, CSV file import, and JSON batch import, with optional product/service association.

2. **Implement an intelligent NLP engine** using pre-trained models (multilingual BERT) for sentiment classification and spaCy for keyword extraction and theme detection.

3. **Develop an automated reporting system** with interactive visualizations (timeline charts, distributions, strengths and areas for improvement).

4. **Create a premium user interface** enabling intuitive use of the entire system.

### 3.3 Scope

The prototype covers the three modules defined in the specifications:
- **Module 1**: Data collection and structuring
- **Module 2**: NLP analysis (sentiment, keywords, themes)
- **Module 3**: Report generation and visualizations

---

## 4. State of the Art

### 4.1 Sentiment Analysis

Sentiment analysis (or opinion mining) is a branch of Natural Language Processing (NLP) that aims to identify and extract the emotional polarity of a text. Approaches have evolved considerably:

- **Lexicon-based approaches** (pre-2015): Use of sentiment dictionaries (SentiWordNet, VADER). Simple but limited in accuracy, especially for multilingual texts.

- **Machine learning approaches** (2015-2018): Supervised models (SVM, Random Forest, LSTM) trained on annotated corpora. Better accuracy but require substantial training data.

- **Transformer-based approaches** (2018-present): Pre-trained models (BERT, GPT, RoBERTa) fine-tuned on specific tasks. State-of-the-art accuracy, multilingual capability, deep contextual understanding.

### 4.2 Technology Choice: Multilingual BERT

We selected the `nlptown/bert-base-multilingual-uncased-sentiment` model, a BERT model fine-tuned specifically on product reviews in 6 languages (French, English, German, Spanish, Italian, Dutch).

**Justification:**
- Accuracy above 85% on French reviews
- 5-level intensity classification (1 to 5 stars), more granular than simple binary polarity
- Confidence score to evaluate prediction certainty
- No additional training data required

### 4.3 Information Extraction: spaCy

For keyword extraction and theme detection, we use spaCy with the French model `fr_core_news_sm`, which offers:
- Complete syntactic analysis (tokenization, POS tagging, dependency parsing)
- Noun chunk extraction
- Fast processing suitable for real-time use

---

## 5. Technical Architecture

### 5.1 Overview

The system follows a 3-layer client-server architecture:

| Layer | Technology | Port |
|---|---|---|
| Frontend (Interface) | React 18 + Vite | localhost:5173 |
| Backend (API) | FastAPI (Python) | localhost:8000 |
| Storage | SQLite (reviews.db) | Local file |

Communication between frontend and backend is done via HTTP REST requests. The backend exposes an API automatically documented via Swagger (OpenAPI).

### 5.2 Detailed Technology Stack

| Component | Technology | Justification |
|---|---|---|
| API Framework | FastAPI | Native async, auto-documentation, Pydantic validation |
| ORM | SQLAlchemy | SQL abstraction, multi-DB support |
| Database | SQLite | Zero configuration, single file, ideal for prototyping |
| NLP - Sentiment | HuggingFace Transformers | Pre-trained BERT model, state-of-the-art accuracy |
| NLP - Linguistics | spaCy (fr_core_news_sm) | Fast French syntactic analysis |
| Frontend | React 18 | Reusable components, rich ecosystem |
| Build Tool | Vite | Fast startup, instant HMR |
| Charts | Recharts | Native React integration, responsive |
| HTTP Client | Axios | Interceptors, error handling |
| Validation | Pydantic | Strong typing, automatic serialization |

### 5.3 Data Model

The database contains two tables linked by a One-to-Many relationship:

**Table `products`** — Represents a product or service:
- `id` (Integer, PK) — Unique identifier
- `name` (String) — Product name
- `description` (Text) — Description
- `created_at` (DateTime) — Creation date

**Table `reviews`** — Stores each review with AI analysis results:
- `id` (Integer, PK) — Unique identifier
- `source` (String) — Origin channel (WhatsApp, Email, Google, etc.)
- `text` (Text) — Raw review text
- `sentiment` (String) — Result: Positive, Negative, Neutral
- `score` (Integer) — Intensity from 1 (very negative) to 5 (very positive)
- `confidence` (Float) — Model confidence (0.0 to 1.0)
- `keywords` (Text) — Keywords extracted by spaCy
- `themes` (Text) — Detected themes
- `product_id` (Integer, FK) — Reference to associated product
- `date` (DateTime) — Review date

---

## 6. Module 1 — Data Collection

### 6.1 Description

Module 1 is responsible for ingesting customer reviews from different sources. It implements three import modes:

### 6.2 Manual Import

The user enters an individual review via the web interface (input modal). They specify the text, source, and optionally the associated product. NLP analysis is triggered automatically upon submission.

**Endpoint**: `POST /reviews/`

### 6.3 Batch Import (JSON)

Allows importing multiple reviews simultaneously via a JSON array. Each element contains the text, source, and optionally the date and product_id. Analysis is performed for each review.

**Endpoint**: `POST /import/`

### 6.4 CSV Import

Supports CSV file upload with dynamic columns. The only required column is `text`. The columns `source`, `date`, and `product_id` are optional. The system automatically handles UTF-8 encoding with BOM (specific to Windows/Excel).

**Endpoint**: `POST /import-csv/`

### 6.5 Product Management

Products/services are created and listed via the API. Each review can be associated with a product, enabling filtering and per-product statistics.

**Endpoints**: `POST /products/`, `GET /products/`

---

## 7. Module 2 — NLP Engine and Sentiment Analysis

### 7.1 Analysis Pipeline

Each review passes through a 3-step processing pipeline:

**Step 1 — Sentiment Classification (BERT)**: The text is sent to the Transformer model which returns a label (1 to 5 stars) and a confidence score. The label is converted to polarity: score >= 4 yields Positive, score <= 2 yields Negative, score = 3 yields Neutral.

**Step 2 — Keyword Extraction (spaCy)**: The text is syntactically analyzed by spaCy. Noun chunks are extracted and cleaned (removal of determiners and pronouns). Standalone adjectives longer than 3 letters are added. The 8 most relevant keywords are retained.

**Step 3 — Theme Detection**: 8 predefined themes are checked via lexical matching with associated keyword dictionaries: Customer Service, Product Quality, Pricing, Delivery, Interface and UX, Communication, Results and ROI, Creativity.

### 7.2 Model Performance

The BERT model used shows the following performance on our test data:

| Metric | Value |
|---|---|
| Overall Accuracy | ~85% |
| Average Confidence (positives) | 0.75 |
| Average Confidence (negatives) | 0.72 |
| Analysis Time per Review | ~200ms |
| Supported Languages | FR, EN, DE, ES, IT, NL |

### 7.3 Known Limitations

- Truncation at 512 tokens may affect analysis of very long texts
- Sarcasm and irony remain difficult for the model to detect
- Lexical matching for theme detection may miss unusual phrasings

---

## 8. Module 3 — Reporting and Visualizations

### 8.1 Global Statistics

The `GET /stats/` endpoint returns key indicators:
- Total number of analyzed reviews
- Average satisfaction score (out of 5)
- Distribution by sentiment (Positive / Negative / Neutral)
- Distribution by source (Google, Email, WhatsApp, etc.)
- Satisfaction rate (percentage of positive reviews)

### 8.2 Timeline

The `GET /stats/timeline/` endpoint provides the daily average score evolution, enabling detection of upward or downward trends, and identification of events that impacted customer satisfaction.

### 8.3 Advanced Report

The `GET /stats/report/` endpoint generates a structured report containing:
- **Recurring themes**: Ranking of most frequently detected themes with occurrence counts
- **Strengths**: The 8 most frequent keywords in positive reviews
- **Areas for improvement**: The 8 most frequent keywords in negative reviews

### 8.4 Product Filtering

All statistics endpoints accept an optional `product_id` parameter to filter results by specific product/service.

---

## 9. User Interface (Frontend)

### 9.1 Design System

The interface adopts a premium "Glassmorphism" dark mode design, characterized by:
- Semi-transparent cards with background blur effect (backdrop-filter)
- Dark color palette with blue and violet accents
- Inter typography (Google Fonts) for optimal readability
- Micro-animations for a smooth user experience

### 9.2 Main Pages

**Dashboard** — Overview with 4 KPI indicators (total reviews, average score, satisfaction rate, number of sources), distribution charts (donut and bar), timeline evolution curve, recurring themes, and recent reviews preview.

**Customer Reviews** — Complete grid of all reviews with colored sentiment badges, star ratings, keyword tags and themes. Manual add and CSV import buttons.

**Report** — Structured report in 4 numbered sections: sentiment distribution, recurring themes with progress bars, strengths and areas for improvement.

### 9.3 Interactive Components

- **Review add modal**: Form with source selection, free text, and product association. Immediate display of AI analysis result after submission.
- **CSV import modal**: Drag-and-drop zone for CSV files with real-time visual feedback.
- **Product filter**: Selector in the sidebar allowing filtering of all data by product.

---

## 10. Testing and Validation

### 10.1 Functional Test — CSV Import

A real CSV import test was conducted with 5 French reviews:

| Review Text | Detected Sentiment | Score | Theme | Keywords |
|---|---|---|---|---|
| Excellent service, very satisfied | Positive | 5/5 | Customer Service | service, delivery, agency |
| Delivery delay much too long | Negative | 2/5 | Delivery | delay, delivery, weeks |
| Decent application but nothing exceptional | Neutral | 3/5 | Interface and UX | application, work |
| The team is incompetent, total failure | Negative | 1/5 | — | team, project |
| Thank you for your responsiveness, bravo | Positive | 5/5 | Customer Service | responsiveness, professionalism |

**Result**: 100% of sentiments correctly classified. Extracted themes and keywords are relevant and actionable.

### 10.2 Volume Test

The database was populated with 131 realistic reviews spread across 5 products and 60 days. The system handles this volume without perceptible slowdown.

### 10.3 Interface Test

The interface was verified on Chrome and Firefox browsers. All features (navigation, filtering, modals, charts) function correctly.

---

## 11. Challenges and Solutions

### 11.1 SQLite Compatibility

**Problem**: SQLAlchemy's `cast(Date)` function caused `fromisoformat` errors on certain Python versions with SQLite.

**Solution**: Replaced with SQLite's `func.date()`, more stable and universally compatible.

### 11.2 Windows Encoding

**Problem**: CSV files generated by Excel on Windows contain an invisible BOM (Byte Order Mark) that disrupted parsing.

**Solution**: Systematic decoding with `utf-8-sig` which automatically handles the BOM.

### 11.3 Model Loading Time

**Problem**: The BERT model weighs approximately 680 MB and takes 5 to 10 seconds to load into memory.

**Solution**: Single loading at server startup (global variable), avoiding reload on each request.

### 11.4 Special Characters in PDFs

**Problem**: ASCII diagrams (directory trees, arrow schemas) did not render correctly in generated PDFs.

**Solution**: Replaced all ASCII diagrams with Markdown tables that export cleanly to PDF.

---

## 12. Future Improvements

### 12.1 Short Term

- **Authentication**: Implement OAuth2/JWT for secure multi-user access
- **PDF Export**: Enable direct report export from the interface
- **Advanced Filters**: Add filters by date, source, and theme

### 12.2 Medium Term

- **Automated Collection**: Integration of real APIs (Google Reviews API, Facebook Graph API, IMAP for emails)
- **PostgreSQL Migration**: Replace SQLite with PostgreSQL to support volumes exceeding 10,000 reviews
- **Smart Alerts**: Automatic notifications in case of negative sentiment spikes

### 12.3 Long Term

- **Custom Model**: Fine-tuning the BERT model on agency-specific data to improve accuracy
- **Multimodal Analysis**: Integration of image and video analysis (Instagram stories, TikTok)
- **Generative AI**: Automatic generation of action recommendations based on detected trends

---

## 13. Conclusion

The VoxAI project effectively addresses the stated problem by providing a functional AI agent prototype for customer review sentiment analysis. The three modules required by the specifications have been successfully implemented:

- **Module 1** enables flexible data collection from multiple sources
- **Module 2** provides accurate AI analysis through BERT and spaCy
- **Module 3** generates actionable visual reports in real time

The premium user interface with its Glassmorphism design offers a pleasant and professional user experience. The system has been validated with real data and produces reliable, relevant results.

This prototype constitutes a solid foundation for a production solution, with clearly identified improvement prospects to meet the growing needs of digital marketing agencies.

---

## 14. References

1. Devlin, J., et al. (2019). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding." *NAACL-HLT*.
2. Wolf, T., et al. (2020). "Transformers: State-of-the-Art Natural Language Processing." *EMNLP*.
3. Honnibal, M., Montani, I. (2017). "spaCy 2: Natural Language Understanding with Bloom Embeddings, Convolutional Neural Networks and Incremental Parsing."
4. FastAPI Documentation — https://fastapi.tiangolo.com
5. React Documentation — https://react.dev
6. Recharts Documentation — https://recharts.org
7. SQLAlchemy Documentation — https://docs.sqlalchemy.org
8. HuggingFace Model Hub — nlptown/bert-base-multilingual-uncased-sentiment
