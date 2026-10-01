import SwiftUI

@MainActor
final class GameStore: ObservableObject {
    @Published private(set) var state: GameState
    private let key = "simbiz.game.state"
    init() {
        if let data = UserDefaults.standard.data(forKey: key), let saved = try? JSONDecoder().decode(GameState.self, from: data) { state = saved } else { state = .initial }
    }
    func save() {
        if let data = try? JSONEncoder().encode(state) {
            UserDefaults.standard.set(data, forKey: key)
            UserDefaults(suiteName: "group.com.simbiz.executive")?.set(data, forKey: key)
        }
    }
    func create(profile: CompanyProfile) { state.profile = profile; save() }
    func update(profile: CompanyProfile) { state.profile = profile; save() }
    func update(_ decisions: Decisions) { state.pending = decisions; save() }
    func forecast() -> Metrics { SimulationEngine.forecast(period: state.snapshot.period + 1, current: state.snapshot.metrics, decisions: state.pending) }
    func simulateNext() {
        let next = SimulationEngine.simulate(period: state.snapshot.period + 1, current: state.snapshot.metrics, decisions: state.pending)
        state.history.append(state.snapshot); state.snapshot = next; state.periodStatus = .closed; save()
    }
    func preview() { state.periodStatus = .preview; save() }
    func unlock(_ patent: Patent) {
        guard state.snapshot.metrics.cash >= patent.cost else { return }
        state.unlockedPatents.insert(patent.id)
        state.patents = state.patents.map { $0.id == patent.id ? Patent(id: $0.id, name: $0.name, detail: $0.detail, cost: $0.cost, unlocked: true) : $0 }
        save()
    }
    func markMessageRead(_ message: Message) {
        state.messages = state.messages.map { $0.id == message.id ? Message(id: $0.id, sender: $0.sender, subject: $0.subject, body: $0.body, unread: false) : $0 }
        save()
    }
    func exportData() -> Data? { try? JSONEncoder().encode(state) }
    func restore(_ data: Data) throws {
        state = try JSONDecoder().decode(GameState.self, from: data)
        save()
    }
    func reset() { state = .initial; UserDefaults.standard.removeObject(forKey: key); UserDefaults(suiteName: "group.com.simbiz.executive")?.removeObject(forKey: key) }
}
