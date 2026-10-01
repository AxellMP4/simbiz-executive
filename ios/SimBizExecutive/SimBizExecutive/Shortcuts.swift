import AppIntents

struct SimulateNextPeriodIntent: AppIntent {
    static let title: LocalizedStringResource = "Simuler la prochaine période"
    static let description = IntentDescription("Lance la prochaine période de SimBiz Executive.")
    func perform() async throws -> some IntentResult {
        await MainActor.run { GameStore().simulateNext() }
        return .result()
    }
}
