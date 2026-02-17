import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import SearchHero from "../components/SearchHero";
import Filters from "../components/Filters";
import JobList from "../components/JobList";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    job_type: null,
    location: null,
    salary_min: null,
  });

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (filters.job_type) params.append("job_type", filters.job_type);
      if (filters.location) params.append("location", filters.location);
      if (filters.salary_min) params.append("salary_min", filters.salary_min);

      const response = await axios.get(`${API}/jobs?${params.toString()}`);
      setJobs(response.data.jobs);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error);
      toast.error("Erreur lors du chargement des offres");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  // Fetch favorites
  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API}/favorites`);
      setFavorites(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchFavorites();
  }, [fetchJobs]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      job_type: null,
      location: null,
      salary_min: null,
    });
  };

  // Toggle favorite
  const handleToggleFavorite = async (job) => {
    const isFavorite = favorites.some((f) => f.job_id === job.id);

    try {
      if (isFavorite) {
        await axios.delete(`${API}/favorites/${job.id}`);
        setFavorites((prev) => prev.filter((f) => f.job_id !== job.id));
        toast.success("Retiré des favoris");
      } else {
        const favoriteData = {
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          location: job.location,
          job_type: job.job_type,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          apply_url: job.apply_url,
        };
        const response = await axios.post(`${API}/favorites`, favoriteData);
        setFavorites((prev) => [...prev, response.data]);
        toast.success("Ajouté aux favoris");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris:", error);
      toast.error("Erreur lors de la mise à jour des favoris");
    }
  };

  return (
    <div data-testid="home-page">
      {/* Search Hero */}
      <SearchHero onSearch={handleSearch} initialQuery={searchQuery} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Job List */}
          <div className="flex-1">
            <JobList
              jobs={jobs}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              isLoading={isLoading}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
