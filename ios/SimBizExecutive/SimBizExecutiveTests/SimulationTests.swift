import XCTest
@testable import SimBizExecutive

final class SimulationTests: XCTestCase {
    func testSimulationIsDeterministic() {
        let metrics = Metrics(revenue: 0, profit: 0, cash: 250_000, margin: 0, inventory: 800, employees: 24, runway: 4)
        let decisions = Decisions()
        XCTAssertEqual(SimulationEngine.simulate(period: 1, current: metrics, decisions: decisions), SimulationEngine.simulate(period: 1, current: metrics, decisions: decisions))
    }
    func testOnboardingValidationShape() {
        let ticker = "SIM"
        XCTAssertTrue(ticker.count >= 2 && ticker.count <= 5 && ticker.allSatisfy(\.isLetter))
        XCTAssertFalse("S!M".allSatisfy(\.isLetter))
    }
}
