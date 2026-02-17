import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Heart,
  Trash2,
  ExternalLink,
  Building2,
  MapPin,
  Banknote,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/favorites`);
      setFavorites(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
      toast.error("Erreur lors du chargement des favoris");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (jobId) => {
    try {
      await axios.delete(`${API}/favorites/${jobId}`);
      setFavorites((prev) => prev.filter((f) => f.job_id !== jobId));
      toast.success("Retiré des favoris");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="favorites-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-[Manrope]">
            Mes Favoris
          </h1>
          <p className="text-sm text-zinc-500">
            {favorites.length} offre{favorites.length > 1 ? "s" : ""}{" "}
            sauvegardée{favorites.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">
            Aucun favori
          </h3>
          <p className="text-sm text-zinc-500 mb-6">
            Sauvegardez des offres pour les retrouver facilement ici
          </p>
          <Link to="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Parcourir les offres
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((fav, index) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all"
              data-testid={`favorite-item-${fav.job_id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Company Logo Placeholder */}
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 border border-zinc-700">
                    <Building2 className="w-6 h-6" />
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/job/${fav.job_id}`}
                      className="block"
                      data-testid={`favorite-link-${fav.job_id}`}
                    >
                      <h3 className="text-lg font-semibold text-zinc-100 hover:text-indigo-400 transition-colors line-clamp-1">
                        {fav.job_title}
                      </h3>
                    </Link>
                    <p className="text-sm text-zinc-400 mt-0.5">{fav.company}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="w-4 h-4" />
                        <span>{fav.location}</span>
                      </div>

                      {formatSalary(fav.salary_min, fav.salary_max, fav.job_type) && (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Banknote className="w-4 h-4" />
                          <span>
                            {formatSalary(fav.salary_min, fav.salary_max, fav.job_type)}
                          </span>
                        </div>
                      )}

                      <Badge
                        className={`${getJobTypeBadgeColor(fav.job_type)} border font-mono text-xs`}
                      >
                        {fav.job_type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={fav.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`favorite-apply-${fav.job_id}`}
                  >
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Postuler
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                        data-testid={`favorite-delete-${fav.job_id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-100">
                          Supprimer ce favori ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          Cette offre sera retirée de vos favoris.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveFavorite(fav.job_id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
