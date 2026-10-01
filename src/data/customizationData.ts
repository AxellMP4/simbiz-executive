import {
  CompanySettings,
  StrategicObjective,
  CrisisEvent,
  TechPatent,
  IndustrySector,
  CeoPersona
} from '../types/simulation';

export const INDUSTRY_SECTORS: Record<
  IndustrySector,
  {
    name: string;
    description: string;
    productAName: string;
    productBName: string;
    productADesc: string;
    productBDesc: string;
    defaultColor: string;
    badge: string;
  }
> = {
  hightech_iot: {
    name: 'Haute Technologie & Capteurs IoT',
    description: 'Composants intelligents, capteurs industriels miniaturisés et processeurs pour usines connectées.',
    productAName: 'Capteur IoT Alpha-100',
    productBName: 'Calculateur IA Apex-Pro',
    productADesc: 'Module de télémétrie haute cadence pour l\'automatisation industrielle.',
    productBDesc: 'Processeur embarqué avec réseau de neurones temps réel.',
    defaultColor: '#6366f1',
    badge: 'Tech & IoT',
  },
  aero_defense: {
    name: 'Aéronautique, Spatial & Systèmes Embarqués',
    description: 'Équipements critiques de bord, avionique de pointe et liaisons satellite pour appareils civils et spatiaux.',
    productAName: 'Boîtier Avionique Aero-Alpha',
    productBName: 'Centrale Inertielle Apex-Gyro',
    productADesc: 'Système d\'acquisition de vol certifié haute température.',
    productBDesc: 'Centrale de navigation inertielle gyroscopique laser.',
    defaultColor: '#0ea5e9',
    badge: 'Aérospatial',
  },
  medtech_robotics: {
    name: 'Dispositifs Médicaux & Robotique Chirurgicale',
    description: 'Micromécanismes chirurgicaux, implants connectés et systèmes d\'assistance opératoire haute précision.',
    productAName: 'Sonde Robotisée Med-Alpha',
    productBName: 'Bras Articulé Surgical-Apex',
    productADesc: 'Sonde de biopsie guidée par imagerie ultra-fine.',
    productBDesc: 'Système microrobotique multi-axes pour chirurgie mini-invasive.',
    defaultColor: '#10b981',
    badge: 'MedTech',
  },
  cleantech_energy: {
    name: 'CleanTech & Transition Énergétique',
    description: 'Onduleurs solaires, micro-turbines et solutions de stockage stationnaire bas-carbone.',
    productAName: 'Onduleur Hybride Eco-Alpha',
    productBName: 'Pack Stockage Smart-Apex',
    productADesc: 'Convertisseur haute efficacité 99,4% pour réseaux intelligents.',
    productBDesc: 'Unité de stockage stationnaire Lithium-Fer-Phosphate modulaire.',
    defaultColor: '#06b6d4',
    badge: 'CleanTech',
  },
  automotive_mobility: {
    name: 'Véhicules Autonomes & Mobilité Électrique',
    description: 'Contrôleurs de puissance pour chaînes de traction électrique et capteurs LiDAR de conduite assistée.',
    productAName: 'Contrôleur Moteur Drive-Alpha',
    productBName: 'Capteur LiDAR 3D Apex-Vision',
    productADesc: 'Module d\'onduleur SiC haute densité de puissance pour moteurs électriques.',
    productBDesc: 'LiDAR état solide longue portée avec cartographie 3D instantanée.',
    defaultColor: '#f59e0b',
    badge: 'Auto & Mobilité',
  },
};

export const CEO_PERSONAS: Record<
  CeoPersona,
  {
    name: string;
    title: string;
    avatar: string;
    description: string;
    perk: string;
    bonusSummary: string;
  }
> = {
  tech_visionary: {
    name: 'Le Visionnaire Tech & R&D',
    title: 'Ingénieur & Entrepreneur',
    avatar: '🔬',
    description: 'Passionné par l\'innovation de rupture. Priorité aux brevets, à l\'excellence technique et au design produit.',
    perk: '+12% d\'attractivité naturelle sur le Produit Haut de Gamme Apex et +15% d\'efficacité des investissements R&D.',
    bonusSummary: '+12% Demande Apex / R&D++',
  },
  ops_optimizer: {
    name: 'L\'Optimisateur Opérationnel',
    title: 'Expert Lean & Industrie 4.0',
    avatar: '⚙️',
    description: 'Focalisé sur la performance industrielle, le zéro défaut en usine et l\'élimination des gaspillages.',
    perk: '-8% sur les coûts d\'atelier hors matières premières et +5% sur le rendement des machines.',
    bonusSummary: '-8% Coûts Usine / Rendement++',
  },
  people_leader: {
    name: 'Le Leader Social & Talents',
    title: 'Dirigeant Humain & RSE',
    avatar: '🤝',
    description: 'Convaincu que le capital humain fait la différence. Accent sur le bien-être, l\'intéressement et le dialogue social.',
    perk: '+12 points sur le climat social de départ, absentéisme divisé par 2 et risque de grève réduit à 0%.',
    bonusSummary: '+12 pts Climat Social / 0% Grève',
  },
  global_conqueror: {
    name: 'Le Conquérant International',
    title: 'Spécialiste Grand Export & B2B',
    avatar: '🌍',
    description: 'Rompu aux négociations internationales et aux contrats grands comptes aux États-Unis, en Europe et en Asie.',
    perk: '+10% sur les volumes vendus à l\'exportation et quotas des commerciaux export relevés de +15%.',
    bonusSummary: '+10% Export / Ventes B2B',
  },
  financial_strategist: {
    name: 'Le Stratège Financier',
    title: 'Ancien Banquier d\'Affaires & CFO',
    avatar: '📈',
    description: 'Maître du cash-flow, de l\'arbitrage du BFR, de la structure de capital et de la création de valeur boursière.',
    perk: 'Taux de crédit bancaire négocié à la baisse (-0,40%) et valorisation d\'entreprise rehaussée d\'un multiple.',
    bonusSummary: '-0,40% Taux Crédit / Multiple++',
  },
};

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'AeroPulse Technologies',
  tickerSymbol: 'APULSE',
  industrySector: 'hightech_iot',
  sectorName: 'Haute Technologie & Capteurs IoT',
  productAName: 'Capteur IoT Alpha-100',
  productBName: 'Calculateur IA Apex-Pro',
  productADesc: 'Module de télémétrie haute cadence pour l\'automatisation industrielle.',
  productBDesc: 'Processeur embarqué avec réseau de neurones temps réel.',
  ceoName: 'Alexandre de Montmirail',
  ceoPersona: 'tech_visionary',
  brandColor: '#6366f1',
  logoIcon: 'cpu',
  currency: '€',
  country: 'France',
  marketScope: 'europe',
  theme: 'midnight',
  strategyPriorities: ['croissance', 'innovation', 'rentabilite'],
  riskAppetite: 'balanced',
  orgStructure: 'functional',
  supplierPreference: 'balanced',
  productPortfolio: [
    { name: 'Capteur IoT Alpha-100', category: 'Produit cœur', pricePosition: 'value' },
    { name: 'Calculateur IA Apex-Pro', category: 'Produit premium', pricePosition: 'premium' },
  ],
};

export const INITIAL_OBJECTIVES: StrategicObjective[] = [
  {
    id: 'obj-1',
    title: 'Franchir le Cap des 1,5 M€ de Chiffre d\'Affaires',
    description: 'Développer les ventes locales et internationales pour atteindre 1 500 000 € de ventes trimestrielles.',
    targetMetric: 'revenue',
    targetValue: 1500000,
    rewardCash: 40000,
    rewardSharePriceBonus: 1.50,
    completed: false,
    periodAssigned: 0,
  },
  {
    id: 'obj-2',
    title: 'Obtenir la Certification RSE Excellence (Score ESG ≥ 80)',
    description: 'Investir dans l\'éco-conception, la QVT et la décarbonation pour afficher un score RSE d\'au moins 80/100.',
    targetMetric: 'esgScore',
    targetValue: 80,
    rewardCash: 25000,
    rewardSharePriceBonus: 2.00,
    completed: false,
    periodAssigned: 0,
  },
  {
    id: 'obj-3',
    title: 'Excellence Qualité Usine (Rebuts ≤ 2.2%)',
    description: 'Former les ouvriers et moderniser le parc machine pour comprimer les défauts de fabrication sous 2,2%.',
    targetMetric: 'defectRate',
    targetValue: 2.2,
    rewardCash: 30000,
    rewardSharePriceBonus: 1.20,
    completed: false,
    periodAssigned: 0,
  },
  {
    id: 'obj-4',
    title: 'Leadership de Marché (Part de Marché ≥ 20%)',
    description: 'Conquérir au moins 20% du gâteau sectoriel face aux 5 concurrents industriels.',
    targetMetric: 'marketShare',
    targetValue: 20.0,
    rewardCash: 50000,
    rewardSharePriceBonus: 3.50,
    completed: false,
    periodAssigned: 1,
  },
];

export const CRISIS_SCENARIOS: Record<number, CrisisEvent> = {
  1: {
    id: 'crisis-p1',
    period: 1,
    title: 'Opportunité de Contrat Cadre Européen Exclusif',
    category: 'ma_opportunity',
    description: 'Un consortium d\'industriels européens propose de vous confier un volume d\'achat garanti sur 3 ans, mais exige une clause d\'exclusivité territoriale et une remise tarifaire de 8%.',
    resolved: false,
    choices: [
      {
        id: 'c1-accept',
        label: 'Accepter le contrat avec exclusivité',
        description: 'Sécurise un surcroît de ventes immédiat (+15 000 € de trésorerie), mais bloque l\'expansion chez d\'autres clients.',
        impactSummary: '+15k€ Cash immédiat / Marge unitaire réduite',
        cashImpact: 15000,
        profitImpact: 8000,
        esgImpact: 0,
        socialImpact: 2,
        capacityImpact: 1.05,
      },
      {
        id: 'c1-negotiate',
        label: 'Contre-proposer un accord sans exclusivité',
        description: 'Vous refusez l\'exclusivité mais accordez un rabais de 4% et un label de partenariat vert.',
        impactSummary: '+5 pts ESG / Préservation de la liberté commerciale',
        cashImpact: 5000,
        profitImpact: 12000,
        esgImpact: 5,
        socialImpact: 0,
        capacityImpact: 1.02,
      },
      {
        id: 'c1-refuse',
        label: 'Décliner l\'offre pour privilégier l\'agilité',
        description: 'Vous refusez de brader vos prix et conservez l\'entière maîtrise de vos marges.',
        impactSummary: 'Marges préservées / Pas de cash additionnel',
        cashImpact: 0,
        profitImpact: 0,
        esgImpact: 0,
        socialImpact: 0,
        capacityImpact: 1.0,
      },
    ],
  },
  2: {
    id: 'crisis-p2',
    period: 2,
    title: 'Pénurie Mondiale de Composants & Tensions Fret',
    category: 'supply_chain',
    description: 'Une congestion majeure dans les ports asiatiques menace vos approvisionnements de matières premières. Comment réagissez-vous ?',
    resolved: false,
    choices: [
      {
        id: 'c2-airfreight',
        label: 'Souscrire un pont aérien d\'urgence',
        description: 'Garantit 100% de la livraison de vos composants sans rupture, mais coûte 25 000 € de surcoût logistique.',
        impactSummary: '-25k€ Cash / Sécurité usine 100%',
        cashImpact: -25000,
        profitImpact: -15000,
        esgImpact: -3,
        socialImpact: 0,
        capacityImpact: 1.0,
      },
      {
        id: 'c2-relocalize',
        label: 'Sélectionner des fournisseurs locaux européens',
        description: 'Approvisionnement durable de proximité (+8 pts ESG), coût matières légèrement supérieur (+5%).',
        impactSummary: '+8 pts ESG / Fournisseurs locaux certifiés',
        cashImpact: -10000,
        profitImpact: -5000,
        esgImpact: 8,
        socialImpact: 3,
        capacityImpact: 0.98,
      },
      {
        id: 'c2-wait',
        label: 'Temporiser et puiser dans les stocks de sécurité',
        description: 'Aucune dépense additionnelle, mais risque de blocage si les livraisons prennent plus de 3 semaines.',
        impactSummary: 'Économie immédiate / Risque d\'arrêt partiel',
        cashImpact: 0,
        profitImpact: -8000,
        esgImpact: 0,
        socialImpact: -4,
        capacityImpact: 0.92,
      },
    ],
  },
  3: {
    id: 'crisis-p3',
    period: 3,
    title: 'Grande Révolution de l\'IA Embarquée & Débauchage Concurrence',
    category: 'tech_disruption',
    description: 'Votre principal concurrent (Firme 3) tente de débaucher vos meilleurs ingénieurs R&D en proposant des salaires +30% au-dessus du marché.',
    resolved: false,
    choices: [
      {
        id: 'c3-counter-offer',
        label: 'Revaloriser les salaires clés & Prime d\'innovation',
        description: 'Prime exceptionnelle de rétention de 18 000 €. Vos cerveaux restent et le climat social explose positivement.',
        impactSummary: '-18k€ Cash / Rétention 100% / Climat social +10 pts',
        cashImpact: -18000,
        profitImpact: -12000,
        esgImpact: 2,
        socialImpact: 10,
        capacityImpact: 1.05,
      },
      {
        id: 'c3-shares',
        label: 'Attribuer des actions gratuites / BSPCE',
        description: 'Associe les salariés au capital sans décaissement immédiat. Renforce la fidélité à long terme.',
        impactSummary: '0€ Cash décaissé / Fidélisation long terme',
        cashImpact: 0,
        profitImpact: -4000,
        esgImpact: 4,
        socialImpact: 7,
        capacityImpact: 1.02,
      },
      {
        id: 'c3-recruit-fresh',
        label: 'Laisser partir et recruter de jeunes diplômés',
        description: 'Économise sur la masse salariale mais perte temporaire de savoir-faire technique.',
        impactSummary: 'Économie salaires / Baisse temporaire productivité',
        cashImpact: 0,
        profitImpact: 4000,
        esgImpact: 0,
        socialImpact: -6,
        capacityImpact: 0.94,
      },
    ],
  },
};

export const TECH_PATENTS: TechPatent[] = [
  {
    id: 'pat-1',
    name: 'Architecture Éco-Circulaire & Zéro Plastique',
    category: 'green',
    description: 'Conception 100% recyclable utilisant des polymères biosourcés et une empreinte carbone allégée.',
    rdCost: 30000,
    unlocked: false,
    benefit: '-40% sur la taxe carbone, +8% sur la demande Export et +6 points ESG.',
    effect: {
      exportBoost: 1.08,
      carbonTaxReduction: 0.40,
      esgBonus: 6,
    },
  },
  {
    id: 'pat-2',
    name: 'Ligne d\'Assemblage Cobotique & Vision Industrielle',
    category: 'process',
    description: 'Robots collaboratifs guidés par caméra thermique pour assister les ouvriers lors de la soudure haute précision.',
    rdCost: 40000,
    unlocked: false,
    benefit: 'Baisse du taux de rebuts usine de 1,2 point et réduction des coûts usine de 6%.',
    effect: {
      defectReduction: 1.2,
      productionCostReduction: 0.06,
    },
  },
  {
    id: 'pat-3',
    name: 'Puce d\'Accélération IA Temps Réel (Apex Gen-2)',
    category: 'ai',
    description: 'Micro-architecture propriétaire permettant d\'exécuter des algorithmes prédictifs à consommation ultra-basse.',
    rdCost: 50000,
    unlocked: false,
    benefit: '+18% sur l\'attractivité du Produit B Apex et possibilité de facturer 15 € de plus par unité.',
    effect: {
      demandBoostB: 1.18,
    },
  },
  {
    id: 'pat-4',
    name: 'Certification Qualité Aérospatiale & Militaire (MIL-STD)',
    category: 'product',
    description: 'Homologation internationale permettant de répondre aux appels d\'offres étatiques et aux grands comptes mondiaux.',
    rdCost: 35000,
    unlocked: false,
    benefit: '+12% sur les quotas vendeurs export et marge brute renforcée.',
    effect: {
      exportBoost: 1.12,
      demandBoostA: 1.05,
      esgBonus: 4,
    },
  },
];
