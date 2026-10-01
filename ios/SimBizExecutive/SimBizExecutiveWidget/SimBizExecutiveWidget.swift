import WidgetKit
import SwiftUI

struct SimBizEntry: TimelineEntry { let date: Date; let cash: Double; let recommendation: String }
struct SimBizProvider: TimelineProvider {
    private func entry() -> SimBizEntry {
        let defaults = UserDefaults(suiteName: "group.com.simbiz.executive")
        if let data = defaults?.data(forKey: "simbiz.game.state"),
           let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let snapshot = root["snapshot"] as? [String: Any],
           let metrics = snapshot["metrics"] as? [String: Any],
           let cash = metrics["cash"] as? Double {
            let runway = metrics["runway"] as? Double ?? 4
            return .init(date: .now, cash: cash, recommendation: runway < 2 ? "Sécuriser la trésorerie" : "Maintenir le momentum")
        }
        return .init(date: .now, cash: 250_000, recommendation: "Maintenir le momentum")
    }
    func placeholder(in context: Context) -> SimBizEntry { entry() }
    func getSnapshot(in context: Context, completion: @escaping (SimBizEntry) -> Void) { completion(placeholder(in: context)) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimBizEntry>) -> Void) { completion(Timeline(entries: [entry()], policy: .after(.now.addingTimeInterval(900)))) }
}
struct SimBizExecutiveWidget: Widget {
    var body: some WidgetConfiguration { StaticConfiguration(kind: "SimBizExecutiveWidget", provider: SimBizProvider()) { entry in VStack(alignment: .leading) { Text("SIMBIZ EXECUTIVE").font(.caption.bold()); Text(entry.cash.formatted(.currency(code: "EUR").precision(.fractionLength(0)))).font(.title2.bold()); Text(entry.recommendation).font(.caption).foregroundStyle(.secondary) }.padding() }.configurationDisplayName("Cockpit SimBiz").description("Trésorerie et conseil du moment.").supportedFamilies([.systemSmall, .systemMedium]) }
}
