# Remotely - Application de Recherche d'Emploi en Télétravail

## Résumé
Application web de recherche d'emploi spécialisée dans les postes 100% télétravail, avec interface en français et thème sombre moderne.

## Date de création
17 janvier 2026

## Stack Technique
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend**: FastAPI (Python)
- **Base de données**: MongoDB
- **Design**: Thème sombre Zinc-950, accents Indigo

## Fonctionnalités Implémentées (MVP)

### ✅ Page d'accueil
- Barre de recherche avec suggestions
- Liste des offres d'emploi (12 offres mock)
- Affichage des métadonnées (entreprise, localisation, salaire, tags)

### ✅ Système de filtres
- Type de contrat (CDI, CDD, Freelance, Stage)
- Localisation (France, Europe, Mondial, Francophone)
- Salaire minimum (slider 0-100k€)

### ✅ Page détail d'une offre
- Description complète
- Compétences requises
- Boutons: Postuler, Favoris, Partager

### ✅ Système de favoris
- Ajouter/retirer des favoris
- Page dédiée aux favoris sauvegardés
- Stockage persistant MongoDB

### ✅ Alertes email (structure)
- Création d'alertes avec critères
- Activation/désactivation
- Fréquence quotidienne/hebdomadaire
- **Note**: Envoi d'emails non actif (configuration requise)

## APIs Backend

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/jobs` | GET | Recherche d'offres avec filtres |
| `/api/jobs/{id}` | GET | Détail d'une offre |
| `/api/favorites` | GET/POST | Liste/Ajout favoris |
| `/api/favorites/{job_id}` | DELETE | Supprimer favori |
| `/api/alerts` | GET/POST | Liste/Création alertes |
| `/api/alerts/{id}` | DELETE | Supprimer alerte |
| `/api/alerts/{id}/toggle` | PATCH | Activer/Désactiver alerte |
| `/api/stats` | GET | Statistiques dashboard |

## Données Mock
12 offres d'emploi variées (Développeur, DevOps, Designer, Data Scientist, etc.)

## Backlog (Fonctionnalités Futures)

### P0 - Prioritaire
- [ ] Intégration API réelle (JSearch, Adzuna, Remotive)
- [ ] Envoi d'emails pour les alertes (SendGrid/Resend)

### P1 - Important
- [ ] Pagination des résultats
- [ ] Tri des offres (date, salaire)
- [ ] Historique de recherche

### P2 - Nice to have
- [ ] Mode clair/sombre toggle
- [ ] Export des favoris (CSV)
- [ ] Statistiques personnelles
- [ ] Notifications push navigateur

## User Persona
**Lucas** - Développeur freelance cherchant des missions 100% remote. Il veut un outil simple pour centraliser sa recherche d'emploi sans créer de compte sur plusieurs sites.

## Métriques de Succès
- Temps de recherche d'offre < 5 secondes
- Interface intuitive (0 friction)
- Sauvegarde persistante des favoris
