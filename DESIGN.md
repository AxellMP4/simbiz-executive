# SimBiz Executive — Système visuel existant

Ce document décrit l'identité visuelle déjà présente dans le projet. Il ne définit pas un nouveau produit et ne remplace pas les comportements ou la structure métier existants.

## Direction visuelle

L'interface est un **cockpit exécutif sombre** orienté opération et lecture rapide :

- surface principale navy/slate très sombre ;
- cartes et panneaux à bordures fines, avec hiérarchie dense de données ;
- navigation latérale persistante et barre supérieure de période ;
- accent indigo pour la marque et les actions principales ;
- emerald pour les résultats favorables, la synchronisation et les signaux de réussite ;
- amber pour les décisions, alertes d'attention et actions de clôture ;
- rose/rouge pour les erreurs, risques et résultats défavorables ;
- cyan, sky et violet pour distinguer certains domaines métier et séries de données.

## Typographie vérifiée

Les fontes déclarées dans `src/index.css` sont :

- **Outfit** pour les titres et la typographie d'affichage ;
- **Plus Jakarta Sans** pour le texte courant ;
- **Space Grotesk** pour certains libellés techniques ;
- **JetBrains Mono** pour les valeurs, codes et données tabulaires.

Ces choix sont documentés comme identité visuelle existante ; ils ne constituent pas une recommandation de refonte.

## Principes d'interface observés

- Priorité à la scanabilité : KPI, tableaux, badges de statut et valeurs alignées.
- Les données chiffrées utilisent des unités et le format français.
- La période active et la période clôturée sont visibles dans la barre supérieure.
- Les actions importantes sont explicites : préparer les décisions, prévisualiser, valider et clôturer.
- Les états favorables/défavorables combinent couleur, texte, icônes ou libellés ; la couleur ne doit pas être l'unique signal.
- La navigation regroupe les surfaces par fonctions existantes : cockpit, états financiers, décisions, conseil/R&D, RH, marché, messagerie, outils et documentation.
- Le layout s'adapte aux petits écrans en réduisant la barre latérale et en conservant les contrôles essentiels.
- Les états de synchronisation hors ligne/en ligne sont exposés par un badge persistant.
- L'impression navigateur est prise en compte par des règles `@media print`.

## Contraintes de conservation

Toute évolution visuelle doit préserver les libellés français, les flux de simulation, les rapports existants, la distinction prévision/réalisé, la lisibilité des unités et l'accessibilité clavier/focus. Une éventuelle refonte doit être demandée explicitement ; ce fichier ne l'autorise pas.
