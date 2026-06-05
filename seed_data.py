"""Seed 10x — ~240 avis realistes en francais sur 60 jours."""
import requests, time, random
from datetime import datetime, timedelta

API = "http://127.0.0.1:8000"

PRODUCTS = [
    {"name": "Campagne SEO Premium", "description": "Optimisation moteurs de recherche"},
    {"name": "Gestion Reseaux Sociaux", "description": "Community management et contenu"},
    {"name": "Application Mobile E-commerce", "description": "App de vente iOS/Android"},
    {"name": "Campagne Google Ads", "description": "Publicite payante sur Google"},
    {"name": "Refonte Site Web", "description": "Redesign et developpement du site vitrine"},
]

T = [  # (source, text, product_id)
    # SEO (pid=1)
    ("Google","Grace a leur campagne SEO, notre trafic organique a augmente de 45% en trois mois. Equipe tres professionnelle.",1),
    ("Email","Je suis decu des resultats de la campagne SEO. Apres 2 mois, aucun changement visible sur notre positionnement.",1),
    ("WhatsApp","Merci pour le travail sur notre referencement. Les premiers resultats sont encourageants et le service client est reactif.",1),
    ("Google","Tarifs trop eleves pour un service SEO basique. Communication correcte mais resultats decevants.",1),
    ("Facebook","Notre site est passe de la page 5 a la page 1 sur plusieurs mots-cles strategiques. Investissement rentabilise!",1),
    ("Email","Le suivi est correct, equipe repond vite. Resultats moyens pour le moment mais on reste optimistes.",1),
    ("Twitter","Pire experience SEO de ma carriere. Aucune transparence sur les actions menees, promesses non tenues.",1),
    ("Google","Excellent travail sur notre campagne de referencement naturel. Audit initial tres complet et recommandations pertinentes.",1),
    ("WhatsApp","On voit enfin les resultats apres 4 mois. Le trafic a double et les demandes de devis aussi. Merci!",1),
    ("Email","L'equipe SEO manque de reactivite. Il faut toujours relancer pour avoir un retour sur les actions en cours.",1),
    ("Google","Tres satisfait du suivi SEO mensuel. Les rapports sont detailles et les objectifs sont clairs. Bravo.",1),
    ("Facebook","Le referencement de notre site a explose depuis qu'on travaille avec cette agence. ROI exceptionnel.",1),
    ("Twitter","Service SEO moyen. Quelques ameliorations mais rien de spectaculaire pour le prix demande.",1),
    ("Email","L'optimisation technique du site a ete faite rapidement et efficacement. Bon travail de l'equipe.",1),
    ("Google","Decu par le manque de communication. On ne sait jamais ou en est la campagne SEO.",1),
    ("WhatsApp","Les mots-cles sont bien choisis et le contenu optimise est de qualite. Bon investissement.",1),
    # Reseaux Sociaux (pid=2)
    ("WhatsApp","L'equipe qui gere nos reseaux sociaux est incroyable! Visuels creatifs, textes accrocheurs. Engagement triple.",2),
    ("Email","Baisse d'engagement depuis le changement de community manager. Publications manquent de creativite.",2),
    ("Facebook","Super contenu cree pour notre page. Stories originales et nos clients adorent. Rapport mensuel clair.",2),
    ("Google","Gestion des reseaux sociaux correcte mais sans plus. Prix raisonnable mais attendait plus d'originalite.",2),
    ("Twitter","Merci pour la gestion de notre compte! Interactions avec notre communaute beaucoup plus fluides.",2),
    ("WhatsApp","Le planning editorial n'est jamais respecte. Promis 5 publications par semaine, on en a 2 max.",2),
    ("Email","Qualite du travail de votre equipe social media remarquable. Campagnes pub Facebook excellent ROI.",2),
    ("Google","Les visuels crees pour Instagram sont magnifiques. Notre feed est devenu une reference dans le secteur.",2),
    ("Facebook","On a gagne 5000 abonnes en 2 mois grace a votre strategie. Les contenus sont vraiment engageants.",2),
    ("Email","Les reponses aux commentaires sont trop lentes. Nos clients se plaignent du delai de reponse.",2),
    ("Twitter","Bonne strategie editoriale mais les statistiques ne sont pas assez detaillees dans les rapports.",2),
    ("WhatsApp","Votre equipe a su capter l'essence de notre marque. Les publications sont toujours pertinentes.",2),
    ("Google","Le community management est reactif et professionnel. Bonne gestion des commentaires negatifs.",2),
    ("Email","Manque de creativite dans les recentes publications. On dirait du contenu copie-colle.",2),
    ("Facebook","Les campagnes publicitaires ciblees ont genere un trafic qualifie impressionnant vers notre site.",2),
    ("Twitter","Bilan mitige. Bons visuels mais strategie peu adaptee a notre secteur d'activite.",2),
    # App Mobile (pid=3)
    ("Google","L'application mobile est magnifique et tres intuitive. Navigation fluide, design moderne. Ventes +30%.",3),
    ("Email","L'application plante regulierement sur Android. Panier se vide tout seul. Inacceptable pour du e-commerce.",3),
    ("WhatsApp","Application correcte dans l'ensemble. Interface jolie mais temps de chargement un peu long.",3),
    ("Google","Excellente application! Processus de commande simple et rapide. Support technique repond en moins de 24h.",3),
    ("Facebook","Application e-commerce catastrophique. Bugs partout, interface confuse, service client inexistant.",3),
    ("Twitter","Mise a jour recue. Nouveaux filtres de recherche pratiques. Mode sombre ne fonctionne pas encore.",3),
    ("Email","Travail remarquable sur notre boutique en ligne. Experience utilisateur fluide et performances au RDV.",3),
    ("Google","L'app se ferme toute seule quand on ajoute plus de 5 articles au panier. Tres frustrant.",3),
    ("WhatsApp","Super application! Mes clients adorent commander depuis leur telephone. Interface tres claire.",3),
    ("Email","Le systeme de notification push est tres efficace. Les clients reviennent plus souvent sur l'app.",3),
    ("Facebook","Design de l'application magnifique mais les temps de reponse du serveur sont catastrophiques.",3),
    ("Google","Meilleure application e-commerce que j'ai utilisee. Le checkout en un clic est genial.",3),
    ("Twitter","Bug critique sur le paiement par carte. Impossible de finaliser une commande depuis 3 jours.",3),
    ("WhatsApp","L'integration avec notre ERP fonctionne parfaitement. L'equipe technique est tres competente.",3),
    ("Email","Nous avons perdu 15% de nos commandes a cause des bugs de l'application. Correction urgente requise.",3),
    ("Google","Application tres bien concue. Le catalogue produit est magnifique et la recherche est performante.",3),
    # Google Ads (pid=4)
    ("Google","La campagne Google Ads a genere un retour sur investissement de 400%. Ciblage parfait.",4),
    ("Email","Budget publicitaire gaspille. Les annonces ne ciblent pas les bonnes audiences. Resultats nuls.",4),
    ("WhatsApp","Les performances de la campagne Ads sont impressionnantes. CPC tres bas et taux de conversion eleve.",4),
    ("Google","L'equipe Google Ads est tres reactive. Ajustements rapides et communication transparente.",4),
    ("Facebook","Campagne Ads decevante. Le cout par acquisition est bien trop eleve par rapport a nos objectifs.",4),
    ("Email","Excellent travail sur les annonces search. Les extensions d'annonce sont bien optimisees.",4),
    ("Twitter","Les rapports de campagne sont clairs et detailles. On comprend exactement ou va notre budget.",4),
    ("WhatsApp","Le remarketing fonctionne tres bien. On recupere beaucoup de paniers abandonnes grace a vos annonces.",4),
    ("Google","Mauvaise gestion du budget. On a depense 3000 euros sans aucune conversion significative.",4),
    ("Email","La strategie d'encheres automatiques a reduit notre CPC de 35%. Excellent travail d'optimisation.",4),
    ("Facebook","Les annonces display ne generent que des clics accidentels. Qualite du trafic tres mauvaise.",4),
    ("Twitter","Campagne Shopping tres performante. Nos produits apparaissent en premiere position sur Google.",4),
    ("Google","L'equipe a su identifier les mots-cles les plus rentables. Notre chiffre d'affaires a augmente de 25%.",4),
    ("WhatsApp","Trop d'erreurs dans les parametres de campagne. Il a fallu tout recorriger nous-memes.",4),
    ("Email","Les tests A/B sur les annonces ont permis d'ameliorer le taux de clic de 40%. Bravo.",4),
    ("Google","Bonne campagne globalement mais le suivi pourrait etre plus frequent. Un point hebdo serait ideal.",4),
    # Site Web (pid=5)
    ("Google","La refonte de notre site web est superbe. Design moderne, navigation intuitive, temps de chargement rapide.",5),
    ("Email","Le site est joli mais rempli de bugs. Formulaire de contact ne fonctionne pas. Pages cassees sur mobile.",5),
    ("WhatsApp","Tres content du nouveau site! Nos clients trouvent facilement les informations. Taux de rebond en baisse.",5),
    ("Google","La refonte a pris 3 mois de retard. Communication insuffisante sur l'avancement du projet.",5),
    ("Facebook","Le nouveau site web est une pure merveille. Design epure et professionnel. Bravo a l'equipe!",5),
    ("Email","Le site n'est pas responsive sur tablette. Les images sont floues et le menu ne fonctionne pas.",5),
    ("Twitter","Bonne refonte dans l'ensemble. Le blog integre est un vrai plus pour notre strategie de contenu.",5),
    ("WhatsApp","L'integration du chatbot sur le site est tres reussie. Nos clients obtiennent des reponses instantanees.",5),
    ("Google","Le site charge en moins de 2 secondes. L'optimisation performance est vraiment au top.",5),
    ("Email","Manque de creativite dans le design. Le site ressemble a un template generique. Decevant.",5),
    ("Facebook","La section portfolio du site est magnifique. Les animations sont fluides et professionnelles.",5),
    ("Twitter","Le SEO technique du site est excellent. Structure des URLs et balisage parfaits.",5),
    ("Google","Site web tres professionnel mais le CMS choisi est trop complique pour notre equipe.",5),
    ("WhatsApp","L'espace client integre au site fonctionne parfaitement. Interface claire et securisee.",5),
    ("Email","Les fonctionnalites du site sont incompletes. Il manque la moitie des pages prevues dans le cahier des charges.",5),
    ("Google","Excellent travail de developpement. Le site est rapide, securise et parfaitement reference.",5),
    # Avis generaux agence (pid=None)
    ("Google","Agence de marketing digital tres competente. Equipe a l'ecoute et livrables de qualite.",None),
    ("WhatsApp","Service client lent, il faut relancer plusieurs fois. Tarifs non justifies par la qualite.",None),
    ("Email","Partenaire de confiance depuis 2 ans. Toujours de bons conseils et un suivi rigoureux.",None),
    ("Facebook","Agence professionnelle mais un peu chere. Les resultats sont la mais le budget est serre.",None),
    ("Google","Je ne recommande pas cette agence. Promesses non tenues et communication deplorable.",None),
    ("Twitter","Tres bonne experience globale. L'equipe est dynamique et force de proposition.",None),
    ("WhatsApp","L'agence a transforme notre presence en ligne. On est passe de 0 a 10000 visiteurs par mois.",None),
    ("Email","Equipe jeune et motivee mais manque parfois d'experience sur les projets complexes.",None),
    ("Google","Rapport qualite-prix excellent. Les livrables sont toujours livres dans les temps.",None),
    ("Facebook","Changement de chef de projet en cours de route. La transition a ete mal geree.",None),
    ("Twitter","Tres satisfait de la collaboration. L'agence comprend nos enjeux et s'adapte rapidement.",None),
    ("Email","L'agence nous a aide a definir notre strategie digitale. Les resultats parlent d'eux-memes.",None),
    ("Google","Excellente agence! Creatifs, reactifs et toujours a jour sur les dernieres tendances.",None),
    ("WhatsApp","Les reunions de suivi sont bien structurees. On se sent vraiment accompagnes.",None),
    ("Email","Decu par le turnover de l'equipe. On doit reexpliquer le projet a chaque nouveau contact.",None),
    ("Google","L'agence a su nous accompagner dans notre transformation digitale avec brio.",None),
    # Extra positifs varies
    ("Google","Le tableau de bord analytique fourni par l'agence est tres complet. Donnees exploitables.",1),
    ("WhatsApp","Bravo pour la gestion de crise sur nos reseaux. La situation a ete maitrisee en quelques heures.",2),
    ("Email","L'application a recu d'excellents retours de nos utilisateurs. Note moyenne de 4.8 sur le Store.",3),
    ("Facebook","La campagne Ads de Noel a explose tous nos records de vente. +200% par rapport a l'annee derniere.",4),
    ("Google","Le nouveau site web genere 3 fois plus de leads qu'avant la refonte. Excellent investissement.",5),
    # Extra negatifs varies
    ("Email","Le rapport SEO mensuel est incomprehensible. Trop de jargon technique, aucune recommandation claire.",1),
    ("Twitter","Les publications sur nos reseaux contiennent regulierement des fautes d'orthographe. Inadmissible.",2),
    ("WhatsApp","L'application crash systematiquement lors du paiement. On perd des ventes chaque jour.",3),
    ("Google","Budget Google Ads mal optimise. On depense le double pour moitie moins de resultats.",4),
    ("Facebook","Le site web livre ne correspond pas du tout a la maquette validee. Enorme deception.",5),
    # Extra neutres
    ("Email","Les resultats sont conformes aux attentes. Ni plus ni moins. Service standard.",1),
    ("Google","Application fonctionnelle mais sans innovation. Fait le minimum requis.",3),
    ("WhatsApp","Le suivi de campagne est regulier. Les chiffres sont stables sans amelioration notable.",4),
    ("Twitter","Le site web est en ligne et fonctionne. Rien de spectaculaire mais ca fait le job.",5),
    ("Google","Prestation correcte. L'equipe fait son travail sans surprise. Rapport qualite-prix moyen.",None),
    # More detailed reviews
    ("Google","L'audit SEO realise par l'agence a revele des problemes techniques majeurs que personne n'avait detectes. Grace a leurs corrections, notre score PageSpeed est passe de 35 a 92.",1),
    ("Email","Nous avons fait appel a cette agence pour gerer notre presence sur LinkedIn. Les publications sont pertinentes et notre reseau professionnel s'est elargi de 300% en 6 mois.",2),
    ("WhatsApp","L'application mobile developpee integre parfaitement notre systeme de gestion de stock. Les mises a jour sont deployees rapidement et le support est disponible 7j/7.",3),
    ("Facebook","La campagne Google Ads pour le lancement de notre nouveau produit a genere 500 leads qualifies en seulement 2 semaines. Resultats au-dela de nos esperances.",4),
    ("Google","La refonte du site a ete realisee dans les delais et le budget prevu. L'equipe de developpement est tres professionnelle et maitrise les dernieres technologies web.",5),
    ("Email","Le community management de nos 4 reseaux sociaux est gere de maniere coherente. La charte graphique est respectee et le ton editorial est parfaitement adapte.",2),
    ("Twitter","L'application e-commerce a ete livree avec 2 mois de retard et il manquait plusieurs fonctionnalites cles. Le module de suivi de commande ne fonctionne toujours pas correctement.",3),
    ("WhatsApp","Les rapports mensuels de campagne sont tres detailles avec des recommandations actionnables. C'est ce qu'on attend d'une agence professionnelle.",4),
    ("Google","Le site web est magnifique sur desktop mais l'experience sur mobile laisse a desirer. Les boutons sont trop petits et la navigation n'est pas intuitive.",5),
    ("Email","L'equipe SEO a mis en place une strategie de netlinking qui a considerablement ameliore notre autorite de domaine. On est passe de DA 15 a DA 42 en 8 mois.",1),
    # Final batch
    ("Google","Tres decu de la qualite des visuels fournis pour nos reseaux sociaux. On dirait des images stock basiques.",2),
    ("Facebook","L'integration du systeme de paiement Stripe dans l'application a ete realisee impeccablement.",3),
    ("WhatsApp","Campagne Ads performante au debut mais les resultats se sont degrades avec le temps sans ajustement.",4),
    ("Email","Le site web est enfin conforme aux normes d'accessibilite. Les modifications demandees ont ete faites rapidement.",5),
    ("Google","Agence au top! Ils ont su comprendre notre vision et la traduire en actions marketing concretes et mesurables.",None),
    ("Twitter","La strategie de contenu proposee est coherente et bien executee. Les articles de blog sont tres bien rediges.",1),
    ("WhatsApp","L'equipe social media repond a nos demandes en moins d'une heure. C'est un vrai plaisir de travailler avec eux.",2),
    ("Email","L'application necessite des corrections urgentes sur le module de recherche. Les filtres ne fonctionnent pas.",3),
    ("Facebook","Excellente campagne de remarketing. Le taux de conversion des paniers abandonnes a augmente de 60%.",4),
    ("Google","Le blog integre au site genere un trafic organique constant. La strategie de contenu porte ses fruits.",5),
]

def seed():
    print("Attente de l'API...")
    for i in range(15):
        try:
            r = requests.get(f"{API}/")
            if r.status_code == 200:
                print("API disponible!")
                break
        except requests.exceptions.ConnectionError:
            print(f"  tentative {i+1}/15...")
            time.sleep(2)
    else:
        print("API non joignable.")
        return

    print(f"\nCreation des produits...")
    for p in PRODUCTS:
        r = requests.post(f"{API}/products/", json=p)
        s = "OK" if r.status_code == 200 else r.json().get("detail","err")
        print(f"  {p['name']}: {s}")

    print(f"\nImport de {len(T)} avis...")
    now = datetime.utcnow()
    payload = []
    for src, txt, pid in T:
        d = now - timedelta(days=random.randint(0,60), hours=random.randint(0,23))
        item = {"source": src, "text": txt, "date": d.isoformat()}
        if pid:
            item["product_id"] = pid
        payload.append(item)

    r = requests.post(f"{API}/import/", json=payload)
    if r.status_code == 200:
        print(f"  {r.json()['message']}")
    else:
        print(f"  Erreur: {r.text}")

    print("\nBase peuplee avec succes!")

if __name__ == "__main__":
    seed()
