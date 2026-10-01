import WidgetKit
import SwiftUI

struct SimBizEntry: TimelineEntry { let date: Date; let cash: Double; let recommendation: String }
struct SimBizProvider: TimelineProvider {
    func placeholder(in context: Context) -> SimBizEntry { .init(date: .now, cash: 250_000, recommendation: "Maintenir le momentum") }
    func getSnapshot(in context: Context, completion: @escaping (SimBizEntry) -> Void) { completion(placeholder(in: context)) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimBizEntry>) -> Void) { completion(Timeline(entries: [placeholder(in: context)], policy: .after(.now.addingTimeInterval(900)))) }
}
struct SimBizExecutiveWidget: Widget {
    var body: some WidgetConfiguration { StaticConfiguration(kind: "SimBizExecutiveWidget", provider: SimBizProvider()) { entry in VStack(alignment: .leading) { Text("SIMBIZ EXECUTIVE").font(.caption.bold()); Text(entry.cash.formatted(.currency(code: "EUR").precision(.fractionLength(0)))).font(.title2.bold()); Text(entry.recommendation).font(.caption).foregroundStyle(.secondary) }.padding() }.configurationDisplayName("Cockpit SimBiz").description("Trésorerie et conseil du moment.").supportedFamilies([.systemSmall, .systemMedium]) }
}
