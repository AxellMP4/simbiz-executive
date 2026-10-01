import SwiftUI

@MainActor
final class GameStore: ObservableObject {
    @Published private(set) var state: GameState
    private let key = "simbiz.game.state"
    init() {
        if let data = UserDefaults.standard.data(forKey: key), let saved = try? JSONDecoder().decode(GameState.self, from: data) { state = saved } else { state = .initial }
    }
    func save() { if let data = try? JSONEncoder().encode(state) { UserDefaults.standard.set(data, forKey: key) } }
    func create(profile: CompanyProfile) { state.profile = profile; save() }
    func update(_ decisions: Decisions) { state.pending = decisions; save() }
    func forecast() -> Metrics { SimulationEngine.forecast(period: state.snapshot.period + 1, current: state.snapshot.metrics, decisions: state.pending) }
    func simulateNext() { let next = SimulationEngine.simulate(period: state.snapshot.period + 1, current: state.snapshot.metrics, decisions: state.pending); state.history.append(state.snapshot); state.snapshot = next; save() }
    func reset() { state = .initial; UserDefaults.standard.removeObject(forKey: key) }
}
