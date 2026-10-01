# SimBiz Executive — iOS natif

Cette app SwiftUI est une expérience native indépendante du client web. Elle cible iOS 18+, utilise SF Pro via `.system`, les symboles SF et une palette de cockpit bleu nuit. Le moteur local est volontairement petit, déterministe et Codable afin de rendre le premier tour jouable hors ligne.

## Ouvrir et lancer

Ouvrir `SimBizExecutive.xcodeproj` dans Xcode 16 ou supérieur, choisir le scheme **SimBizExecutive**, puis un simulateur iOS 18+. La signature Apple Developer est nécessaire pour installer sur un appareil physique. Le widget demande le même App Group (`group.com.simbiz.executive`) si vous activez le partage en production ; le prototype reste fonctionnel sans ce groupe grâce au fallback `UserDefaults`.

La cible d’application, le widget et les tests sont inclus dans le projet. Les API Liquid Glass sont protégées par `#available`; les versions compatibles utilisent `.ultraThinMaterial`.

## Architecture

Le dossier web à la racine reste inchangé. L’app native possède son propre modèle `GameState`, sa persistance UserDefaults Codable, son moteur P0→P1 et ses recommandations. Aucun webview n’est utilisé.

## Carte des fonctionnalités

- **Cockpit** : KPI, recommandation déterministe, prévision et clôture de période.
- **Décisions** : commerce/prix, marketing, production, stocks, fournisseurs, R&D, qualité,
  RH, finance et posture de crise.
- **Résultats** : courbe Swift Charts et états financiers par période (réalisé vs prévision).
- **Écosystème** : marché, RH, messages, objectifs du conseil et brevets R&D déblocables.
- **Outils** : export/restauration JSON avec `fileExporter`/`fileImporter`, statut de période et
  réinitialisation protégée. La sauvegarde est locale et Codable.
- **Native platform** : `TabView` sur iPhone, `NavigationSplitView` sur iPad, Dynamic Type,
  VoiceOver, partage de fichier et WidgetKit/App Intent.

L’App Intent « Simuler la prochaine période » est exposé dans les raccourcis lorsque la cible est installée.

Pour un produit signé, renseigner l’App Group dans les capabilities des deux targets et remplacer l’identifiant d’équipe dans la signature. DerivedData et les fichiers utilisateur Xcode sont ignorés par le `.gitignore` racine.
