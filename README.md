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

L'API partagée expose `GET /api/health`, `POST /api/games`, `GET /api/games/:code`, `PUT /api/games/:code`, `POST /api/games/:code/turn` (réservé pour un calcul serveur ultérieur) et `GET /api/leaderboard`. En local, ces routes sont servies par Express sur `http://localhost:8787` et Vite les relaie via `/api`. Sur Netlify, elles sont servies par `netlify/functions/api.ts` et le redirect `/api/*` est same-origin. `VITE_API_URL` peut rester vide dans la configuration Netlify.

Le client crée un identifiant d'appareil et un code de partie invité à 8 caractères, puis synchronise automatiquement l'état. Le code est un lien de reprise pratique, pas une authentification sécurisée : ne pas y stocker de données personnelles. En cas de réseau absent, l'état continue de fonctionner dans `localStorage` et le badge indique « Hors ligne ».

## Guide de pilotage

Le **Cockpit exécutif** est la page d'accueil : les indicateurs distinguent les résultats réalisés de la période clôturée et les décisions à venir. Depuis **Feuille de décisions**, saisissez les leviers commerce, production, achats, RH et finance, puis utilisez la prévisualisation. Elle appelle le même moteur déterministe que la clôture, sans modifier les résultats officiels. Les contraintes bloquantes (capacité, financement, bornes de décision) doivent être corrigées avant validation.

Le cycle d'une période est : **Brouillon → Prévisualisation → Validée → Clôturée**. Une clôture est idempotente : un même numéro de période ne remplace jamais un résultat déjà enregistré. Le journal d'activité conserve les prévisualisations et clôtures dans la sauvegarde locale.

### Glossaire et hypothèses

- **Réalisé** : résultat calculé et enregistré dans `PeriodSnapshot`.
- **Prévision** : résultat calculé à partir des décisions courantes, non persistant tant que la période n'est pas clôturée.
- **Marge brute** : chiffre d'affaires moins coût des ventes.
- Les prix, volumes, capacité, stocks, délais clients, coût matière et financement sont déterministes à partir de la période et des décisions. Le moteur applique les contraintes de matière et de capacité par réduction explicable de la production.

Les rapports existants restent accessibles depuis **États financiers**. L'impression navigateur fournit un PDF partageable à court terme; **Calculateurs & Outils** permet maintenant l'export et la restauration JSON de l'état complet. L'export CSV et les rapports PDF natifs restent à compléter.

## Phases implémentées et limites connues

- **P0** : audit (`AUDIT.md`), modèle canonique existant consolidé, cockpit, navigation actuelle préservée.
- **P1** : cycle brouillon/prévision/clôture, validations partagées, journal d'événements, sauvegarde/restauration JSON complète, tests de déterminisme/immutabilité/idempotence.
- **P2** : objectifs/écarts, exports CSV/PDF natifs, backup/restore UX, API de calcul serveur durable.
- **P3** : PWA avancée et collaboration multi-utilisateur.

## Persistance et limite de production

L'Express local utilise un fichier JSON (`SIMBIZ_DATA_DIR/games.json`) avec écriture atomique. Les Netlify Functions utilisent volontairement un store mémoire par instance chaude : le système de fichiers des Functions est éphémère et les instances peuvent être remplacées ou multipliées. Les parties invitées peuvent donc disparaître après un cold start, un déploiement ou une autre instance ; l'application conserve toujours une sauvegarde `localStorage` et son mode hors ligne. Le code ne prétend pas fournir une persistance durable ou une synchronisation cross-device garantie sans ajouter un fournisseur externe (par exemple Supabase) et ses identifiants.

## Déployer gratuitement sur Netlify

Les actions de compte, de facturation, de création de domaine et de configuration DNS doivent être réalisées par le propriétaire du projet. Aucun compte externe n'est créé par ce dépôt.

1. Pousser le dépôt sur GitHub puis, dans Netlify, choisir `Add new site > Import an existing project > GitHub`.
2. Conserver les réglages détectés depuis `netlify.toml` : `npm run build`, publication `dist`, Functions dans `netlify/functions`, Node.js 20.
3. Ne pas renseigner `VITE_API_URL` (ou le laisser vide) : le frontend appelle `/api` sur le même domaine. `CORS_ORIGIN` est également inutile pour ce mode same-origin.
4. Déployer puis vérifier `https://<site>.netlify.app/api/health`, la création/reprise d'une partie et `GET /api/leaderboard`.

Le plan gratuit Netlify suffit pour le frontend et les Functions dans leurs quotas publics, mais il ne transforme pas le store mémoire en base de données. Pour une persistance durable multi-appareils, brancher ultérieurement un fournisseur externe gratuit derrière `server/api.ts` sans exposer de clé dans le frontend.

## Domaine personnalisé et DNS

Dans Netlify, `Domain management > Add a domain`, ajouter le domaine acheté par le propriétaire et suivre la validation. Chez le registrar, créer les enregistrements indiqués par Netlify puis activer HTTPS. Le mode same-origin continue de fonctionner sans changement de CORS.

## Variables d'environnement

Copier `.env.example` pour connaître les variables attendues. `VITE_API_URL` est une variable publique injectée au build frontend ; `CORS_ORIGIN` et `SIMBIZ_STORAGE_MODE` sont des variables des Functions ; `SIMBIZ_DATA_DIR` ne concerne que l'Express local. Les secrets ne doivent pas être commités.
