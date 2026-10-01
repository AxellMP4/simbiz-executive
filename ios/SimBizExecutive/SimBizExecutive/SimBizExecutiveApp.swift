import SwiftUI

@main
struct SimBizExecutiveApp: App {
    @StateObject private var store = GameStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .preferredColorScheme(.dark)
        }
    }
}

struct RootView: View {
    @EnvironmentObject private var store: GameStore
    var body: some View {
        Group {
            if store.state.profile == nil {
                OnboardingView()
            } else {
                MainTabView()
            }
        }
        .tint(store.state.profile?.accentColor ?? .indigo)
    }
}
