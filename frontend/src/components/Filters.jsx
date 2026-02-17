import { useState, useEffect } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";

const JOB_TYPES = [
  { id: "cdi", label: "CDI", value: "CDI" },
  { id: "cdd", label: "CDD", value: "CDD" },
  { id: "freelance", label: "Freelance", value: "Freelance" },
  { id: "stage", label: "Stage", value: "Stage" },
];

const LOCATIONS = [
  { id: "france", label: "France", value: "France" },
  { id: "europe", label: "Europe", value: "Europe" },
  { id: "mondial", label: "Mondial", value: "Mondial" },
  { id: "francophone", label: "Francophone", value: "Francophone" },
];

export default function Filters({ filters, onFilterChange, onReset }) {
  const [isOpen, setIsOpen] = useState(true);
  const [salaryRange, setSalaryRange] = useState([filters.salary_min || 0]);

  useEffect(() => {
    setSalaryRange([filters.salary_min || 0]);
  }, [filters.salary_min]);

  const handleJobTypeChange = (value) => {
    onFilterChange({ job_type: value === filters.job_type ? null : value });
  };

  const handleLocationChange = (value) => {
    onFilterChange({ location: value === "all" ? null : value });
  };

  const handleSalaryChange = (value) => {
    setSalaryRange(value);
  };

  const handleSalaryCommit = (value) => {
    onFilterChange({ salary_min: value[0] || null });
  };

  const hasActiveFilters =
    filters.job_type || filters.location || filters.salary_min;

  return (
    <div className="lg:w-64 shrink-0 space-y-4" data-testid="filters-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Filtres</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-zinc-500 hover:text-zinc-300 h-7 px-2"
            data-testid="reset-filters-btn"
          >
            <X className="w-3 h-3 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 lg:hidden"
          >
            {isOpen ? "Masquer les filtres" : "Afficher les filtres"}
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6 pt-4 lg:block">
          {/* Job Type Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">
              Type de contrat
            </h3>
            <div className="space-y-2">
              {JOB_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={filters.job_type === type.value}
                    onCheckedChange={() => handleJobTypeChange(type.value)}
                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 border-zinc-700"
                    data-testid={`filter-jobtype-${type.id}`}
                  />
                  <Label
                    htmlFor={type.id}
                    className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-200"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">
              Localisation
            </h3>
            <Select
              value={filters.location || "all"}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger 
                className="bg-zinc-900 border-zinc-700 text-zinc-300"
                data-testid="filter-location-select"
              >
                <SelectValue placeholder="Toutes les localisations" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all" className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100">
                  Toutes les localisations
                </SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem 
                    key={loc.id} 
                    value={loc.value}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Salary Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">
                Salaire minimum
              </h3>
              <span className="text-xs text-zinc-500 font-mono">
                {salaryRange[0] > 0 ? `${(salaryRange[0] / 1000).toFixed(0)}k€/an` : "Tous"}
              </span>
            </div>
            <Slider
              value={salaryRange}
              onValueChange={handleSalaryChange}
              onValueCommit={handleSalaryCommit}
              max={100000}
              step={5000}
              className="py-2"
              data-testid="filter-salary-slider"
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>0€</span>
              <span>100k€</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
