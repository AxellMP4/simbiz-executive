import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var store: GameStore
    @State private var showReset = false
    var body: some View {
        TabView {
            CockpitView().tabItem { Label("Cockpit", systemImage: "speedometer") }
            DecisionsView().tabItem { Label("Décisions", systemImage: "slider.horizontal.3") }
            CompanyView().tabItem { Label("Entreprise", systemImage: "building.2") }
            AdvisorView().tabItem { Label("Conseiller", systemImage: "sparkles") }
            ReportsView().tabItem { Label("Rapports", systemImage: "chart.xyaxis.line") }
        }
        .toolbar { ToolbarItem(placement: .topBarTrailing) { Button(role: .destructive) { showReset = true } label: { Image(systemName: "arrow.counterclockwise") }.accessibilityLabel("Nouvelle partie") } }
        .confirmationDialog("Recommencer une partie ?", isPresented: $showReset) { Button("Réinitialiser", role: .destructive) { store.reset() }; Button("Annuler", role: .cancel) {} } message: { Text("Le profil et les périodes locales seront supprimés.") }
    }
}

struct CockpitView: View {
    @EnvironmentObject private var store: GameStore
    var body: some View {
        NavigationStack { ScrollView { VStack(alignment: .leading, spacing: 18) {
            Text("Bonjour, \(store.state.profile?.name ?? "") \(store.state.profile?.emoji ?? "")").font(.largeTitle.bold())
            Text("Période P\(store.state.snapshot.period) · \(store.state.snapshot.event)").foregroundStyle(.secondary)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MetricTile(title: "Trésorerie", value: store.state.snapshot.metrics.cash.formatted(.currency(code: "EUR").precision(.fractionLength(0))), symbol: "banknote", color: .green)
                MetricTile(title: "Marge", value: store.state.snapshot.metrics.margin.formatted(.percent.precision(.fractionLength(1))), symbol: "chart.line.uptrend.xyaxis", color: .indigo)
                MetricTile(title: "Stock", value: "\(store.state.snapshot.metrics.inventory) u", symbol: "shippingbox", color: .orange)
                MetricTile(title: "Équipe", value: "\(store.state.snapshot.metrics.employees)", symbol: "person.2", color: .pink)
            }
            GlassCard { VStack(alignment: .leading, spacing: 10) { Label("Prochaine action", systemImage: "flag.checkered").font(.headline); Text("Préparez vos décisions puis simulez P\(store.state.snapshot.period + 1).").foregroundStyle(.secondary); NavigationLink("Ouvrir les décisions") { DecisionsView() }.buttonStyle(.borderedProminent) } }
        }.padding() }.background(Color.canvas).navigationTitle("Cockpit") }
    }
}

struct DecisionsView: View {
    @EnvironmentObject private var store: GameStore
    @State private var decisions = Decisions()
    var body: some View {
        NavigationStack { Form {
            Section("Prévision P\(store.state.snapshot.period + 1)") { let m = SimulationEngine.forecast(period: store.state.snapshot.period + 1, current: store.state.snapshot.metrics, decisions: decisions); Text("CA prévu \(m.revenue.formatted(.currency(code: "EUR").precision(.fractionLength(0)))) · résultat \(m.profit.formatted(.currency(code: "EUR").precision(.fractionLength(0))))").font(.headline) }
            Section("Commerce") { HStack { Text("Prix moyen"); Spacer(); Text(decisions.price.formatted(.currency(code: "EUR"))) }; Slider(value: $decisions.price, in: 75...130, step: 1).accessibilityLabel("Prix moyen") ; Stepper("Marketing \(decisions.marketing.formatted(.currency(code: "EUR").precision(.fractionLength(0))))", value: $decisions.marketing, in: 0...60_000, step: 2_000) }
            Section("Opérations") { Stepper("Production \(decisions.production) unités", value: $decisions.production, in: 1_000...8_000, step: 100); Stepper("Stock de sécurité \(decisions.safetyStock)", value: $decisions.safetyStock, in: 0...2_000, step: 100) }
            Section("Équipe") { Stepper("Recrutement \(decisions.hiring)", value: $decisions.hiring, in: -5...10); Stepper("Formation \(decisions.training.formatted(.currency(code: "EUR").precision(.fractionLength(0))))", value: $decisions.training, in: 0...50_000, step: 1_000) }
            Section { Button("Enregistrer puis simuler P\(store.state.snapshot.period + 1)") { store.update(decisions); store.simulateNext() }.buttonStyle(.borderedProminent) }
        }.navigationTitle("Décisions").onAppear { decisions = store.state.pending }.scrollContentBackground(.hidden).background(Color.canvas) }
    }
}

struct CompanyView: View { @EnvironmentObject private var store: GameStore; var body: some View { NavigationStack { List { Section("Profil") { LabeledContent("Société", value: store.state.profile?.name ?? ""); LabeledContent("Ticker", value: store.state.profile?.ticker ?? ""); LabeledContent("Secteur", value: "\(store.state.profile?.sector.emoji ?? "") \(store.state.profile?.sector.label ?? "")") }; Section("Capacité") { LabeledContent("Collaborateurs", value: "\(store.state.snapshot.metrics.employees)"); LabeledContent("Runway", value: "\(store.state.snapshot.metrics.runway.formatted(.number.precision(.fractionLength(1))) ) périodes") } }.navigationTitle("Entreprise") } } }
struct AdvisorView: View { @EnvironmentObject private var store: GameStore; var body: some View { NavigationStack { List(SimulationEngine.advisor(for: store.state)) { item in HStack(alignment: .top, spacing: 12) { Image(systemName: item.symbol).foregroundStyle(.orange); VStack(alignment: .leading) { Text(item.priority.uppercased()).font(.caption.weight(.bold)).foregroundStyle(.secondary); Text(item.title).font(.headline); Text(item.rationale).font(.subheadline).foregroundStyle(.secondary); Text(item.impact).font(.caption).foregroundStyle(.green) } } }.navigationTitle("Conseiller") } } }
struct ReportsView: View { @EnvironmentObject private var store: GameStore; var body: some View { NavigationStack { List(store.state.history.reversed()) { period in VStack(alignment: .leading) { Text("Période P\(period.period)").font(.headline); Text("CA \(period.metrics.revenue.formatted(.currency(code: "EUR").precision(.fractionLength(0)))) · résultat \(period.metrics.profit.formatted(.currency(code: "EUR").precision(.fractionLength(0))))").foregroundStyle(.secondary) } }.navigationTitle("Rapports") } } }
