import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Share2, Check, Loader2, Link, Building2, Briefcase } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Detect source from URL
function detectSource(url) {
  if (!url) return "other";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("indeed.com") || url.includes("indeed.fr")) return "indeed";
  if (url.includes("welcometothejungle.com")) return "wttj";
  if (url.includes("remoteok.com")) return "remoteok";
  if (url.includes("talent.io")) return "talent";
  if (url.includes("glassdoor.")) return "glassdoor";
  return "other";
}

// Extract info from shared text
function parseSharedData(title, text, url) {
  let jobTitle = "";
  let company = "";
  let jobUrl = url || "";

  // Try to find URL in text if not provided
  if (!jobUrl && text) {
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      jobUrl = urlMatch[0];
    }
  }

  // Parse title - often format is "Job Title - Company" or "Job Title | Company"
  if (title) {
    const separators = [" - ", " | ", " chez ", " at ", " @ "];
    for (const sep of separators) {
      if (title.includes(sep)) {
        const parts = title.split(sep);
        jobTitle = parts[0].trim();
        company = parts[1]?.trim() || "";
        break;
      }
    }
    if (!jobTitle) {
      jobTitle = title;
    }
  }

  // Try to extract from text if title parsing didn't work
  if (!company && text) {
    // Common patterns in job share text
    const companyPatterns = [
      /chez ([^-|•\n]+)/i,
      /at ([^-|•\n]+)/i,
      /@ ([^-|•\n]+)/i,
      /Company: ([^-|•\n]+)/i,
    ];
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        company = match[1].trim();
        break;
      }
    }
  }

  return { jobTitle, company, jobUrl };
}

export default function SharePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    url: "",
    location: "",
    salary: "",
    notes: "",
  });

  useEffect(() => {
    // Get shared data from URL params
    const sharedTitle = searchParams.get("title") || "";
    const sharedText = searchParams.get("text") || "";
    const sharedUrl = searchParams.get("url") || "";

    const { jobTitle, company, jobUrl } = parseSharedData(
      sharedTitle,
      sharedText,
      sharedUrl
    );

    setFormData((prev) => ({
      ...prev,
      title: jobTitle,
      company: company,
      url: jobUrl,
      notes: sharedText && !jobUrl ? sharedText : "",
    }));
  }, [searchParams]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.url) {
      toast.error("Le titre et l'URL sont requis");
      return;
    }

    setIsLoading(true);
    try {
      const source = detectSource(formData.url);
      await axios.post(`${API}/applications`, {
        title: formData.title,
        company: formData.company || "Non spécifié",
        url: formData.url,
        location: formData.location || null,
        salary: formData.salary || null,
        notes: formData.notes || null,
        source: source,
        status: "À postuler",
      });
      
      setIsSaved(true);
      toast.success("Offre sauvegardée !");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Erreur:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSaved) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Offre sauvegardée !</h1>
          <p className="text-zinc-500">Redirection vers le dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12" data-testid="share-page">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-[Manrope] mb-2">
            Nouvelle offre partagée
          </h1>
          <p className="text-zinc-500 text-sm">
            Vérifiez les informations et sauvegardez
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
          {/* URL */}
          <div className="space-y-2">
            <Label className="text-zinc-300 flex items-center gap-2">
              <Link className="w-4 h-4" />
              URL de l'offre *
            </Label>
            <Input
              value={formData.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              data-testid="share-url-input"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-zinc-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Titre du poste *
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Développeur Full Stack"
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              data-testid="share-title-input"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label className="text-zinc-300 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Entreprise
            </Label>
            <Input
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder="Ex: TechCorp"
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              data-testid="share-company-input"
            />
          </div>

          {/* Location & Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Localisation</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Remote, France"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Salaire</Label>
              <Input
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                placeholder="45-60k€"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 mt-4"
            data-testid="share-save-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Sauvegarder dans Remotely
              </>
            )}
          </Button>

          {/* Cancel */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full text-zinc-500 hover:text-zinc-300"
          >
            Annuler
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
