<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# C-Diag

Outil de diagnostic guidé et de génération de trame pour les interventions.

## Exécution locale

**Prérequis :** Node.js 20+

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer en développement :
   ```bash
   npm run dev
   ```
3. Ouvrir l'application sur `http://localhost:3000`.

## Build de production

```bash
npm run build
```

Les fichiers prêts au déploiement sont générés dans `dist/`.

## Déploiement

C-Diag est une application front-end statique. Déployez le contenu du dossier `dist/`.

### Commandes CI recommandées

```bash
npm ci
npm run build
```

### Réglages de plateforme (Vercel / Netlify / Nginx)

- **Build command** : `npm run build`
- **Output directory** : `dist`
- **Node version** : `20` ou supérieure

### Déploiement GitHub Pages (recommandé)

Le repo inclut un workflow GitHub Actions (`.github/workflows/deploy-pages.yml`) qui publie `dist/` automatiquement.

1. GitHub → **Settings** → **Pages**.
2. Dans **Build and deployment**, choisir **Source: GitHub Actions**.
3. Push sur `main` (ou lancer le workflow manuellement).
4. Ouvrir l'URL fournie dans l'onglet **Actions**.

> Important : ne pas servir la racine du repo telle quelle (avec `index.tsx`), sinon vous obtenez une page blanche.
> Il faut servir le build `dist/`.

### Fallback SPA

Si votre hébergeur exige une règle de réécriture, configurez une redirection de toutes les routes vers `/index.html`.
