# SimBiz Executive

Simulation de gestion d'entreprise en français, avec moteur multi-périodes, Company Lab et sauvegarde partageable entre appareils.

## Démarrage local

Prérequis : Node.js 20+.

```bash
npm install
npm run dev:server # API Express sur http://localhost:8787
npm run dev        # Vite sur http://localhost:3000
```

Vérification de production :

```bash
npm run lint
npm run build
npm run build:server
npm run test:engine
npm run test:api
npm start
```

## API et synchronisation

L'API Express expose `GET /api/health`, `POST /api/games`, `GET /api/games/:code`, `PUT /api/games/:code`, `POST /api/games/:code/turn` (réservé pour un calcul serveur ultérieur) et `GET /api/leaderboard`. Le client utilise `VITE_API_URL` en production et le proxy Vite `/api` en développement.

Le client crée un identifiant d'appareil et un code de partie invité à 8 caractères, puis synchronise automatiquement l'état. Le code est un lien de reprise pratique, pas une authentification sécurisée : ne pas y stocker de données personnelles. En cas de réseau absent, l'état continue de fonctionner dans `localStorage` et le badge indique « Hors ligne ».

## Persistance et limite de production

Le prototype utilise un fichier JSON (`SIMBIZ_DATA_DIR/games.json`) avec écriture atomique. Ce stockage n'est pas durable sur un hébergement éphémère : il peut être perdu à chaque redéploiement ou redémarrage. Le manifeste Render monte donc un disque persistant sur `/var/data` (offre payante requise). Pour une production multi-instance ou une exigence de durabilité forte, implémenter un repository PostgreSQL/Supabase derrière le même contrat de routes avant de renseigner `DATABASE_URL`. L'API refuse actuellement `DATABASE_URL` tant que cet adaptateur n'existe pas, afin de ne pas donner une fausse garantie de durabilité.

## Déployer depuis GitHub

Les actions de compte, de facturation, de création de domaine et de configuration DNS doivent être réalisées par le propriétaire du projet. Aucun compte externe ni domaine n'est créé par ce dépôt.

1. **Publier le dépôt** : pousser ce projet sur GitHub, en conservant `netlify.toml`, `render.yaml` et `.env.example`.
2. **Créer l'API Render** : dans Render, `New > Blueprint`, sélectionner le dépôt GitHub et appliquer `render.yaml`. Vérifier que le service `simbiz-api` est créé avec son disque persistant. Renseigner `CORS_ORIGIN` avec l'URL Netlify finale (elle peut être mise à jour après l'étape 3). Ne pas renseigner `DATABASE_URL` avec la configuration actuelle.
3. **Vérifier l'API** : ouvrir `https://<service>.onrender.com/api/health` et vérifier `ok: true` et `storage: "filesystem"`.
4. **Créer le frontend Netlify** : `Add new site > Import an existing project > GitHub`, sélectionner le dépôt. Netlify détecte `netlify.toml` (`npm run build`, dossier `dist`). Ajouter `VITE_API_URL=https://<service>.onrender.com/api` dans `Site configuration > Environment variables`, puis redéployer.
5. **Relier CORS** : remplacer `CORS_ORIGIN` dans Render par l'URL Netlify publique exacte, sans slash final, puis redéployer l'API. Pour un domaine personnalisé, utiliser ce domaine comme origine finale.
6. **Tester** : créer et recharger une partie depuis l'URL Netlify, puis vérifier `/api/health`, le chargement cross-origin et `GET /api/leaderboard`.

## Domaine personnalisé et DNS

Dans Netlify, `Domain management > Add a domain`, ajouter le domaine acheté par le propriétaire et suivre la validation. Chez le registrar, créer les enregistrements indiqués par Netlify : généralement un `CNAME` pour `www` vers le nom Netlify fourni et, pour le domaine racine, les enregistrements apex/ALIAS ou les adresses A recommandées par Netlify. Supprimer les anciens enregistrements contradictoires, attendre la propagation DNS, puis activer HTTPS dans Netlify. Enfin, mettre à jour `CORS_ORIGIN` dans Render et `VITE_API_URL` dans Netlify si l'URL de l'API change, puis redéployer les deux services.

## Variables d'environnement

Copier `.env.example` pour connaître les variables attendues. `VITE_API_URL` est une variable publique injectée au build frontend ; `CORS_ORIGIN`, `SIMBIZ_DATA_DIR`, `SIMBIZ_STORAGE_MODE` et `DATABASE_URL` sont des variables backend. Les secrets ne doivent pas être commités.
