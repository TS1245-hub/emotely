import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Kanban, Bell, Briefcase, Plus, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";
import AddApplicationDialog from "./AddApplicationDialog";

export default function Layout() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
              <span className="hidden sm:inline text-xs text-zinc-500 ml-2 px-2 py-0.5 bg-zinc-800 rounded-full">
                Tracker
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
                data-testid="nav-dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
              </NavLink>

              <NavLink
                to="/kanban"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-indigo-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`
                }
                data-testid="nav-kanban"
              >
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Kanban</span>
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

              {/* Add Application Button */}
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                data-testid="add-application-btn"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Add Application Dialog */}
      <AddApplicationDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                <Briefcase className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-zinc-500">
                Remotely - Suivi de candidatures télétravail
              </span>
            </div>
            <div className="flex items-center gap-4">
              <NavLink
                to="/extension"
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
              >
                <Download className="w-3 h-3" />
                Extension Chrome
              </NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
