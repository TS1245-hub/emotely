import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ExternalLink,
  Building2,
  MapPin,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

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
  wttj: "WTTJ",
  remoteok: "RemoteOK",
  talent: "Talent.io",
  manual: "Manuel",
  other: "Autre",
};

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        axios.get(`${API}/applications`),
        axios.get(`${API}/stats`),
      ]);
      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Listen for new applications
    const handleNewApp = () => fetchData();
    window.addEventListener('application-added', handleNewApp);
    return () => window.removeEventListener('application-added', handleNewApp);
  }, [fetchData]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.patch(`${API}/applications/${appId}/status?status=${encodeURIComponent(newStatus)}`);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      );
      toast.success(`Statut mis à jour: ${newStatus}`);
      // Refresh stats
      const statsRes = await axios.get(`${API}/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (appId) => {
    try {
      await axios.delete(`${API}/applications/${appId}`);
      setApplications((prev) => prev.filter((app) => app.id !== appId));
      toast.success("Candidature supprimée");
      // Refresh stats
      const statsRes = await axios.get(`${API}/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = STATUSES.find((s) => s.value === status);
    return statusConfig || STATUSES[0];
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-zinc-800" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-[Manrope]">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Suivez vos candidatures en un coup d'œil
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800"
          data-testid="stat-total"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-zinc-500">Total</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800"
          data-testid="stat-active"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.active_applications || 0}</p>
              <p className="text-xs text-zinc-500">En cours</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800"
          data-testid="stat-interviews"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.by_status?.["Entretien"] || 0}</p>
              <p className="text-xs text-zinc-500">Entretiens</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800"
          data-testid="stat-recent"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.recent_7_days || 0}</p>
              <p className="text-xs text-zinc-500">Cette semaine</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une candidature..."
            className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            data-testid="search-applications"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-zinc-900/50 border-zinc-800 text-zinc-300" data-testid="filter-status">
            <Filter className="w-4 h-4 mr-2 text-zinc-500" />
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all" className="text-zinc-300 focus:bg-zinc-800">
              Tous les statuts
            </SelectItem>
            {STATUSES.map((status) => (
              <SelectItem
                key={status.value}
                value={status.value}
                className="text-zinc-300 focus:bg-zinc-800"
              >
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">
            {applications.length === 0 ? "Aucune candidature" : "Aucun résultat"}
          </h3>
          <p className="text-sm text-zinc-500 mb-6">
            {applications.length === 0
              ? "Ajoutez votre première candidature ou utilisez l'extension Chrome"
              : "Essayez de modifier vos filtres"}
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="applications-list">
          {filteredApplications.map((app, index) => {
            const statusConfig = getStatusBadge(app.status);
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all"
                data-testid={`application-${app.id}`}
              >
                {/* Company Logo */}
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 border border-zinc-700">
                  <Building2 className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/application/${app.id}`}
                      className="font-medium text-zinc-100 hover:text-indigo-400 transition-colors truncate"
                      data-testid={`app-link-${app.id}`}
                    >
                      {app.title}
                    </Link>
                    <Badge
                      className={`${statusConfig.color} border text-xs shrink-0`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                    <span>{app.company}</span>
                    {app.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {app.location}
                        </span>
                      </>
                    )}
                    {app.source && (
                      <>
                        <span>•</span>
                        <span className="text-xs text-zinc-600">
                          {SOURCE_LABELS[app.source] || app.source}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    data-testid={`open-url-${app.id}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-500 hover:text-zinc-300"
                        data-testid={`app-menu-${app.id}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-900 border-zinc-700 w-48"
                    >
                      <div className="px-2 py-1.5 text-xs text-zinc-500">
                        Changer le statut
                      </div>
                      {STATUSES.map((status) => (
                        <DropdownMenuItem
                          key={status.value}
                          onClick={() => handleStatusChange(app.id, status.value)}
                          className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
                          data-testid={`status-${app.id}-${status.value}`}
                        >
                          {status.label}
                          {app.status === status.value && (
                            <CheckCircle2 className="w-3 h-3 ml-auto text-indigo-400" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem
                        onClick={() => handleDelete(app.id)}
                        className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                        data-testid={`delete-${app.id}`}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
