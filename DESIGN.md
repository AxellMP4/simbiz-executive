# SimBiz Executive — Monde visuel Apple-inspired

## Direction

SimBiz Executive est un outil de pilotage, pas une vitrine marketing : l'interface doit donner la sensation d'une salle de décision calme, précise et immédiatement lisible. Le nouveau monde visuel remplace l'ancien cockpit sombre par une surface claire inspirée des conventions iOS/macOS : toile gris très pâle, surfaces blanches translucides, séparateurs hairline, rayons généreux et profondeur portée par des ombres douces.

## Typographie

La typographie système est la source d'autorité :

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
  "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
```

Les valeurs, mesures et codes utilisent une pile monospace système (`SF Mono`, `ui-monospace`, `Menlo`, `monospace`). Aucune police Apple propriétaire n'est importée ou embarquée.

## Palette et matériaux

- **Canvas** : `#f4f6f8`, neutre et lumineux pour les longues sessions de simulation.
- **Surface** : blanc translucide / blanc plein, avec `backdrop-filter` uniquement pour les barres et panneaux qui le justifient.
- **Texte** : bleu-gris profond `#172033`, secondaire `#647084`, discret `#8a95a6`.
- **Accent** : bleu retenu `#1769e0` et son fond doux `#e8f0ff`.
- **Sémantique** : vert `#16805d`, orange `#ad6900`, rouge `#c0394b`; les états gardent toujours un libellé ou une icône en plus de la couleur.
- **Profondeur** : `--shadow-sm` pour les panneaux et `--shadow-md` pour les éléments de premier plan, sans halos colorés.

## Composition et composants

- La barre latérale translucide reste persistante sur desktop et devient une rail d'icônes compacte sur téléphone.
- La barre supérieure conserve les périodes, KPI, alertes et actions de simulation, dans une surface légère et séparée par une hairline.
- Les sections de cockpit utilisent de grands rayons de 20px, des groupes respirants et des valeurs alignées pour préserver la densité exécutive.
- Les décisions, résultats et tableaux conservent leurs contrôles et libellés français; le système visuel leur apporte uniquement hiérarchie, contrastes et états plus calmes.
- Les contrôles primaires sont bleus, les sélecteurs de période et filtres suivent une logique segmentée/pill, et le focus clavier est visible.

## Responsive et accessibilité

La navigation se compacte à 68px sous 768px, le contenu devient mono-colonne, les surfaces restent scrollables horizontalement lorsque les tableaux l'exigent, et les contrôles tactiles gardent une hauteur minimale de 40–44px. Les contrastes dépassent 4.5:1 pour le texte courant, `:focus-visible` est explicite et `prefers-reduced-motion` désactive les mouvements non essentiels.
