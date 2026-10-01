# SimBiz Executive — Monde visuel cockpit sombre

## Direction

SimBiz Executive est un outil de pilotage, pas une vitrine marketing : l'interface doit donner la sensation d'une salle de décision calme, précise et immédiatement lisible. Le cockpit repose sur une toile bleu nuit, des surfaces slate distinctes, des séparateurs fins et des accents sémantiques indigo, émeraude, ambre et rose. La pile système Apple est conservée pour sa lisibilité, sans inverser les surfaces vers un thème clair.

## Typographie

La typographie système est la source d'autorité :

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
  "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
```

Les valeurs, mesures et codes utilisent une pile monospace système (`SF Mono`, `ui-monospace`, `Menlo`, `monospace`). Aucune police Apple propriétaire n'est importée ou embarquée.

## Palette et matériaux

- **Canvas** : `#080d19`, bleu nuit conçu pour les longues sessions de pilotage.
- **Surface** : `#0f172a` et `#151f34`, opaques et hiérarchisées.
- **Texte** : `#f1f5f9`, secondaire `#94a3b8`, discret `#64748b`.
- **Accent** : indigo `#818cf8` et fond `rgba(49,46,129,.45)`.
- **Sémantique** : émeraude `#34d399`, ambre `#fbbf24`, rose `#fb7185`; les états gardent toujours un libellé ou une icône en plus de la couleur.
- **Profondeur** : ombres décalées, réservées aux panneaux et surfaces de premier plan.

## Composition et composants

- La barre latérale translucide reste persistante sur desktop et devient une rail d'icônes compacte sur téléphone.
- La barre supérieure conserve les périodes, KPI, alertes et actions de simulation, dans une surface légère et séparée par une hairline.
- Les sections de cockpit utilisent de grands rayons de 20px, des groupes respirants et des valeurs alignées pour préserver la densité exécutive.
- Les décisions, résultats et tableaux conservent leurs contrôles et libellés français; le système visuel leur apporte uniquement hiérarchie, contrastes et états plus calmes.
- Les contrôles primaires sont bleus, les sélecteurs de période et filtres suivent une logique segmentée/pill, et le focus clavier est visible.
- Le bouton **Conseiller** reste visible dans la barre supérieure. Le cockpit expose en plus une recommandation compacte persistante. Le panneau liste des recommandations déterministes, prioritaires et explicables (trésorerie, marge, stock, capacité, personnes, marketing, R&D, ESG et workflow), avec impact attendu et lien vers l'onglet d'action.

## Responsive et accessibilité

La navigation se compacte à 68px sous 768px, le contenu devient mono-colonne, les surfaces restent scrollables horizontalement lorsque les tableaux l'exigent, et les contrôles tactiles gardent une hauteur minimale de 40–44px. Les contrastes dépassent 4.5:1 pour le texte courant, `:focus-visible` est explicite et `prefers-reduced-motion` désactive les mouvements non essentiels.
