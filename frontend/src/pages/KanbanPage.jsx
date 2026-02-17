import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Building2,
  ExternalLink,
  GripVertical,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLUMNS = [
  { id: "À postuler", label: "À postuler", color: "border-zinc-500" },
  { id: "Postulé", label: "Postulé", color: "border-blue-500" },
  { id: "Entretien", label: "Entretien", color: "border-amber-500" },
  { id: "Offre", label: "Offre", color: "border-purple-500" },
  { id: "Accepté", label: "Accepté", color: "border-green-500" },
  { id: "Refusé", label: "Refusé", color: "border-red-500" },
];

export default function KanbanPage() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/applications`);
      setApplications(response.data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    
    const handleNewApp = () => fetchApplications();
    window.addEventListener('application-added', handleNewApp);
    return () => window.removeEventListener('application-added', handleNewApp);
  }, [fetchApplications]);

  const handleDragStart = (e, app) => {
    setDraggedItem(app);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.status === newStatus) {
      setDraggedItem(null);
      return;
    }

    try {
      await axios.patch(
        `${API}/applications/${draggedItem.id}/status?status=${encodeURIComponent(newStatus)}`
      );
      setApplications((prev) =>
        prev.map((app) =>
          app.id === draggedItem.id ? { ...app, status: newStatus } : app
        )
      );
      toast.success(`Déplacé vers "${newStatus}"`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du déplacement");
    } finally {
      setDraggedItem(null);
    }
  };

  const handleDelete = async (appId) => {
    try {
      await axios.delete(`${API}/applications/${appId}`);
      setApplications((prev) => prev.filter((app) => app.id !== appId));
      toast.success("Candidature supprimée");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getColumnApps = (status) =>
    applications.filter((app) => app.status === status);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] p-4 sm:p-6">
        <div className="flex gap-4 h-full overflow-x-auto">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="flex-shrink-0 w-72 bg-zinc-900/40 rounded-xl p-4"
            >
              <Skeleton className="h-6 w-24 bg-zinc-800 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 bg-zinc-800 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] p-4 sm:p-6" data-testid="kanban-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-[Manrope]">
            Vue Kanban
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Glissez-déposez pour changer le statut
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>{applications.length} candidature{applications.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="flex gap-4 pb-4 min-h-full">
          {COLUMNS.map((column) => {
            const columnApps = getColumnApps(column.id);
            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-72 bg-zinc-900/40 rounded-xl border-t-2 ${column.color}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                data-testid={`kanban-column-${column.id}`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-zinc-200">{column.label}</h3>
                    <Badge
                      variant="outline"
                      className="bg-zinc-800/50 text-zinc-400 border-zinc-700"
                    >
                      {columnApps.length}
                    </Badge>
                  </div>
                </div>

                {/* Column Content */}
                <div className="p-3 space-y-3 min-h-[200px]">
                  {columnApps.length === 0 ? (
                    <div className="text-center py-8 text-sm text-zinc-600">
                      Aucune candidature
                    </div>
                  ) : (
                    columnApps.map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app)}
                        className={`group p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 cursor-grab active:cursor-grabbing transition-all ${
                          draggedItem?.id === app.id ? "opacity-50" : ""
                        }`}
                        data-testid={`kanban-card-${app.id}`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-zinc-400" />
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-zinc-900 border-zinc-700"
                            >
                              <DropdownMenuItem asChild>
                                <a
                                  href={app.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-zinc-300"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Voir l'offre
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(app.id)}
                                className="text-red-400 focus:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Card Content */}
                        <h4 className="font-medium text-sm text-zinc-200 line-clamp-2 mb-1">
                          {app.title}
                        </h4>
                        <p className="text-xs text-zinc-500">{app.company}</p>

                        {/* Card Footer */}
                        {(app.salary || app.location) && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-zinc-600">
                            {app.location && (
                              <span className="truncate">{app.location}</span>
                            )}
                            {app.salary && (
                              <>
                                {app.location && <span>•</span>}
                                <span>{app.salary}</span>
                              </>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
