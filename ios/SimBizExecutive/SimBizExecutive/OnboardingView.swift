import SwiftUI
import UIKit

struct OnboardingView: View {
    @EnvironmentObject private var store: GameStore
    @State private var name = ""; @State private var ticker = ""
    @State private var sector: Sector = .electronics; @State private var country = "France"
    @State private var persona: Persona = .strategist; @State private var strategy: Strategy = .growth
    @State private var risk: Risk = .balanced; @State private var emoji = "⚡️"; @State private var accent = Color.indigo
    @State private var step = 0
    private var valid: Bool { name.trimmingCharacters(in: .whitespacesAndNewlines).count >= 2 && ticker.count >= 2 && ticker.count <= 5 && ticker.allSatisfy(\.isLetter) }
    var body: some View {
        NavigationStack {
            Form {
                Section("Votre mandat") {
                    TextField("Nom de l’entreprise", text: $name).textInputAutocapitalization(.words)
                    TextField("Ticker (2–5 lettres)", text: $ticker).textInputAutocapitalization(.characters)
                    Picker("Secteur", selection: $sector) { ForEach(Sector.allCases) { Text("\($0.emoji) \($0.label)").tag($0) } }
                    Picker("Marché principal", selection: $country) { Text("France").tag("France"); Text("Europe").tag("Europe"); Text("Canada").tag("Canada") }
                }
                Section("Votre style de direction") {
                    Picker("Persona", selection: $persona) { ForEach(Persona.allCases) { Text($0.label).tag($0) } }
                    Picker("Stratégie", selection: $strategy) { ForEach(Strategy.allCases) { Text($0.label).tag($0) } }
                    Picker("Risque", selection: $risk) { ForEach(Risk.allCases) { Text($0.label).tag($0) } }
                }
                Section("Identité") {
                    TextField("Emoji signature", text: $emoji).font(.largeTitle)
                    ColorPicker("Accent du cockpit", selection: $accent, supportsOpacity: false)
                    GlassCard { HStack { Text(emoji).font(.system(size: 42)); VStack(alignment: .leading) { Text(name.isEmpty ? "Votre société" : name).font(.headline); Text(ticker.isEmpty ? "TICKER" : ticker.uppercased()).font(.caption.monospaced()).foregroundStyle(.secondary) }; Spacer(); Text(sector.label).font(.caption).foregroundStyle(accent) } }
                }
                Section {
                    Button("Lancer la période P0", action: start).disabled(!valid)
                } footer: { Text(valid ? "Votre premier arbitrage sera prêt dans le Cockpit." : "Saisissez un nom et un ticker de 2 à 5 lettres.") }
            }
            .navigationTitle("Bienvenue dans SimBiz")
            .scrollContentBackground(.hidden).background(Color.canvas)
        }
    }
    private func start() {
        let hex = accent.toHex() ?? "818CF8"
        store.create(profile: CompanyProfile(name: name.trimmingCharacters(in: .whitespacesAndNewlines), ticker: ticker.uppercased(), sector: sector, country: country, persona: persona, strategy: strategy, risk: risk, emoji: emoji.isEmpty ? sector.emoji : emoji, accentHex: hex))
    }
}

extension Color {
    func toHex() -> String? {
        var red: CGFloat = 0; var green: CGFloat = 0; var blue: CGFloat = 0; var alpha: CGFloat = 0
        guard UIColor(self).getRed(&red, green: &green, blue: &blue, alpha: &alpha) else { return nil }
        return String(format: "%02X%02X%02X", Int(red * 255), Int(green * 255), Int(blue * 255))
    }
}
