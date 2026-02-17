import { Download, Chrome, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ExtensionPage() {
  const handleDownload = () => {
    // Direct download
    const link = document.createElement('a');
    link.href = '/remotely-extension.zip';
    link.download = 'remotely-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="extension-page">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6">
          <Chrome className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-[Manrope] mb-4">
          Extension Chrome Remotely
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Capturez les offres d'emploi en un clic depuis LinkedIn, Indeed, Welcome to the Jungle et plus encore.
        </p>
      </div>

      {/* Download Button */}
      <div className="flex justify-center mb-12">
        <Button
          onClick={handleDownload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl"
          data-testid="download-extension-btn"
        >
          <Download className="w-5 h-5 mr-3" />
          Télécharger l'extension
        </Button>
      </div>

      {/* Alternative direct link */}
      <div className="text-center mb-12">
        <p className="text-sm text-zinc-500 mb-2">Le bouton ne fonctionne pas ?</p>
        <a 
          href={`${BACKEND_URL}/api/download/extension`}
          className="text-indigo-400 hover:text-indigo-300 underline text-sm"
        >
          Lien direct de téléchargement
        </a>
      </div>

      {/* Installation Steps */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">Installation en 4 étapes</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-medium text-zinc-200 mb-1">Téléchargez le fichier ZIP</h3>
              <p className="text-sm text-zinc-500">Cliquez sur le bouton ci-dessus</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-medium text-zinc-200 mb-1">Extrayez le ZIP</h3>
              <p className="text-sm text-zinc-500">Décompressez le fichier dans un dossier</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-medium text-zinc-200 mb-1">Ouvrez Chrome Extensions</h3>
              <p className="text-sm text-zinc-500">
                Allez sur{" "}
                <code className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-400">
                  chrome://extensions/
                </code>{" "}
                et activez le <strong>"Mode développeur"</strong> en haut à droite
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold">
              4
            </div>
            <div>
              <h3 className="font-medium text-zinc-200 mb-1">Chargez l'extension</h3>
              <p className="text-sm text-zinc-500">
                Cliquez sur <strong>"Charger l'extension non empaquetée"</strong> et sélectionnez le dossier extrait
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Sites */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-6">Sites supportés</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            "LinkedIn",
            "Indeed",
            "Welcome to the Jungle",
            "RemoteOK",
            "Talent.io",
            "Glassdoor",
          ].map((site) => (
            <div
              key={site}
              className="flex items-center gap-2 text-zinc-300"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{site}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-500 mt-4">
          + Saisie manuelle pour tous les autres sites
        </p>
      </div>
    </div>
  );
}
