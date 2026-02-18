import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Banknote,
  Clock,
  ExternalLink,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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

const STATUSES = [
  { value: "À postuler", label: "À postuler", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
  { value: "Postulé", label: "Postulé", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "Entretien", label: "Entretien", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "Offre", label: "Offre", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "Accepté", label: "Accepté", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "Refusé", label: "Refusé", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "Archivé", label: "Archivé", color: "bg-zinc-600/20 text-zinc-500 border-zinc-600/30" },
];

const SOURCE_LABELS = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  wttj: "Welcome to the Jungle",
  remoteok: "RemoteOK",
  talent: "Talent.io",
  manual: "Ajout manuel",
  other: "Autre",
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/applications/${id}`);
      setApplication(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Candidature non trouvée");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(`${API}/applications/${id}/status?status=${encodeURIComponent(newStatus)}`);
      setApplication((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`${API}/applications/${id}`, editData);
      setApplication(response.data);
      setIsEditing(false);
      toast.success("Modifications enregistrées");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/applications/${id}`);
      toast.success("Candidature supprimée");
      navigate("/");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusConfig = (status) => {
    return STATUSES.find((s) => s.value === status) || STATUSES[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-32 bg-zinc-800 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 bg-zinc-800" />
          <Skeleton className="h-6 w-1/2 bg-zinc-800" />
          <Skeleton className="h-64 w-full bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const statusConfig = getStatusConfig(application.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="application-detail-page">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors mb-8"
        data-testid="back-to-dashboard"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au dashboard</span>
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

          {/* Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-400 text-xs">Titre du poste</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Entreprise</Label>
                  <Input
                    value={editData.company}
                    onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight font-[Manrope] text-zinc-100 mb-2">
                  {application.title}
                </h1>
                <p className="text-lg text-zinc-400 mb-4">{application.company}</p>
              </>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {application.location && (
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <MapPin className="w-4 h-4" />
                  <span>{application.location}</span>
                </div>
              )}

              {application.salary && (
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Banknote className="w-4 h-4" />
                  <span>{application.salary}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="w-4 h-4" />
                <span>Ajouté le {formatDate(application.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="save-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(application);
                  }}
                  className="border-zinc-700 text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  data-testid="edit-btn"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-red-400 hover:bg-red-500/10"
                      data-testid="delete-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-zinc-100">
                        Supprimer cette candidature ?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* Status Selector */}
        <div className="mb-8">
          <Label className="text-zinc-400 text-sm mb-2 block">Statut de la candidature</Label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <Button
                key={status.value}
                variant="outline"
                onClick={() => handleStatusChange(status.value)}
                className={`${
                  application.status === status.value
                    ? status.color + " border"
                    : "bg-transparent border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
                data-testid={`status-btn-${status.value}`}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-zinc-800 mb-8" />

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* URL */}
            <div>
              <Label className="text-zinc-400 text-sm">Lien de l'offre</Label>
              <a
                href={application.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mt-1 text-sm break-all"
                data-testid="offer-url"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                {application.url}
              </a>
            </div>

            {/* Source */}
            <div>
              <Label className="text-zinc-400 text-sm">Source</Label>
              <p className="text-zinc-200 mt-1">
                {SOURCE_LABELS[application.source] || application.source}
              </p>
            </div>

            {/* Job Type */}
            {application.job_type && (
              <div>
                <Label className="text-zinc-400 text-sm">Type de contrat</Label>
                <Badge className="mt-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {application.job_type}
                </Badge>
              </div>
            )}

            {/* Applied Date */}
            {application.applied_at && (
              <div>
                <Label className="text-zinc-400 text-sm">Date de candidature</Label>
                <p className="text-zinc-200 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  {formatDate(application.applied_at)}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Notes */}
          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Notes personnelles</Label>
            {isEditing ? (
              <Textarea
                value={editData.notes || ""}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                placeholder="Ajoutez vos notes ici..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[200px]"
              />
            ) : (
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 min-h-[200px]">
                {application.notes ? (
                  <p className="text-zinc-300 whitespace-pre-wrap">{application.notes}</p>
                ) : (
                  <p className="text-zinc-600 italic">Aucune note</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {application.description && (
          <div className="mb-8">
            <Label className="text-zinc-400 text-sm mb-2 block">Description du poste</Label>
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <p className="text-zinc-300 whitespace-pre-wrap">{application.description}</p>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="p-6 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-center">
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            Accéder à l'offre originale
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Consultez l'offre sur le site source pour postuler
          </p>
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="goto-offer-btn"
          >
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              Voir l'offre
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
