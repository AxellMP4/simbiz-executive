import Foundation

struct SimulationEngine {
    static func simulate(period: Int, current: Metrics, decisions: Decisions) -> PeriodSnapshot {
        let demandFactor = 1.0 + Double((period * 17) % 7) / 100
        let sold = min(decisions.production + current.inventory, Int(4_250 * demandFactor))
        let revenue = Double(sold) * decisions.price
        let variableCost = Double(decisions.production) * 47
        let operatingCost = decisions.marketing + decisions.training + Double(max(0, decisions.hiring)) * 4_200
        let profit = revenue - variableCost - operatingCost
        let cash = current.cash + profit - Double(max(0, decisions.hiring)) * 2_000
        let margin = revenue > 0 ? profit / revenue : 0
        let inventory = max(0, current.inventory + decisions.production - sold)
        let outflow = max(1, variableCost + operatingCost)
        let metrics = Metrics(revenue: revenue, profit: profit, cash: cash, margin: margin, inventory: inventory, employees: current.employees + decisions.hiring, runway: cash / outflow)
        return PeriodSnapshot(period: period, metrics: metrics, decisions: decisions, forecast: nil, event: period == 1 ? "Demande B2B en accélération" : "Marché stable")
    }

    static func forecast(period: Int, current: Metrics, decisions: Decisions) -> Metrics {
        simulate(period: period, current: current, decisions: decisions).metrics
    }

    static func advisor(for state: GameState) -> [AdvisorRecommendation] {
        let m = state.snapshot.metrics
        var items: [AdvisorRecommendation] = []
        if m.runway < 2 {
            items.append(.init(id: "cash", priority: "Priorité haute", title: "Sécuriser la trésorerie", rationale: "La couverture estimée est de \(m.runway.formatted(.number.precision(.fractionLength(1))) ) période.", impact: "Réduire le risque de rupture de paiement.", symbol: "exclamationmark.triangle.fill"))
        }
        if state.pending.safetyStock < 600 {
            items.append(.init(id: "stock", priority: "À surveiller", title: "Remonter le stock de sécurité", rationale: "Le coussin actuel peut absorber difficilement un pic de demande.", impact: "Protéger le chiffre d’affaires de P1.", symbol: "shippingbox.fill"))
        }
        if state.pending.training < 10_000 {
            items.append(.init(id: "people", priority: "Opportunité", title: "Investir dans les équipes", rationale: "La formation est sous le seuil de productivité recommandé.", impact: "Améliorer la qualité et la capacité future.", symbol: "person.2.fill"))
        }
        if items.isEmpty {
            items.append(.init(id: "momentum", priority: "Bon cap", title: "Maintenir le momentum", rationale: "Les décisions sont équilibrées entre croissance, marge et résilience.", impact: "Conserver une trajectoire saine pour la prochaine période.", symbol: "sparkles"))
        }
        return items
    }
}
