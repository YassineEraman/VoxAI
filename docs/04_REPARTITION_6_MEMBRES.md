# Répartition des Tâches pour 6 Personnes (VoxAI)

Le projet initial prévoyait 5 personnes. Pour une équipe de 6 personnes, voici la répartition optimale des rôles, avec pour chacun **les fichiers exacts dont il est responsable**. Ainsi, chaque membre pourra faire son propre `git push` sur GitHub pour montrer sa contribution.

---

### 1. Membre 1 : Chef de Projet & Déploiement (Project Manager)
**Rôle :** Coordination de l'équipe, rédaction de la documentation, et configuration de l'environnement global du projet.
**Fichiers à "pusher" sur GitHub :**
- `README.md` (Présentation du projet)
- `requirements.txt` (Dépendances Python)
- Dossier `docs/` (Tous les rapports Markdown et PDF)
- `.gitignore`

### 2. Membre 2 : Data Engineer (Ingénierie des données)
**Rôle :** Conception de la structure de la base de données SQLite et création des scripts d'injection de fausses données pour tester l'application.
**Fichiers à "pusher" sur GitHub :**
- `backend/database.py` (Schéma SQLAlchemy, modèles de données)
- `seed_data.py` (Générateur de fausses données)
- `test_upload.csv` (Fichier de test)

### 3. Membre 3 : Ingénieur IA & Machine Learning (Modèles)
**Rôle :** Développement du cœur de l'intelligence artificielle. Connexion au modèle CamemBERT/HuggingFace et extraction des mots-clés/thèmes.
**Fichiers à "pusher" sur GitHub :**
- `backend/nlp_engine.py` (Logique de l'analyse de sentiment et NLP)
- `requirements.txt` (Gestion des librairies IA)

### 4. Membre 4 : Ingénieur IA (Intégration & Automatisation)
**Rôle :** Validation des modèles NLP, tests d'importation CSV et automatisation de la génération des rapports d'analyse au format PDF.
**Fichiers à "pusher" sur GitHub :**
- `test_csv_upload.py` (Script de test de l'analyse IA via CSV)
- `convert_to_pdf.py` (Script de génération automatique des rapports)

### 5. Membre 5 : Développeur Backend (API & Routes)
**Rôle :** Création du serveur FastAPI. Il s'occupe de créer les "routes" (endpoints) pour envoyer les données au frontend, gérer la pagination, et le script complexe d'importation CSV.
**Fichiers à "pusher" sur GitHub :**
- `backend/main.py` (Contrôleurs, API REST, Logique d'import CSV)

### 6. Membre 6 : Développeur Frontend (React & Interface)
**Rôle :** Mise en place du socle visuel de l'application, création du design "Glassmorphism", intégration fine des graphiques (Recharts) et gestion des états React.
**Fichiers à "pusher" sur GitHub :**
- Tout le dossier `frontend-premium/` (Interface utilisateur, CSS, et composants interactifs)

---

### 💡 Comment procéder sur GitHub ?
Pour que le travail de chacun soit visible sur GitHub, **chaque personne devra, sur son propre ordinateur** :
1. Cloner le projet (`git clone https://github.com/YassineEraman/VoxAI.git`)
2. Ajouter ou modifier **uniquement ses propres fichiers** (ceux listés ci-dessus)
3. Faire : `git add .`
4. Faire : `git commit -m "Ajout de la partie de [Son Prénom]"`
5. Faire : `git push`
