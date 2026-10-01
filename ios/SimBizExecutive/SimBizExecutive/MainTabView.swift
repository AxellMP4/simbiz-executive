import SwiftUI
import Charts
import UniformTypeIdentifiers

struct MainTabView: View {
    @EnvironmentObject private var store: GameStore
    @State private var selection = "cockpit"
    @State private var reset = false
    var body: some View {
        Group {
            if horizontalSizeClass == .regular {
                NavigationSplitView { sidebar } detail: { destination }
            } else {
                TabView(selection: $selection) {
                    destinationFor("cockpit").tabItem { Label("Cockpit", systemImage: "speedometer") }.tag("cockpit")
                    destinationFor("decisions").tabItem { Label("Décisions", systemImage: "slider.horizontal.3") }.tag("decisions")
                    destinationFor("results").tabItem { Label("Résultats", systemImage: "chart.xyaxis.line") }.tag("results")
                    destinationFor("company").tabItem { Label("Entreprise", systemImage: "building.2") }.tag("company")
                    destinationFor("more").tabItem { Label("Plus", systemImage: "ellipsis.circle") }.tag("more")
                }
            }
        }
        .background(Color.canvas)
        .confirmationDialog("Recommencer une partie ?", isPresented: $reset) {
            Button("Réinitialiser", role: .destructive) { store.reset() }
            Button("Annuler", role: .cancel) {}
        }
    }
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    private var sidebar: some View {
        List {
            Section { Label(store.state.profile?.name ?? "SimBiz", systemImage: "building.2").font(.headline) }
            Section("Pilotage") {
                navButton("cockpit", "Cockpit exécutif", "speedometer"); navButton("recap", "Récapitulatif", "rectangle.3.group"); navButton("decisions", "Décisions", "slider.horizontal.3"); navButton("results", "Résultats", "chart.xyaxis.line")
            }
            Section("Écosystème") { navButton("market", "Marché", "globe.europe.africa"); navButton("hr", "Ressources humaines", "person.2"); navButton("board", "Conseil & R&D", "lightbulb") }
            Section("Ressources") { navButton("messages", "Messagerie", "envelope"); navButton("tools", "Outils", "wrench.and.screwdriver"); navButton("docs", "Documentation", "book") }
            Section { navButton("company", "Company Lab", "building.2.crop.circle"); Button("Nouvelle partie", role: .destructive) { reset = true } }
        }
        .listStyle(.sidebar)
    }
    private func navButton(_ id: String, _ title: String, _ icon: String) -> some View { Button { selection = id } label: { Label(title, systemImage: icon) }.foregroundStyle(.primary) }
    @ViewBuilder private var destination: some View { destinationFor(selection) }
    @ViewBuilder private func destinationFor(_ id: String) -> some View {
        switch id {
        case "recap": RecapView()
        case "decisions": DecisionsView()
        case "results": ResultsView()
        case "market": MarketView()
        case "hr": HRView()
        case "board": BoardView()
        case "messages": MessagesView()
        case "tools": ToolsView()
        case "docs": DocumentationView()
        case "company": CompanyView()
        case "more": MoreView()
        default: CockpitView()
        }
    }
}

struct CockpitView: View {
    @EnvironmentObject private var store: GameStore
    var body: some View {
        NavigationStack { ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Bonjour, \(store.state.profile?.name ?? "Comité exécutif") \(store.state.profile?.emoji ?? "✦")").font(.largeTitle.bold())
                Text("Période P\(store.state.snapshot.period) · \(store.state.snapshot.event)").foregroundStyle(.secondary)
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))], spacing: 12) {
                    MetricTile(title: "Chiffre d'affaires", value: money(store.state.snapshot.metrics.revenue), symbol: "eurosign", color: .indigo)
                    MetricTile(title: "Résultat", value: money(store.state.snapshot.metrics.profit), symbol: "chart.line.uptrend.xyaxis", color: .green)
                    MetricTile(title: "Trésorerie", value: money(store.state.snapshot.metrics.cash), symbol: "banknote", color: .cyan)
                    MetricTile(title: "Marge", value: store.state.snapshot.metrics.margin.formatted(.percent.precision(.fractionLength(1))), symbol: "percent", color: .orange)
                }

                GlassCard { VStack(alignment: .leading, spacing: 10) {
                    Label("Recommandation déterministe", systemImage: "sparkles").font(.headline)
                    let advice = SimulationEngine.advisor(for: store.state).first!
                    Text(advice.title).font(.title3.bold()); Text(advice.rationale).foregroundStyle(.secondary)
                    Text(advice.impact).font(.caption).foregroundStyle(.green)
                }}
                Button { store.preview() } label: { Label("Prévisualiser les décisions de P\(store.state.snapshot.period + 1)", systemImage: "eye") }.buttonStyle(.bordered)
                Button { store.simulateNext() } label: { Label("Clôturer P\(store.state.snapshot.period + 1)", systemImage: "play.fill") }.buttonStyle(.borderedProminent)
            }.padding()
        }.background(Color.canvas).navigationTitle("Cockpit") }
    }
}

struct RecapView: View {
    @EnvironmentObject private var store: GameStore
    var body: some View {
        NavigationStack { List {
            Section("Période \(store.state.snapshot.period) · Réalisé") {
                Label(store.state.snapshot.event, systemImage: "calendar.badge.checkmark")
                LabeledContent("Chiffre d'affaires", value: money(store.state.snapshot.metrics.revenue))
                LabeledContent("Résultat net", value: money(store.state.snapshot.metrics.profit))
                LabeledContent("Caisse", value: money(store.state.snapshot.metrics.cash))
            }
            Section("Prochaine période") {
                LabeledContent("Production planifiée", value: "\(store.state.pending.productionA + store.state.pending.productionB) unités")
                LabeledContent("Prévision CA", value: money(SimulationEngine.forecast(period: store.state.snapshot.period + 1, current: store.state.snapshot.metrics, decisions: store.state.pending).revenue))
                LabeledContent("Statut", value: store.state.periodStatus == .preview ? "Prévision générée" : "Brouillon")
            }
            Section("À retenir") {
                Text("Les prévisions n'ont aucun impact sur le réalisé jusqu'à la clôture de la période.")
            }
        }.navigationTitle("Récapitulatif") }
    }
}

struct DecisionsView: View {
    @EnvironmentObject private var store: GameStore
    @State private var decisions = Decisions()
    var forecast: Metrics { SimulationEngine.forecast(period: store.state.snapshot.period + 1, current: store.state.snapshot.metrics, decisions: decisions) }
    var body: some View {
        NavigationStack { Form {
            Section("Prévision P\(store.state.snapshot.period + 1)") { LabeledContent("CA prévu", value: money(forecast.revenue)); LabeledContent("Résultat prévu", value: money(forecast.profit)); LabeledContent("Marge", value: forecast.margin.formatted(.percent.precision(.fractionLength(1)))) }
            Section("Marketing & ventes") { Slider(value: $decisions.priceA, in: 60...140, step: 1) { Text("Prix Alpha local") }; Slider(value: $decisions.priceB, in: 120...240, step: 1) { Text("Prix Apex local") }; Text("Export Alpha \(money(decisions.priceAExport)) · Apex \(money(decisions.priceBExport))"); Stepper("Commerciaux export : \(decisions.salesPeople)", value: $decisions.salesPeople, in: 0...12); Stepper("Marketing : \(money(decisions.marketing))", value: $decisions.marketing, in: 0...60_000, step: 2_000); Picker("Canal", selection: $decisions.marketingChannel) { Text("Digital").tag("digital"); Text("Équilibré").tag("balanced"); Text("Événements B2B").tag("b2b_events") } }
            Section("Production & chaîne d'approvisionnement") { Stepper("Production totale : \(decisions.productionA + decisions.productionB) unités", value: $decisions.productionA, in: 0...8_000, step: 100); Stepper("Produit Apex : \(decisions.productionB) unités", value: $decisions.productionB, in: 0...8_000, step: 100); Stepper("Machines actives : \(decisions.activeMachines)", value: $decisions.activeMachines, in: 1...12); Stepper("Commande matières : \(decisions.rawMaterialOrder)", value: $decisions.rawMaterialOrder, in: 0...20_000, step: 500); Stepper("Stock de sécurité : \(decisions.safetyStock)", value: $decisions.safetyStock, in: 0...2_000, step: 100); Picker("Contrat fournisseur", selection: $decisions.supplierContract) { Text("Spot").tag("spot"); Text("Contrat cadre").tag("contract") } }
            Section("Investissements, qualité & RH") { Stepper("Maintenance : \(money(decisions.maintenanceBudget))", value: $decisions.maintenanceBudget, in: 0...40_000, step: 1_000); Stepper("R&D : \(money(decisions.rndBudget))", value: $decisions.rndBudget, in: 0...80_000, step: 2_000); Stepper("Qualité & QVT : \(money(decisions.qvtBudget))", value: $decisions.qvtBudget, in: 0...40_000, step: 1_000); Stepper("Formation : \(money(decisions.training))", value: $decisions.training, in: 0...50_000, step: 1_000); Stepper("Recrutement production : \(decisions.recruitmentWorkers)", value: $decisions.recruitmentWorkers, in: -10...20); Stepper("Recrutement ventes : \(decisions.recruitmentSales)", value: $decisions.recruitmentSales, in: -5...12) }
            Section("Finance & risque") { Stepper("Emprunt court terme : \(money(decisions.shortTermLoan))", value: $decisions.shortTermLoan, in: 0...200_000, step: 10_000); Stepper("Emprunt moyen terme : \(money(decisions.mediumTermLoan))", value: $decisions.mediumTermLoan, in: 0...500_000, step: 10_000); Stepper("Remboursement : \(money(decisions.loanRepayment))", value: $decisions.loanRepayment, in: 0...200_000, step: 10_000); Stepper("Dividende : \(money(decisions.dividend))", value: $decisions.dividend, in: 0...100_000, step: 5_000); Picker("Délai client", selection: $decisions.clientPaymentTerms) { Text("30 jours").tag(30); Text("60 jours").tag(60); Text("90 jours").tag(90) }; Picker("Posture de crise", selection: $decisions.crisisChoice) { Text("Résilience").tag("resilience"); Text("Offensive").tag("offensive"); Text("Économie").tag("saving") } }
            Section {
                Button("Enregistrer la feuille") { store.update(decisions) }.buttonStyle(.bordered)
                Button("Enregistrer et clôturer P\(store.state.snapshot.period + 1)") { store.update(decisions); store.simulateNext() }.buttonStyle(.borderedProminent)
            }
        }.navigationTitle("Décisions").onAppear { decisions = store.state.pending }.scrollContentBackground(.hidden).background(Color.canvas) }
    }
}

struct ResultsView: View {
    @EnvironmentObject private var store: GameStore
    @State private var selectedPeriod = 0
    private var periods: [PeriodSnapshot] { store.state.history + [store.state.snapshot] }
    private var selected: PeriodSnapshot { periods.first(where: { $0.period == selectedPeriod }) ?? store.state.snapshot }
    var body: some View {
        NavigationStack { ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("États financiers").font(.title.bold())
                Picker("Période", selection: $selectedPeriod) { ForEach(periods) { Text("P\($0.period) · \($0.period == store.state.snapshot.period ? "Réalisé" : "Historique")").tag($0.period) } }.pickerStyle(.menu)
                Chart(store.state.history + [store.state.snapshot]) { period in
                    BarMark(x: .value("Période", "P\(period.period)"), y: .value("Résultat", period.metrics.profit)).foregroundStyle(.indigo)
                }.frame(height: 180).accessibilityLabel("Évolution du résultat par période")
                GlassCard { VStack(alignment: .leading) { Text("Compte de résultat · P\(selected.period)").font(.headline); LabeledContent("Ventes", value: money(selected.metrics.revenue)); LabeledContent("Coûts de production", value: money(max(0, selected.metrics.revenue - selected.metrics.profit))); LabeledContent("Marge brute", value: money(selected.metrics.revenue * selected.metrics.margin)); LabeledContent("Résultat net", value: money(selected.metrics.profit)); LabeledContent("Trésorerie", value: money(selected.metrics.cash)) } }
                GlassCard { VStack(alignment: .leading) { Text("Bilan & ratios").font(.headline); LabeledContent("Stocks", value: "\(selected.metrics.inventory) unités"); LabeledContent("Dette", value: money(selected.metrics.debt)); LabeledContent("Solvabilité", value: selected.metrics.debt > 0 ? (selected.metrics.cash / selected.metrics.debt).formatted(.percent.precision(.fractionLength(1))) : "100 %"); LabeledContent("Part de marché", value: selected.metrics.marketShare.formatted(.percent.precision(.fractionLength(1)))); LabeledContent("Score qualité", value: selected.metrics.quality.formatted(.percent.precision(.fractionLength(1)))) } }
            }.padding()
        }.navigationTitle("Résultats").onAppear { selectedPeriod = store.state.snapshot.period } }
    }
}

struct CompanyView: View {
    @EnvironmentObject private var store: GameStore
    @State private var profile = CompanyProfile(name: "", ticker: "", sector: .electronics, country: "France", persona: .strategist, strategy: .growth, risk: .balanced, emoji: "⚡️", accentHex: "818CF8")
    var body: some View {
        NavigationStack { Form {
            Section("Identité") { TextField("Nom de l'entreprise", text: $profile.name); TextField("Ticker", text: $profile.ticker); TextField("Nom du CEO", text: $profile.ceoName); TextField("Emoji / icône", text: $profile.emoji); Picker("Monnaie", selection: $profile.currency) { Text("Euro (€)").tag("€"); Text("Dollar ($)").tag("$"); Text("Livre (£)").tag("£"); Text("Franc suisse (CHF)").tag("CHF") }; ColorPicker("Couleur de marque", selection: Binding(get: { profile.accentColor }, set: { profile.accentHex = $0.toHex() ?? profile.accentHex }), supportsOpacity: false) }
            Section("Marché") { Picker("Secteur", selection: $profile.sector) { ForEach(Sector.allCases) { Text("\($0.emoji) \($0.label)").tag($0) } }; Picker("Pays", selection: $profile.country) { Text("France").tag("France"); Text("Belgique").tag("Belgique"); Text("Canada").tag("Canada") }; Picker("Marché cible", selection: $profile.market) { ForEach(Market.allCases) { Text($0.label).tag($0) } } }
            Section("Direction") { Picker("CEO / persona", selection: $profile.persona) { ForEach(Persona.allCases) { Text($0.label).tag($0) } }; Picker("Stratégie", selection: $profile.strategy) { ForEach(Strategy.allCases) { Text($0.label).tag($0) } }; Picker("Risque", selection: $profile.risk) { ForEach(Risk.allCases) { Text($0.label).tag($0) } } }
            Section("Organisation & offre") { Picker("Structure", selection: $profile.organization) { Text("Fonctionnelle").tag("Fonctionnelle"); Text("Divisionnelle").tag("Divisionnelle"); Text("Matrice").tag("Matrice"); Text("Holacratique").tag("Holacratique") }; TextField("Portefeuille produits", text: $profile.products); TextField("Fournisseurs", text: $profile.suppliers) }
            Section { Button("Enregistrer le profil") { store.update(profile: profile) }.disabled(profile.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || profile.ticker.count < 2).buttonStyle(.borderedProminent) }
            Section("Capacité actuelle") { LabeledContent("Collaborateurs", value: "\(store.state.snapshot.metrics.employees)"); LabeledContent("Part de marché", value: store.state.snapshot.metrics.marketShare.formatted(.percent.precision(.fractionLength(1)))); LabeledContent("Dette", value: money(store.state.snapshot.metrics.debt)); LabeledContent("Runway", value: "\(store.state.snapshot.metrics.runway.formatted(.number.precision(.fractionLength(1)))) périodes") }
        }.navigationTitle("Company Lab").onAppear { if let saved = store.state.profile { profile = saved } }.scrollContentBackground(.hidden).background(Color.canvas) }
    }
}
struct MarketView: View {
    @EnvironmentObject private var store: GameStore
    var body: some View { NavigationStack { ScrollView { VStack(alignment: .leading, spacing: 14) {
        Text("Marché \(store.state.profile?.market.label ?? "France")").font(.title.bold())
        GlassCard { VStack(alignment: .leading) { Label("Demande", systemImage: "arrow.up.right").foregroundStyle(.green); Text("La demande B2B progresse de 4,2 % cette période. Le prix et la qualité arbitrent la conversion.") } }
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 145))]) { MetricTile(title: "Part de marché", value: store.state.snapshot.metrics.marketShare.formatted(.percent.precision(.fractionLength(1))), symbol: "chart.pie", color: .indigo); MetricTile(title: "Prix local", value: money(store.state.pending.price), symbol: "tag", color: .orange); MetricTile(title: "Prix premium", value: money(store.state.pending.exportPrice), symbol: "globe", color: .cyan) }
        GlassCard { VStack(alignment: .leading) { Text("Repères concurrentiels").font(.headline); LabeledContent("Leader prix", value: "92 €"); LabeledContent("Leader premium", value: "118 €"); LabeledContent("Votre budget marketing", value: money(store.state.pending.marketing)) } }
    }.padding() }.navigationTitle("Marché") } }
}
struct HRView: View {
    @EnvironmentObject private var store: GameStore
    var body: some View { NavigationStack { List { Section("Équipe") { LabeledContent("Effectif", value: "\(store.state.snapshot.metrics.employees)"); LabeledContent("Recrutement prévu", value: "\(store.state.pending.hiring)"); LabeledContent("Budget formation", value: money(store.state.pending.training)); ProgressView("Engagement", value: store.state.snapshot.metrics.engagement); ProgressView("Qualité opérationnelle", value: store.state.snapshot.metrics.quality) }; Section("Pilotage social") { Label(store.state.snapshot.metrics.engagement > 0.7 ? "Engagement solide" : "Engagement à renforcer", systemImage: store.state.snapshot.metrics.engagement > 0.7 ? "checkmark.circle.fill" : "exclamationmark.triangle.fill").foregroundStyle(store.state.snapshot.metrics.engagement > 0.7 ? .green : .orange); Text("La formation, les recrutements et la charge influencent l'engagement à la prochaine clôture.") }; Section("Départements") { LabeledContent("Opérations", value: "\(max(1, Int(Double(store.state.snapshot.metrics.employees) * 0.58)))"); LabeledContent("Commerce", value: "\(store.state.pending.salesPeople) export"); LabeledContent("R&D", value: money(store.state.pending.rndBudget)) } }.navigationTitle("Ressources humaines") } } }
struct BoardView: View { @EnvironmentObject private var store: GameStore; var body: some View { NavigationStack { List { Section("Objectifs") { ForEach(store.state.objectives) { o in VStack(alignment: .leading) { Text(o.title).font(.headline); Text(o.target).font(.caption).foregroundStyle(.secondary); ProgressView(value: o.progress) } } }; Section("Portefeuille R&D") { ForEach(store.state.patents) { patent in HStack { VStack(alignment: .leading) { Text(patent.name); Text(patent.detail).font(.caption).foregroundStyle(.secondary) }; Spacer(); if patent.unlocked { Label("Actif", systemImage: "checkmark.seal.fill").foregroundStyle(.green) } else { Button(money(patent.cost)) { store.unlock(patent) }.buttonStyle(.bordered) } } } } }.navigationTitle("Conseil & R&D") } } }
struct MessagesView: View { @EnvironmentObject private var store: GameStore; var body: some View { NavigationStack { List(store.state.messages) { message in Button { store.markMessageRead(message) } label: { VStack(alignment: .leading) { HStack { Text(message.sender).font(.headline); Spacer(); if message.unread { Circle().fill(.indigo).frame(width: 8) } }; Text(message.subject); Text(message.body).font(.caption).foregroundStyle(.secondary) } }.foregroundStyle(.primary) }.navigationTitle("Messagerie") } } }
struct MoreView: View { var body: some View { NavigationStack { List { NavigationLink("Récapitulatif", destination: RecapView()); NavigationLink("Messagerie", destination: MessagesView()); NavigationLink("Outils", destination: ToolsView()); NavigationLink("Documentation", destination: DocumentationView()); NavigationLink("Conseiller", destination: AdvisorView()) }.navigationTitle("Ressources") } } }
struct AdvisorView: View { @EnvironmentObject private var store: GameStore; var body: some View { NavigationStack { List(SimulationEngine.advisor(for: store.state)) { item in Label { VStack(alignment: .leading) { Text(item.title).font(.headline); Text(item.rationale).font(.caption).foregroundStyle(.secondary) } } icon: { Image(systemName: item.symbol).foregroundStyle(.orange) } }.navigationTitle("Conseiller") } } }
struct DocumentationView: View { var body: some View { NavigationStack { List { Section("Comment jouer") { Text("Préparez une feuille de décisions, prévisualisez son impact, puis clôturez la période. Les résultats réalisés sont immuables."); Text("Le moteur est déterministe : une même période et les mêmes leviers donnent toujours le même résultat.") }; Section("Glossaire") { LabeledContent("Runway", value: "Nombre de périodes couvertes par la trésorerie"); LabeledContent("Prévision", value: "Scénario non enregistré"); LabeledContent("Réalisé", value: "Période clôturée") } }.navigationTitle("Documentation") } } }

struct ToolsView: View {
    @EnvironmentObject private var store: GameStore; @State private var importing = false; @State private var exporting = false
    var body: some View { NavigationStack { List { Section("Sauvegarde locale") { Button("Exporter une sauvegarde JSON") { exporting = true }; Button("Restaurer une sauvegarde") { importing = true }; Text("La sauvegarde reste sur cet appareil et peut être transférée via le menu Partager.").font(.caption).foregroundStyle(.secondary) }; Section("Données") { LabeledContent("Périodes clôturées", value: "\(store.state.history.count)"); LabeledContent("Statut", value: store.state.periodStatus.rawValue.capitalized) } }.navigationTitle("Outils").fileExporter(isPresented: $exporting, document: BackupDocument(data: store.exportData() ?? Data()), contentType: .json, defaultFilename: "simbiz-backup.json") { _ in }.fileImporter(isPresented: $importing, allowedContentTypes: [.json]) { result in if case .success(let url) = result, let data = try? Data(contentsOf: url) { try? store.restore(data) } } } }
}
struct BackupDocument: FileDocument { static var readableContentTypes: [UTType] { [.json] }; var data: Data; init(data: Data) { self.data = data }; init(configuration: ReadConfiguration) throws { data = configuration.file.regularFileContents ?? Data() }; func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: data) } }
private func money(_ value: Double) -> String { value.formatted(.currency(code: "EUR").precision(.fractionLength(0))) }
