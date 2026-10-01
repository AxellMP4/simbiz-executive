# SimBiz Executive — Contexte produit

## Résumé

SimBiz Executive est une application web française de simulation de gestion d'entreprise. Elle permet de prendre des décisions sur plusieurs périodes, d'observer leurs effets déterministes et de consulter les résultats financiers, opérationnels et humains.

## Utilisateurs et contexte

Les publics suivants sont des **hypothèses issues du brief utilisateur**, non vérifiées par des données d'usage dans ce dépôt :

- étudiants et enseignants qui utilisent la simulation comme support pédagogique ;
- dirigeants ou équipes de direction en entraînement à la décision.

Le produit existant contient déjà des vues et libellés en français, un moteur multi-périodes, des décisions concurrentielles et des rapports métier. Ces éléments sont vérifiés dans le code.

## Capacités vérifiées

- Cockpit exécutif avec indicateurs de chiffre d'affaires, marge, résultat, trésorerie, dette et effectif.
- Feuille de décisions multi-périodes couvrant notamment commerce/marketing, production, achats/stocks, RH, finance, R&D, qualité et risque.
- Moteur de simulation déterministe et versionnable par période, avec calculs de demande, ventes, coûts, stocks, trésorerie, bilan, ratios et indicateurs RH.
- Vues existantes pour états financiers, résultats de production, trésorerie, benchmark marché, RH, marché, conseil/R&D, messagerie, outils et documentation.
- Prévisualisation des décisions sans mutation du résultat officiel, validation de contraintes, clôture idempotente et journal d'activité.
- Sauvegarde locale `localStorage`, export/restauration JSON de l'état complet et synchronisation via une API Express locale ou un adaptateur Netlify Functions.

## Persistance et limites vérifiées

L'API Netlify gratuite utilise un store mémoire par instance. Les parties peuvent donc disparaître lors d'un cold start, d'un déploiement ou d'un changement d'instance. La sauvegarde locale reste le mécanisme de continuité principal. Le code de partie invité n'est pas une authentification et ne doit pas contenir de données personnelles.

## Hypothèses et périmètre non confirmé

Les éléments suivants viennent du brief ou constituent des orientations futures ; ils ne doivent pas être présentés comme des capacités livrées sans vérification supplémentaire :

- usage pédagogique ou managérial réel et métriques d'adoption ;
- persistance durable multi-appareils ;
- génération PDF native et exports CSV complets ;
- calcul serveur partagé, collaboration multi-utilisateur, PWA avancée et environnement de production sécurisé ;
- exactitude pédagogique des hypothèses économiques au-delà de la cohérence déterministe du moteur.

## Vocabulaire produit

- **Période** : unité de simulation clôturée ou en préparation.
- **Réalisé** : résultat officiel enregistré dans un `PeriodSnapshot`.
- **Prévision** : calcul de scénario courant qui ne modifie pas le réalisé.
- **Décision** : ensemble typé de leviers soumis au moteur.
- **Cockpit** : vue de pilotage qui rassemble KPI, alertes, décisions et activité récente.
