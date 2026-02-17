import { motion } from "framer-motion";
import JobCard from "./JobCard";
import { Skeleton } from "../components/ui/skeleton";
import { Briefcase, Search } from "lucide-react";

export default function JobList({
  jobs,
  favorites,
  onToggleFavorite,
  isLoading,
  total,
}) {
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="job-list-loading">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 bg-zinc-800" />
                <Skeleton className="h-4 w-1/2 bg-zinc-800" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full bg-zinc-800" />
              <Skeleton className="h-6 w-20 rounded-full bg-zinc-800" />
              <Skeleton className="h-6 w-14 rounded-full bg-zinc-800" />
            </div>
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 flex-1 bg-zinc-800" />
              <Skeleton className="h-10 flex-1 bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="empty-state py-20" data-testid="job-list-empty">
        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">
          Aucune offre trouvée
        </h3>
        <p className="text-sm text-zinc-500 max-w-md">
          Essayez de modifier vos critères de recherche ou réinitialisez les
          filtres pour voir plus de résultats.
        </p>
      </div>
    );
  }

  const favoriteIds = new Set(favorites.map((f) => f.job_id));

  return (
    <div className="space-y-4" data-testid="job-list">
      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
        <Briefcase className="w-4 h-4" />
        <span>
          <span className="text-zinc-300 font-medium">{total}</span> offre
          {total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
        </span>
      </div>

      {/* Job cards */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <JobCard
              job={job}
              isFavorite={favoriteIds.has(job.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
