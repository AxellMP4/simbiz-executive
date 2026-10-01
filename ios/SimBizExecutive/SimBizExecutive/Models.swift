import SwiftUI

enum Sector: String, Codable, CaseIterable, Identifiable {
    case electronics, mobility, health, climate
    var id: String { rawValue }
    var label: String {
        switch self { case .electronics: "Électronique"; case .mobility: "Mobilité"; case .health: "Santé"; case .climate: "Climat" }
    }
    var emoji: String { switch self { case .electronics: "⚡️"; case .mobility: "🚀"; case .health: "🧬"; case .climate: "🌱" } }
}
enum Persona: String, Codable, CaseIterable, Identifiable {
    case builder, strategist, diplomat
    var id: String { rawValue }
    var label: String { switch self { case .builder: "Bâtisseur"; case .strategist: "Stratège"; case .diplomat: "Diplomate" } }
}
enum Strategy: String, Codable, CaseIterable, Identifiable {
    case growth, margin, impact
    var id: String { rawValue }
    var label: String { switch self { case .growth: "Croissance"; case .margin: "Marge"; case .impact: "Impact" } }
}
enum Risk: String, Codable, CaseIterable, Identifiable {
    case prudent, balanced, bold
    var id: String { rawValue }
    var label: String { switch self { case .prudent: "Prudent"; case .balanced: "Équilibré"; case .bold: "Audacieux" } }
}
enum Market: String, Codable, CaseIterable, Identifiable {
    case france, europe, northAmerica, global
    var id: String { rawValue }
    var label: String {
        switch self { case .france: "France"; case .europe: "Europe"; case .northAmerica: "Amérique du Nord"; case .global: "Mondial" }
    }
}

struct CompanyProfile: Codable, Equatable {
    var name: String
    var ticker: String
    var sector: Sector
    var country: String
    var market: Market = .france
    var persona: Persona
    var strategy: Strategy
    var risk: Risk
    var emoji: String
    var accentHex: String
    var organization: String = "Équipe intégrée"
    var products: String = "Solution principale"
    var suppliers: String = "Réseau européen"
    var ceoName: String = ""
    var logoIcon: String = "cpu"
    var currency: String = "€"
    var theme: String = "midnight"
    var accentColor: Color { Color(hex: accentHex) }

    init(name: String, ticker: String, sector: Sector, country: String, market: Market = .france, persona: Persona, strategy: Strategy, risk: Risk, emoji: String, accentHex: String, organization: String = "Équipe intégrée", products: String = "Solution principale", suppliers: String = "Réseau européen", ceoName: String = "", logoIcon: String = "cpu", currency: String = "€", theme: String = "midnight") {
        self.name = name; self.ticker = ticker; self.sector = sector; self.country = country; self.market = market; self.persona = persona; self.strategy = strategy; self.risk = risk; self.emoji = emoji; self.accentHex = accentHex; self.organization = organization; self.products = products; self.suppliers = suppliers; self.ceoName = ceoName; self.logoIcon = logoIcon; self.currency = currency; self.theme = theme
    }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        name = try c.decode(String.self, forKey: .name); ticker = try c.decode(String.self, forKey: .ticker); sector = try c.decode(Sector.self, forKey: .sector); country = try c.decode(String.self, forKey: .country)
        market = try c.decodeIfPresent(Market.self, forKey: .market) ?? .france; persona = try c.decode(Persona.self, forKey: .persona); strategy = try c.decode(Strategy.self, forKey: .strategy); risk = try c.decode(Risk.self, forKey: .risk); emoji = try c.decode(String.self, forKey: .emoji); accentHex = try c.decode(String.self, forKey: .accentHex)
        organization = try c.decodeIfPresent(String.self, forKey: .organization) ?? "Équipe intégrée"; products = try c.decodeIfPresent(String.self, forKey: .products) ?? "Solution principale"; suppliers = try c.decodeIfPresent(String.self, forKey: .suppliers) ?? "Réseau européen"; ceoName = try c.decodeIfPresent(String.self, forKey: .ceoName) ?? ""; logoIcon = try c.decodeIfPresent(String.self, forKey: .logoIcon) ?? "cpu"; currency = try c.decodeIfPresent(String.self, forKey: .currency) ?? "€"; theme = try c.decodeIfPresent(String.self, forKey: .theme) ?? "midnight"
    }
}

struct Decisions: Codable, Equatable {
    var price: Double = 98
    var production: Int = 3_700
    var marketing: Double = 18_000
    var hiring: Int = 0
    var training: Double = 12_000
    var safetyStock: Int = 800
    var exportPrice: Double = 182
    var salesPeople: Int = 3
    var rndBudget: Double = 14_000
    var qualityBudget: Double = 6_000
    var loan: Double = 0
    var dividend: Double = 0
    var supplierLeadTime: Int = 14
    var crisisChoice: String = "resilience"
    var priceA: Double = 96
    var priceB: Double = 175
    var priceAExport: Double = 94
    var priceBExport: Double = 182
    var productionA: Int = 2_100
    var productionB: Int = 1_600
    var activeMachines: Int = 4
    var laborUtilizationRate: Double = 1
    var rawMaterialOrder: Int = 8_000
    var maintenanceBudget: Double = 4_000
    var qvtBudget: Double = 5_000
    var workerBonusRate: Double = 0.03
    var shortTermLoan: Double = 0
    var mediumTermLoan: Double = 0
    var loanRepayment: Double = 0
    var clientPaymentTerms: Int = 30
    var supplierContract: String = "contract"
    var marketingChannel: String = "balanced"
    var recruitmentWorkers: Int = 0
    var recruitmentSales: Int = 0
    init(price: Double = 98, production: Int = 3_700, marketing: Double = 18_000, hiring: Int = 0, training: Double = 12_000, safetyStock: Int = 800, exportPrice: Double = 182, salesPeople: Int = 3, rndBudget: Double = 14_000, qualityBudget: Double = 6_000, loan: Double = 0, dividend: Double = 0, supplierLeadTime: Int = 14, crisisChoice: String = "resilience") {
        self.price = price; self.production = production; self.marketing = marketing; self.hiring = hiring; self.training = training; self.safetyStock = safetyStock; self.exportPrice = exportPrice; self.salesPeople = salesPeople; self.rndBudget = rndBudget; self.qualityBudget = qualityBudget; self.loan = loan; self.dividend = dividend; self.supplierLeadTime = supplierLeadTime; self.crisisChoice = crisisChoice
    }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        price = try c.decodeIfPresent(Double.self, forKey: .price) ?? 98; production = try c.decodeIfPresent(Int.self, forKey: .production) ?? 3_700; marketing = try c.decodeIfPresent(Double.self, forKey: .marketing) ?? 18_000; hiring = try c.decodeIfPresent(Int.self, forKey: .hiring) ?? 0; training = try c.decodeIfPresent(Double.self, forKey: .training) ?? 12_000; safetyStock = try c.decodeIfPresent(Int.self, forKey: .safetyStock) ?? 800; exportPrice = try c.decodeIfPresent(Double.self, forKey: .exportPrice) ?? 182; salesPeople = try c.decodeIfPresent(Int.self, forKey: .salesPeople) ?? 3; rndBudget = try c.decodeIfPresent(Double.self, forKey: .rndBudget) ?? 14_000; qualityBudget = try c.decodeIfPresent(Double.self, forKey: .qualityBudget) ?? 6_000; loan = try c.decodeIfPresent(Double.self, forKey: .loan) ?? 0; dividend = try c.decodeIfPresent(Double.self, forKey: .dividend) ?? 0; supplierLeadTime = try c.decodeIfPresent(Int.self, forKey: .supplierLeadTime) ?? 14; crisisChoice = try c.decodeIfPresent(String.self, forKey: .crisisChoice) ?? "resilience"
        priceA = try c.decodeIfPresent(Double.self, forKey: .priceA) ?? 96; priceB = try c.decodeIfPresent(Double.self, forKey: .priceB) ?? 175; priceAExport = try c.decodeIfPresent(Double.self, forKey: .priceAExport) ?? 94; priceBExport = try c.decodeIfPresent(Double.self, forKey: .priceBExport) ?? 182; productionA = try c.decodeIfPresent(Int.self, forKey: .productionA) ?? 2_100; productionB = try c.decodeIfPresent(Int.self, forKey: .productionB) ?? 1_600; activeMachines = try c.decodeIfPresent(Int.self, forKey: .activeMachines) ?? 4; laborUtilizationRate = try c.decodeIfPresent(Double.self, forKey: .laborUtilizationRate) ?? 1; rawMaterialOrder = try c.decodeIfPresent(Int.self, forKey: .rawMaterialOrder) ?? 8_000; maintenanceBudget = try c.decodeIfPresent(Double.self, forKey: .maintenanceBudget) ?? 4_000; qvtBudget = try c.decodeIfPresent(Double.self, forKey: .qvtBudget) ?? 5_000; workerBonusRate = try c.decodeIfPresent(Double.self, forKey: .workerBonusRate) ?? 0.03; shortTermLoan = try c.decodeIfPresent(Double.self, forKey: .shortTermLoan) ?? 0; mediumTermLoan = try c.decodeIfPresent(Double.self, forKey: .mediumTermLoan) ?? 0; loanRepayment = try c.decodeIfPresent(Double.self, forKey: .loanRepayment) ?? 0; clientPaymentTerms = try c.decodeIfPresent(Int.self, forKey: .clientPaymentTerms) ?? 30; supplierContract = try c.decodeIfPresent(String.self, forKey: .supplierContract) ?? "contract"; marketingChannel = try c.decodeIfPresent(String.self, forKey: .marketingChannel) ?? "balanced"; recruitmentWorkers = try c.decodeIfPresent(Int.self, forKey: .recruitmentWorkers) ?? 0; recruitmentSales = try c.decodeIfPresent(Int.self, forKey: .recruitmentSales) ?? 0
    }
}

struct Metrics: Codable, Equatable {
    var revenue: Double
    var profit: Double
    var cash: Double
    var margin: Double
    var inventory: Int
    var employees: Int
    var runway: Double
    var debt: Double = 0
    var quality: Double = 0.78
    var engagement: Double = 0.78
    var marketShare: Double = 0.12
    init(revenue: Double, profit: Double, cash: Double, margin: Double, inventory: Int, employees: Int, runway: Double, debt: Double = 0, quality: Double = 0.78, engagement: Double = 0.78, marketShare: Double = 0.12) {
        self.revenue = revenue; self.profit = profit; self.cash = cash; self.margin = margin; self.inventory = inventory; self.employees = employees; self.runway = runway; self.debt = debt; self.quality = quality; self.engagement = engagement; self.marketShare = marketShare
    }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        revenue = try c.decode(Double.self, forKey: .revenue); profit = try c.decode(Double.self, forKey: .profit); cash = try c.decode(Double.self, forKey: .cash); margin = try c.decode(Double.self, forKey: .margin); inventory = try c.decode(Int.self, forKey: .inventory); employees = try c.decode(Int.self, forKey: .employees); runway = try c.decode(Double.self, forKey: .runway)
        debt = try c.decodeIfPresent(Double.self, forKey: .debt) ?? 0; quality = try c.decodeIfPresent(Double.self, forKey: .quality) ?? 0.78; engagement = try c.decodeIfPresent(Double.self, forKey: .engagement) ?? 0.78; marketShare = try c.decodeIfPresent(Double.self, forKey: .marketShare) ?? 0.12
    }
}

struct PeriodSnapshot: Codable, Equatable, Identifiable {
    var id: Int { period }
    let period: Int
    let metrics: Metrics
    let decisions: Decisions
    let forecast: Metrics?
    let event: String
}

struct GameState: Codable {
    var profile: CompanyProfile?
    var snapshot: PeriodSnapshot
    var pending: Decisions
    var history: [PeriodSnapshot]
    var messages: [Message] = Message.samples
    var objectives: [Objective] = Objective.samples
    var patents: [Patent] = Patent.samples
    var unlockedPatents: Set<String> = []
    var periodStatus: PeriodStatus = .draft
    init(profile: CompanyProfile?, snapshot: PeriodSnapshot, pending: Decisions, history: [PeriodSnapshot], messages: [Message] = Message.samples, objectives: [Objective] = Objective.samples, patents: [Patent] = Patent.samples, unlockedPatents: Set<String> = [], periodStatus: PeriodStatus = .draft) {
        self.profile = profile; self.snapshot = snapshot; self.pending = pending; self.history = history; self.messages = messages; self.objectives = objectives; self.patents = patents; self.unlockedPatents = unlockedPatents; self.periodStatus = periodStatus
    }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        profile = try c.decodeIfPresent(CompanyProfile.self, forKey: .profile); snapshot = try c.decode(PeriodSnapshot.self, forKey: .snapshot); pending = try c.decode(Decisions.self, forKey: .pending); history = try c.decode([PeriodSnapshot].self, forKey: .history)
        messages = try c.decodeIfPresent([Message].self, forKey: .messages) ?? Message.samples; objectives = try c.decodeIfPresent([Objective].self, forKey: .objectives) ?? Objective.samples; patents = try c.decodeIfPresent([Patent].self, forKey: .patents) ?? Patent.samples; unlockedPatents = try c.decodeIfPresent(Set<String>.self, forKey: .unlockedPatents) ?? []; periodStatus = try c.decodeIfPresent(PeriodStatus.self, forKey: .periodStatus) ?? .draft
    }
    static let initial = GameState(profile: nil, snapshot: PeriodSnapshot(period: 0, metrics: Metrics(revenue: 0, profit: 0, cash: 250_000, margin: 0, inventory: 800, employees: 24, runway: 4), decisions: Decisions(), forecast: nil, event: "Installation de la société"), pending: Decisions(), history: [])
}

enum PeriodStatus: String, Codable { case draft, preview, closed }
struct Message: Codable, Identifiable, Hashable {
    let id: UUID; var sender: String; var subject: String; var body: String; var unread: Bool
    static let samples = [Message(id: UUID(), sender: "Direction financière", subject: "Point de trésorerie", body: "La couverture reste confortable. Le comité recommande de préserver le coussin de liquidité.", unread: true), Message(id: UUID(), sender: "Marché", subject: "Signal concurrentiel", body: "Les prix export se tendent sur le segment premium.", unread: true)]
}
struct Objective: Codable, Identifiable, Hashable {
    let id: String; var title: String; var target: String; var progress: Double
    static let samples = [Objective(id: "cash", title: "Trésorerie positive", target: "Conserver plus de 100 k€", progress: 0.72), Objective(id: "impact", title: "Innovation utile", target: "Financer un brevet", progress: 0.35)]
}
struct Patent: Codable, Identifiable, Hashable {
    let id: String; var name: String; var detail: String; var cost: Double; var unlocked: Bool
    static let samples = [Patent(id: "eco", name: "Éco-moteur", detail: "Réduit les coûts variables de 4 %.", cost: 28_000, unlocked: false), Patent(id: "ai", name: "Pilotage prédictif", detail: "Augmente la demande adressable de 6 %.", cost: 42_000, unlocked: false)]
}

struct AdvisorRecommendation: Identifiable {
    let id: String
    let priority: String
    let title: String
    let rationale: String
    let impact: String
    let symbol: String
}

extension Color {
    init(hex: String) {
        let value = UInt64(hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted), radix: 16) ?? 0x818CF8
        self.init(.sRGB, red: Double((value >> 16) & 0xff) / 255, green: Double((value >> 8) & 0xff) / 255, blue: Double(value & 0xff) / 255, opacity: 1)
    }
    static let canvas = Color(red: 0.03, green: 0.05, blue: 0.10)
}
