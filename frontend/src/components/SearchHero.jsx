import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function SearchHero({ onSearch, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative py-16 sm:py-24">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-[Manrope] mb-4">
            Emplois{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">
              100% Télétravail
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Trouvez votre prochain emploi remote. Postes vérifiés, entreprises de confiance.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un poste, une entreprise, une technologie..."
              className="search-input h-14 pl-12 pr-24 bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl transition-all shadow-lg backdrop-blur-sm text-base placeholder:text-zinc-500"
              data-testid="job-search-input"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                data-testid="clear-search-btn"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 h-10 rounded-lg font-medium"
              data-testid="search-submit-btn"
            >
              Rechercher
            </Button>
          </div>
        </form>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>12 offres disponibles</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-700" />
          <span>Mise à jour quotidienne</span>
        </div>
      </div>
    </div>
  );
}
