import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  Trash2,
  Mail,
  Search,
  MapPin,
  Banknote,
  Calendar,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    email: "",
    keywords: "",
    job_type: "",
    location: "",
    salary_min: "",
    frequency: "daily",
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error);
      toast.error("Erreur lors du chargement des alertes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();

    if (!newAlert.email || !newAlert.keywords) {
      toast.error("Email et mots-clés sont requis");
      return;
    }

    try {
      const alertData = {
        email: newAlert.email,
        keywords: newAlert.keywords,
        job_type: newAlert.job_type || null,
        location: newAlert.location || null,
        salary_min: newAlert.salary_min ? parseInt(newAlert.salary_min) : null,
        frequency: newAlert.frequency,
      };

      const response = await axios.post(`${API}/alerts`, alertData);
      setAlerts((prev) => [...prev, response.data]);
      setIsDialogOpen(false);
      setNewAlert({
        email: "",
        keywords: "",
        job_type: "",
        location: "",
        salary_min: "",
        frequency: "daily",
      });
      toast.success("Alerte créée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création de l'alerte");
    }
  };

  const handleToggleAlert = async (alertId, currentStatus) => {
    try {
      await axios.patch(`${API}/alerts/${alertId}/toggle`);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, is_active: !currentStatus } : a
        )
      );
      toast.success(currentStatus ? "Alerte désactivée" : "Alerte activée");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await axios.delete(`${API}/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success("Alerte supprimée");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4"
            >
              <Skeleton className="h-5 w-1/2 bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="alerts-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-[Manrope]">
              Alertes Email
            </h1>
            <p className="text-sm text-zinc-500">
              {alerts.length} alerte{alerts.length > 1 ? "s" : ""} configurée
              {alerts.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Create Alert Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="create-alert-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle alerte
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">
                Créer une alerte
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Recevez des notifications pour les nouvelles offres correspondant
                à vos critères.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newAlert.email}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, email: e.target.value })
                  }
                  placeholder="votre@email.com"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  data-testid="alert-email-input"
                  required
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-zinc-200">
                  Mots-clés *
                </Label>
                <Input
                  id="keywords"
                  value={newAlert.keywords}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, keywords: e.target.value })
                  }
                  placeholder="React, Node.js, DevOps..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  data-testid="alert-keywords-input"
                  required
                />
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <Label className="text-zinc-200">Type de contrat</Label>
                <Select
                  value={newAlert.job_type}
                  onValueChange={(value) =>
                    setNewAlert({ ...newAlert, job_type: value })
                  }
                >
                  <SelectTrigger 
                    className="bg-zinc-800 border-zinc-700 text-zinc-300"
                    data-testid="alert-jobtype-select"
                  >
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="CDI" className="text-zinc-300 focus:bg-zinc-800">CDI</SelectItem>
                    <SelectItem value="CDD" className="text-zinc-300 focus:bg-zinc-800">CDD</SelectItem>
                    <SelectItem value="Freelance" className="text-zinc-300 focus:bg-zinc-800">Freelance</SelectItem>
                    <SelectItem value="Stage" className="text-zinc-300 focus:bg-zinc-800">Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-zinc-200">
                  Localisation
                </Label>
                <Input
                  id="location"
                  value={newAlert.location}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, location: e.target.value })
                  }
                  placeholder="France, Europe..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  data-testid="alert-location-input"
                />
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-zinc-200">
                  Salaire minimum (€/an)
                </Label>
                <Input
                  id="salary"
                  type="number"
                  value={newAlert.salary_min}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, salary_min: e.target.value })
                  }
                  placeholder="40000"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  data-testid="alert-salary-input"
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label className="text-zinc-200">Fréquence</Label>
                <Select
                  value={newAlert.frequency}
                  onValueChange={(value) =>
                    setNewAlert({ ...newAlert, frequency: value })
                  }
                >
                  <SelectTrigger 
                    className="bg-zinc-800 border-zinc-700 text-zinc-300"
                    data-testid="alert-frequency-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="daily" className="text-zinc-300 focus:bg-zinc-800">Quotidienne</SelectItem>
                    <SelectItem value="weekly" className="text-zinc-300 focus:bg-zinc-800">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  data-testid="submit-alert-btn"
                >
                  Créer l'alerte
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-8">
        <p className="text-sm text-amber-400">
          <strong>Note :</strong> Les alertes email sont configurées mais
          l'envoi d'emails n'est pas encore actif. Cette fonctionnalité sera
          disponible prochainement.
        </p>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">
            Aucune alerte
          </h3>
          <p className="text-sm text-zinc-500 mb-6">
            Créez une alerte pour recevoir les nouvelles offres par email
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`group p-6 rounded-xl border bg-zinc-900/40 transition-all ${
                alert.is_active
                  ? "border-zinc-800 hover:border-zinc-700"
                  : "border-zinc-800/50 opacity-60"
              }`}
              data-testid={`alert-item-${alert.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Keywords */}
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium text-zinc-100">
                      {alert.keywords}
                    </span>
                    {!alert.is_active && (
                      <Badge
                        variant="outline"
                        className="text-zinc-500 border-zinc-700"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      <span>{alert.email}</span>
                    </div>

                    {alert.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{alert.location}</span>
                      </div>
                    )}

                    {alert.salary_min && (
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4" />
                        <span>{(alert.salary_min / 1000).toFixed(0)}k€+</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {alert.frequency === "daily"
                          ? "Quotidienne"
                          : "Hebdomadaire"}
                      </span>
                    </div>

                    {alert.job_type && (
                      <Badge
                        variant="outline"
                        className="text-zinc-400 border-zinc-700 font-mono text-xs"
                      >
                        {alert.job_type}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {alert.is_active ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={() =>
                        handleToggleAlert(alert.id, alert.is_active)
                      }
                      className="data-[state=checked]:bg-indigo-600"
                      data-testid={`alert-toggle-${alert.id}`}
                    />
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                        data-testid={`alert-delete-${alert.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-100">
                          Supprimer cette alerte ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          Vous ne recevrez plus de notifications pour ces
                          critères.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAlert(alert.id)}
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
