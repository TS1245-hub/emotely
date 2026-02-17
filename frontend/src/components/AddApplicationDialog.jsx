import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SOURCES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "wttj", label: "Welcome to the Jungle" },
  { value: "remoteok", label: "RemoteOK" },
  { value: "talent", label: "Talent.io" },
  { value: "other", label: "Autre site" },
  { value: "manual", label: "Ajout manuel" },
];

const JOB_TYPES = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Freelance", label: "Freelance" },
  { value: "Stage", label: "Stage" },
];

const STATUSES = [
  { value: "À postuler", label: "À postuler" },
  { value: "Postulé", label: "Postulé" },
  { value: "Entretien", label: "Entretien" },
  { value: "Offre", label: "Offre reçue" },
  { value: "Accepté", label: "Accepté" },
  { value: "Refusé", label: "Refusé" },
];

export default function AddApplicationDialog({ open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    url: "",
    location: "",
    job_type: "",
    salary: "",
    source: "manual",
    status: "À postuler",
    description: "",
    notes: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.url) {
      toast.error("Titre, entreprise et URL sont requis");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API}/applications`, formData);
      toast.success("Candidature ajoutée !");
      setFormData({
        title: "",
        company: "",
        url: "",
        location: "",
        job_type: "",
        salary: "",
        source: "manual",
        status: "À postuler",
        description: "",
        notes: "",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('application-added'));
    } catch (error) {
      console.error("Erreur:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Erreur lors de l'ajout");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Ajouter une candidature
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Ajoutez manuellement une offre d'emploi à votre suivi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-200">
              Titre du poste *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Développeur Full Stack"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              data-testid="add-title-input"
              required
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-zinc-200">
              Entreprise *
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder="TechCorp"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              data-testid="add-company-input"
              required
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-zinc-200">
              URL de l'offre *
            </Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              data-testid="add-url-input"
              required
            />
          </div>

          {/* Location & Job Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-200">
                Localisation
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Remote, France"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                data-testid="add-location-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-200">Type de contrat</Label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => handleChange("job_type", value)}
              >
                <SelectTrigger 
                  className="bg-zinc-800 border-zinc-700 text-zinc-300"
                  data-testid="add-jobtype-select"
                >
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {JOB_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-zinc-200">
                Salaire
              </Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                placeholder="45-60k€"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                data-testid="add-salary-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-200">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleChange("source", value)}
              >
                <SelectTrigger 
                  className="bg-zinc-800 border-zinc-700 text-zinc-300"
                  data-testid="add-source-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {SOURCES.map((source) => (
                    <SelectItem
                      key={source.value}
                      value={source.value}
                      className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
                    >
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-zinc-200">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger 
                className="bg-zinc-800 border-zinc-700 text-zinc-300"
                data-testid="add-status-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {STATUSES.map((status) => (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-zinc-200">
              Notes personnelles
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Vos notes sur cette offre..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 min-h-[80px]"
              data-testid="add-notes-input"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="submit-application-btn"
            >
              {isLoading ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
