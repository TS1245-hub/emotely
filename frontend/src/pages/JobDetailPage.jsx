import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Banknote,
  Clock,
  Heart,
  ExternalLink,
  Share2,
  Check,
  Briefcase,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchJob();
    fetchFavorites();
  }, [id]);

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Offre non trouvée");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API}/favorites`);
      setFavorites(response.data);
      setIsFavorite(response.data.some((f) => f.job_id === id));
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!job) return;

    try {
      if (isFavorite) {
        await axios.delete(`${API}/favorites/${job.id}`);
        setIsFavorite(false);
        toast.success("Retiré des favoris");
      } else {
        const favoriteData = {
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          location: job.location,
          job_type: job.job_type,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          apply_url: job.apply_url,
        };
        await axios.post(`${API}/favorites`, favoriteData);
        setIsFavorite(true);
        toast.success("Ajouté aux favoris");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers");
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const formatSalary = (min, max, jobType) => {
    if (!min && !max) return null;
    if (min && max) {
      if (jobType === "Freelance") {
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-32 bg-zinc-800 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 bg-zinc-800" />
          <Skeleton className="h-6 w-1/2 bg-zinc-800" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32 bg-zinc-800" />
            <Skeleton className="h-10 w-32 bg-zinc-800" />
          </div>
          <Skeleton className="h-64 w-full bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">
            Offre non trouvée
          </h3>
          <p className="text-sm text-zinc-500 mb-6">
            Cette offre n'existe pas ou a été supprimée.
          </p>
          <Link to="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Retour aux offres
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.job_type);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="job-detail-page">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors mb-8"
        data-testid="back-to-jobs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour aux offres</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          {/* Company Logo */}
          <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 border border-zinc-700">
            <Building2 className="w-8 h-8" />
          </div>

          {/* Job Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight font-[Manrope] text-zinc-100 mb-2">
              {job.title}
            </h1>
            <p className="text-lg text-zinc-400 mb-4">{job.company}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
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
                <span>Publié le {job.posted_date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            className={`${getJobTypeBadgeColor(job.job_type)} border font-mono text-sm px-3 py-1`}
          >
            {job.job_type}
          </Badge>
          {job.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="bg-zinc-800/50 text-zinc-400 border-zinc-700 font-mono text-sm px-3 py-1"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
            data-testid="apply-job-btn"
          >
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base">
              Postuler maintenant
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>

          <Button
            variant="outline"
            onClick={handleToggleFavorite}
            className={`h-12 px-6 border-zinc-700 ${
              isFavorite
                ? "text-red-400 hover:text-red-300 hover:bg-red-400/10"
                : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
            }`}
            data-testid="favorite-job-btn"
          >
            <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Favori" : "Ajouter aux favoris"}
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            className="h-12 px-6 border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
            data-testid="share-job-btn"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>

        <Separator className="bg-zinc-800 mb-8" />

        {/* Job Description */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-4 font-[Manrope]">
              Description du poste
            </h2>
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </section>

          {job.requirements && job.requirements.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-zinc-100 mb-4 font-[Manrope]">
                Compétences requises
              </h2>
              <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800">
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-zinc-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Company Info */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-4 font-[Manrope]">
              À propos de l'entreprise
            </h2>
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{job.company}</h3>
                  <p className="text-sm text-zinc-500">{job.location}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-400">
                Cette entreprise propose des postes 100% en télétravail et
                recherche des talents à travers le monde.
              </p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-6 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-center">
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            Intéressé par ce poste ?
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            N'attendez plus et postulez dès maintenant !
          </p>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="bottom-apply-btn"
          >
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              Postuler
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
