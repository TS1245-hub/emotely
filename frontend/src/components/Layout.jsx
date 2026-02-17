import { Outlet, NavLink } from "react-router-dom";
import { Search, Heart, Bell, Home, Briefcase } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink 
              to="/" 
              className="flex items-center gap-2"
              data-testid="logo-link"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight font-[Manrope]">
                Remotely
              </span>
            </NavLink>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-indigo-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`
                }
                data-testid="nav-home"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Accueil</span>
              </NavLink>

              <NavLink
                to="/favoris"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-indigo-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`
                }
                data-testid="nav-favorites"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Favoris</span>
              </NavLink>

              <NavLink
                to="/alertes"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-indigo-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`
                }
                data-testid="nav-alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Alertes</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                <Briefcase className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-zinc-500">
                Remotely - Emplois 100% Télétravail
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Trouvez votre prochain emploi remote
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
