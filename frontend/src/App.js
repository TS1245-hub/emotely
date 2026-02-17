import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import KanbanPage from "./pages/KanbanPage";
import AlertsPage from "./pages/AlertsPage";
import ApplicationDetailPage from "./pages/ApplicationDetailPage";
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
            <Route index element={<DashboardPage />} />
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="alertes" element={<AlertsPage />} />
            <Route path="application/:id" element={<ApplicationDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
