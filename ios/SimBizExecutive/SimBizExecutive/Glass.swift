import SwiftUI

@available(iOS 26.0, *)
private struct ModernGlassSurface: View {
    var body: some View { RoundedRectangle(cornerRadius: 22).glassEffect() }
}

struct GlassCard<Content: View>: View {
    private let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }
    private var surface: AnyView {
        if #available(iOS 26.0, *) {
            return AnyView(RoundedRectangle(cornerRadius: 18).fill(Color.canvas.opacity(0.78)).glassEffect())
        }
        return AnyView(RoundedRectangle(cornerRadius: 18).fill(Color(red: 0.055, green: 0.08, blue: 0.14)).overlay(RoundedRectangle(cornerRadius: 18).stroke(.white.opacity(0.10))))
    }
    var body: some View {
        content
            .padding(16)
            .background(surface)
            .clipShape(RoundedRectangle(cornerRadius: 18))
    }
}

struct MetricTile: View {
    let title: String; let value: String; let symbol: String; let color: Color
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: symbol).font(.caption).foregroundStyle(.secondary)
            Text(value).font(.title2.weight(.semibold)).foregroundStyle(color)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 18).fill(Color(red: 0.055, green: 0.08, blue: 0.14)))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(.white.opacity(0.10)))
        .accessibilityElement(children: .combine)
    }
}
