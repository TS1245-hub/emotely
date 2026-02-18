# Remotely - Job Tracker 📱

Application de suivi de candidatures pour emplois en télétravail avec **partage natif** sur Android.

## Fonctionnalités

- ✅ Dashboard de suivi des candidatures
- ✅ Vue Kanban (drag & drop)
- ✅ Extension Chrome pour capturer les offres
- ✅ **Partage natif Android** - Partagez depuis Indeed, LinkedIn, etc. directement vers l'app !

## Installation de l'APK Android

### Option 1 : Télécharger depuis GitHub Actions

1. Allez sur l'onglet **Actions** de ce repo
2. Cliquez sur le dernier workflow **"Build Android APK"**
3. Téléchargez l'artifact **"remotely-debug-apk"**
4. Extrayez le ZIP et installez `app-debug.apk` sur votre téléphone Android

### Option 2 : Compiler vous-même

```bash
# Cloner le repo
git clone <votre-repo>
cd remotely

# Installer les dépendances
yarn install

# Build React
yarn build

# Sync Capacitor
npx cap sync android

# Ouvrir dans Android Studio
npx cap open android
```

## Utilisation du partage Android

1. Ouvrez Indeed, LinkedIn, ou n'importe quel site d'emploi
2. Trouvez une offre intéressante
3. Cliquez sur **"Partager"**
4. Choisissez **"Remotely"** dans la liste
5. L'offre est automatiquement pré-remplie, cliquez **"Sauvegarder"**

## Structure du projet

```
/frontend
├── src/                    # Code React
├── android/                # Projet Android (Capacitor)
├── public/
│   └── extension/          # Extension Chrome
└── .github/workflows/      # GitHub Actions
```

## Technologies

- React 19 + Tailwind CSS
- FastAPI (Python)
- MongoDB
- Capacitor 5 (Android)
- GitHub Actions (CI/CD)
