import { Link } from "react-router-dom";
import { Building2, MapPin, Banknote, Clock, Heart, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function JobCard({ job, isFavorite, onToggleFavorite }) {
  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    if (min && max) {
      if (job.job_type === "Freelance") {
        return `${min}€ - ${max}€/jour`;
      }
      return `${(min / 1000).toFixed(0)}k€ - ${(max / 1000).toFixed(0)}k€/an`;
    }
    return min ? `À partir de ${min}€` : `Jusqu'à ${max}€`;
  };

  const getJobTypeBadgeColor = (type) => {
    switch (type) {
      case "CDI":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "CDD":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Freelance":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Stage":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <div
      className="job-card group relative flex flex-col gap-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700"
      data-testid={`job-card-${job.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Company Logo Placeholder */}
          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 border border-zinc-700">
            <Building2 className="w-6 h-6" />
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <Link 
              to={`/job/${job.id}`}
              className="block"
              data-testid={`job-link-${job.id}`}
            >
              <h3 className="text-lg font-semibold text-zinc-100 hover:text-indigo-400 transition-colors line-clamp-1">
                {job.title}
              </h3>
            </Link>
            <p className="text-sm text-zinc-400 mt-0.5">{job.company}</p>
          </div>
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorite(job)}
          className={`shrink-0 ${
            isFavorite
              ? "text-red-400 hover:text-red-300"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          data-testid={`favorite-btn-${job.id}`}
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
          />
        </Button>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>

        {salary && (
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Banknote className="w-4 h-4" />
            <span>{salary}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-zinc-500">
          <Clock className="w-4 h-4" />
          <span className="text-xs">{job.posted_date}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          className={`${getJobTypeBadgeColor(job.job_type)} border font-mono text-xs`}
        >
          {job.job_type}
        </Badge>
        {job.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="bg-zinc-800/50 text-zinc-400 border-zinc-700 font-mono text-xs"
          >
            {tag}
          </Badge>
        ))}
        {job.tags.length > 3 && (
          <Badge
            variant="outline"
            className="bg-zinc-800/50 text-zinc-500 border-zinc-700 font-mono text-xs"
          >
            +{job.tags.length - 3}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/50">
        <Link 
          to={`/job/${job.id}`}
          className="flex-1"
          data-testid={`view-job-btn-${job.id}`}
        >
          <Button
            variant="outline"
            className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Voir les détails
          </Button>
        </Link>
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
          data-testid={`apply-btn-${job.id}`}
        >
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            Postuler
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}
