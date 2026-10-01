# SimBiz Executive iOS — salle de décision portable

## Direction

Une salle de décision calme, tactile et dense : bleu nuit (`#080D19`) en toile, surfaces translucides, texte système SF Pro, accents indigo/émeraude/ambre et emojis comme marqueurs humains. Le produit doit ressembler à une console de direction native, jamais à un tableau de bord web compressé.

## Structure

Le téléphone privilégie une `TabView` à cinq destinations. L’iPad conserve les mêmes destinations mais laisse les grilles et les cartes respirer via `LazyVGrid` et les size classes. Les tâches protégées (réinitialisation, simulation) utilisent confirmation native; les choix utilisent `Picker`, `Stepper`, `ColorPicker` et des sheets.

## Matières et accessibilité

Les cartes utilisent le verre moderne quand iOS le fournit, sinon `.ultraThinMaterial`. Les contrastes ne dépendent jamais de la couleur seule : chaque état possède un symbole et un libellé. Toutes les valeurs utilisent les polices système et supportent Dynamic Type; les contrôles ont des labels VoiceOver explicites. Les animations restent courtes et non essentielles.

## Feature map native

Le cockpit et les résultats privilégient les informations mesurables : le graphique est
complété par des libellés et des valeurs, et chaque statut associe symbole et texte. Les
décisions sont regroupées par arbitrage métier plutôt que par une longue liste technique.
Sur iPhone, cinq onglets gardent les actions fréquentes à portée de pouce ; sur iPad, la
barre latérale expose le même graphe de navigation sans dupliquer l’état.
