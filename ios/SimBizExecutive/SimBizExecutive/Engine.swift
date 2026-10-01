import Foundation

struct SimulationEngine {
    static func simulate(period: Int, current: Metrics, decisions: Decisions) -> PeriodSnapshot {
        let crisisFactor = decisions.crisisChoice == "offensive" ? 1.06 : decisions.crisisChoice == "saving" ? 0.94 : 1.0
        let demandFactor = (1.0 + Double((period * 17) % 7) / 100 + min(decisions.marketing / 100_000, 0.16)) * crisisFactor
        let plannedProduction = max(decisions.production, decisions.productionA + decisions.productionB)
        let sold = min(plannedProduction + current.inventory, Int(4_250 * demandFactor) + decisions.salesPeople * 90)
        let productMixRevenue = Double(min(sold, decisions.productionA)) * decisions.priceA + Double(max(0, sold - decisions.productionA)) * decisions.priceB
        let revenue = productMixRevenue + Double(decisions.salesPeople) * decisions.exportPrice * 180
        let variableCost = Double(plannedProduction + decisions.rawMaterialOrder / 20) * (47 - min(decisions.rndBudget / 20_000, 4))
        let operatingCost = decisions.marketing + decisions.training + decisions.rndBudget + decisions.qualityBudget + Double(max(0, decisions.hiring)) * 4_200 + Double(decisions.salesPeople) * 3_800
        let interest = currentDebt(current: current) * 0.012
        let profit = revenue - variableCost - operatingCost - interest + decisions.loan
        let cash = current.cash + profit - Double(max(0, decisions.hiring)) * 2_000 - decisions.dividend
        let margin = revenue > 0 ? profit / revenue : 0
        let inventory = max(0, current.inventory + plannedProduction - sold)
        let outflow = max(1, variableCost + operatingCost)
        let engagement = min(1, max(0.35, 0.7 + decisions.training / 100_000 - Double(max(0, -decisions.hiring)) / 100))
        let quality = min(1, max(0.4, 0.7 + decisions.qualityBudget / 100_000 + decisions.rndBudget / 200_000))
        let share = min(0.75, max(0.01, current.marketShare + Double(sold) / 100_000 - (decisions.price - 98) / 10_000))
        let metrics = Metrics(revenue: revenue, profit: profit, cash: cash, margin: margin, inventory: inventory, employees: max(0, current.employees + decisions.hiring), runway: cash / outflow, debt: max(0, current.debt + decisions.loan), quality: quality, engagement: engagement, marketShare: share)
        return PeriodSnapshot(period: period, metrics: metrics, decisions: decisions, forecast: nil, event: period == 1 ? "Demande B2B en accélération" : "Marché stable")
    }

    private static func currentDebt(current: Metrics) -> Double { current.debt }

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
