# Audit SimBiz Executive — 2026-10-01

## État observé

- **Frontend** : React 19 + Vite + TypeScript, navigation centralisée dans `src/App.tsx`, vues métier déjà présentes pour résultats, décisions, RH, marché, conseil/R&D, messagerie et outils.
- **Moteur** : `src/engine/simulationEngine.ts` calcule de manière déterministe les décisions des six firmes, la demande, la production, les stocks, le compte de résultat, le bilan, la trésorerie et les indicateurs RH.
- **Données canoniques** : `PeriodSnapshot` contient l’environnement de marché, les résultats par firme et le benchmark. `FirmDecisions` est le contrat d’entrée partagé.
- **Persistance** : `localStorage` côté client, puis synchronisation invité via Express/Netlify. Le code invité n’est pas une authentification et le store Netlify est mémoire.

## Écarts et risques

1. Le statut de période était déduit de `latestPeriod` et aucun journal de décisions durable n’existait.
2. Les projections de la feuille de décisions utilisaient des formules locales distinctes du moteur, ce qui pouvait créer un écart explicatif.
3. Les contrôles de capacité, matière et crédit étaient visuels mais non regroupés dans un contrat de validation partagé.
4. Le récapitulatif mélangeait lecture des réalisés et préparation de décisions sans distinguer explicitement prévision et réalisé.
5. Les exports PDF et la persistance durable multi-appareils restent limités par le store Netlify mémoire.

## Cartographie domaine / données

| Domaine | Entrées canoniques | Sorties |
| --- | --- | --- |
| Commerce / marketing | prix, force de vente, publicité, canaux, délais clients | demande allouée, chiffre d’affaires, créances |
| Production / achats / stock | production, machines, matières, fournisseur | capacité, consommations, stocks, coût des ventes |
| RH | recrutement, formation, QVT, intéressement | effectifs, productivité, climat, rebuts |
| Finance | dette, equity, dividendes, investissements | trésorerie, dette, résultat, bilan, ratios |
| R&D / qualité / risque | R&D, automatisation, éco-conception, maintenance | coûts, ESG, défauts, risques |

## Backlog priorisé

- **P0 livré** : cockpit KPI, séparation réalisé/prévision, validation partagée, cycle preview/commit idempotent, journal d’événements, documentation d’audit.
- **P1 en fondation** : objectifs/écarts et exports CSV/PDF à compléter sur les vues rapports existantes; backup/restore JSON complet est maintenant exposé depuis Outils.
- **P2** : API de calcul serveur, persistance durable, rapports PDF natifs, tests d’accessibilité automatisés.
- **P3** : PWA hors-ligne avancée, scénarios multi-branches et collaboration.
