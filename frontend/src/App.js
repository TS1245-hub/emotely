import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import FavoritesPage from "./pages/FavoritesPage";
import AlertsPage from "./pages/AlertsPage";
import JobDetailPage from "./pages/JobDetailPage";
import "@/App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster 
          position="bottom-right" 
          theme="dark"
          toastOptions={{
            style: {
              background: '#18181b',
              border: '1px solid #27272a',
              color: '#fafafa',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="favoris" element={<FavoritesPage />} />
            <Route path="alertes" element={<AlertsPage />} />
            <Route path="job/:id" element={<JobDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
