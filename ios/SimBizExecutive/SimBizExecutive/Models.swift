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

struct CompanyProfile: Codable, Equatable {
    var name: String
    var ticker: String
    var sector: Sector
    var country: String
    var persona: Persona
    var strategy: Strategy
    var risk: Risk
    var emoji: String
    var accentHex: String
    var accentColor: Color { Color(hex: accentHex) }
}

struct Decisions: Codable, Equatable {
    var price: Double = 98
    var production: Int = 3_700
    var marketing: Double = 18_000
    var hiring: Int = 0
    var training: Double = 12_000
    var safetyStock: Int = 800
}

struct Metrics: Codable, Equatable {
    var revenue: Double
    var profit: Double
    var cash: Double
    var margin: Double
    var inventory: Int
    var employees: Int
    var runway: Double
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
    static let initial = GameState(profile: nil, snapshot: PeriodSnapshot(period: 0, metrics: Metrics(revenue: 0, profit: 0, cash: 250_000, margin: 0, inventory: 800, employees: 24, runway: 4), decisions: Decisions(), forecast: nil, event: "Installation de la société"), pending: Decisions(), history: [])
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
