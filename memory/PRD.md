# Remotely - Tracker de Candidatures Télétravail

## Résumé
Application web personnelle de suivi de candidatures pour emplois 100% télétravail, avec extension Chrome intelligente pour capturer les offres en un clic depuis les principaux sites d'emploi.

## Date de création
17 janvier 2026

## Stack Technique
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend**: FastAPI (Python)
- **Base de données**: MongoDB
- **Extension**: Chrome Extension (Manifest V3)
- **Design**: Thème sombre Zinc-950, accents Indigo

## Fonctionnalités Implémentées

### ✅ Dashboard Principal
- Statistiques en temps réel (Total, En cours, Entretiens, Cette semaine)
- Liste des candidatures avec recherche et filtres
- Changement de statut rapide via menu dropdown
- Liens vers les offres originales

### ✅ Vue Kanban
- 6 colonnes de statut (À postuler, Postulé, Entretien, Offre, Accepté, Refusé)
- Drag & drop pour changer le statut
- Vue visuelle du pipeline de candidatures

### ✅ Extension Chrome Intelligente
- Extraction automatique depuis: LinkedIn, Indeed, Welcome to the Jungle, RemoteOK, Talent.io, Glassdoor
- Détection du titre, entreprise, localisation, salaire
- Sauvegarde en un clic vers le dashboard
- Saisie manuelle pour sites non supportés

### ✅ Gestion des Candidatures
- Ajout manuel via formulaire
- Modification des détails et notes
- Historique de suivi (date de candidature, etc.)
- Suppression avec confirmation

### ✅ Page de Détail
- Vue complète d'une candidature
- Notes personnelles éditables
- Accès direct à l'offre originale

## APIs Backend

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/applications` | GET | Liste des candidatures (filtres: status, source, search) |
| `/api/applications` | POST | Créer une candidature |
| `/api/applications/{id}` | GET | Détail d'une candidature |
| `/api/applications/{id}` | PUT | Modifier une candidature |
| `/api/applications/{id}` | DELETE | Supprimer une candidature |
| `/api/applications/{id}/status` | PATCH | Changer le statut |
| `/api/stats` | GET | Statistiques dashboard |
| `/api/alerts` | GET/POST | Alertes email |

## Installation Extension Chrome

1. Télécharger `remotely-extension.zip` depuis le footer du site
2. Extraire le ZIP
3. Ouvrir `chrome://extensions/`
4. Activer "Mode développeur"
5. Cliquer "Charger l'extension non empaquetée"
6. Sélectionner le dossier extrait

## Backlog (Fonctionnalités Futures)

### P0 - Prioritaire
- [ ] Envoi d'emails pour les alertes (SendGrid/Resend)
- [ ] Export CSV des candidatures

### P1 - Important
- [ ] Statistiques avancées (taux de réponse, temps moyen)
- [ ] Rappels de relance automatiques
- [ ] Tags personnalisés

### P2 - Nice to have
- [ ] Intégration calendrier pour entretiens
- [ ] Mode clair/sombre toggle
- [ ] Synchronisation multi-appareils

## User Persona
**Lucas** - Développeur en recherche active d'emploi remote. Il consulte plusieurs sites d'emploi et veut centraliser toutes ses candidatures en un seul endroit pour suivre son avancement.

## Métriques de Succès
- Capture d'offre < 3 secondes via extension
- Vue d'ensemble complète du pipeline
- Zéro candidature oubliée
