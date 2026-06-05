/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RoadSegment, Damage } from "../types";
import { Layers, Search, ShieldAlert, CheckCircle2, AlertTriangle, Calendar, Hammer, DollarSign, Activity, Settings, TrendingUp } from "lucide-react";

interface InfrastructureAssetsProps {
  segments: RoadSegment[];
  damages: Damage[];
  selectedCity: string;
}

export default function InfrastructureAssets({
  segments,
  damages,
  selectedCity,
}: InfrastructureAssetsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [healthFilter, setHealthFilter] = useState<"all" | "excellent" | "good" | "moderate" | "poor" | "critical">("all");

  const citySegments = segments.filter((s) => s.city === selectedCity);

  // Helper to determine health category
  const getHealthCategory = (score: number): { label: string; color: string; bg: string; border: string } => {
    if (score >= 90) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 70) return { label: "Good", color: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/20" };
    if (score >= 50) return { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    if (score >= 30) return { label: "Poor", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" };
    return { label: "Critical", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
  };

  const filteredSegments = citySegments.filter((seg) => {
    const matchesSearch = seg.name.toLowerCase().includes(searchTerm.toLowerCase()) || seg.id.toLowerCase().includes(searchTerm.toLowerCase());
    const cat = getHealthCategory(seg.healthScore).label.toLowerCase();
    
    if (healthFilter === "all") return matchesSearch;
    if (healthFilter === "excellent" && cat === "excellent") return matchesSearch;
    if (healthFilter === "good" && cat === "good") return matchesSearch;
    if (healthFilter === "moderate" && cat === "moderate") return matchesSearch;
    if (healthFilter === "poor" && cat === "poor") return matchesSearch;
    if (healthFilter === "critical" && cat === "critical") return matchesSearch;
    return false;
  });

  return (
    <div className="space-y-4" id="infra-assets-root">
      {/* Page Header */}
      <div className="bg-[#111216] border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[8px] font-mono uppercase text-sky-450 tracking-wider font-bold">CORE REGISTRY & INVENTORY</span>
          <h2 className="text-base font-bold font-sans text-white tracking-tight">Municipal Infrastructure Asset Management</h2>
          <p className="text-[10px] text-zinc-400">Continuous health indexing, capital depreciation logs, and pavement lifecycle audit indexes.</p>
        </div>
        <div className="flex gap-2 text-[10px] font-mono">
          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300">
            <span className="text-zinc-500 block text-[8px] uppercase font-bold">Total Assets</span>
            <span className="text-zinc-100 font-bold font-mono">{citySegments.length} segments</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300">
            <span className="text-zinc-500 block text-[8px] uppercase font-bold">Total Coverage</span>
            <span className="text-zinc-100 font-bold font-mono">
              {citySegments.reduce((sum, s) => sum + s.lengthKm, 0).toFixed(1)} km
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Filters and Summary block */}
        <div className="xl:col-span-1 bg-[#111216] border border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm" id="assets-filters-panel">
          <div>
            <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider font-mono">Inventory Filters</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Filter by label matching or lifecycle categories.</p>
          </div>

          {/* Text Search */}
          <div className="space-y-1">
            <label className="text-[8px] font-mono uppercase tracking-wider block text-zinc-500 font-bold">Search Segments</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-zinc-500" size={12} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Segment ID, road identifier..."
                className="w-full bg-zinc-950 border border-zinc-805 text-[10.5px] p-1.5 pl-7 text-zinc-200 rounded focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Health index filter */}
          <div className="space-y-1">
            <label className="text-[8px] font-mono uppercase tracking-wider block text-zinc-500 font-bold">Health Level Filter</label>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-805 text-xs p-1.5 text-zinc-250 font-mono rounded cursor-pointer focus:outline-none focus:border-zinc-705"
            >
              <option value="all">All Health Categories</option>
              <option value="excellent">Excellent (90-100)</option>
              <option value="good">Good (70-89)</option>
              <option value="moderate">Moderate (50-69)</option>
              <option value="poor">Poor (30-49)</option>
              <option value="critical">Critical (0-29)</option>
            </select>
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-2 text-[10px]">
            <h4 className="font-mono text-[8px] uppercase text-zinc-500 tracking-wider font-bold">Asset Class Distribution</h4>
            {[
              { name: "Paved Highways", count: citySegments.filter(s => s.lengthKm >= 4).length, pct: 45, color: "bg-sky-400" },
              { name: "Urban Connectors", count: citySegments.filter(s => s.lengthKm < 4 && s.lengthKm >= 1).length, pct: 35, color: "bg-emerald-400" },
              { name: "Local Access Ramps", count: citySegments.filter(s => s.lengthKm < 1).length, pct: 20, color: "bg-amber-400" }
            ].map((cls, vi) => (
              <div key={vi} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-semibold">{cls.name}</span>
                  <span className="font-bold text-zinc-200 font-mono">{cls.count}</span>
                </div>
                <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                  <div className={`h-full ${cls.color}`} style={{ width: `${cls.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Registry list */}
        <div className="xl:col-span-3 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm" id="assets-registry-container">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5 mb-3.5">
            <div>
              <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider font-mono">Infrastructure Asset Registry</h3>
              <p className="text-[10px] text-zinc-500">Live operational ledger corresponding directly to relational tables.</p>
            </div>
            <span className="font-mono text-[8.5px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">
              {filteredSegments.length} Assets Listed
            </span>
          </div>

          {/* Inventory Table Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-mono border-collapse" id="assets-table-ledger">
              <thead>
                <tr className="border-b border-zinc-800 text-[9px] uppercase tracking-wider text-zinc-500">
                  <th className="py-2.5 px-2">Asset ID</th>
                  <th className="py-2.5 px-2">Segment Name</th>
                  <th className="py-2.5 px-2">Distance</th>
                  <th className="py-2.5 px-2 text-center">Health Index</th>
                  <th className="py-2.5 px-2">Lifecycle Status</th>
                  <th className="py-2.5 px-2">Cumulative Cost</th>
                  <th className="py-2.5 px-2">Last Inspected</th>
                </tr>
              </thead>
              <tbody>
                {filteredSegments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 italic">No assets match the search/filter criteria.</td>
                  </tr>
                ) : (
                  filteredSegments.map((seg) => {
                    const status = getHealthCategory(seg.healthScore);
                    const associatedDamages = damages.filter((d) => d.segmentId === seg.id);
                    const cumCost = associatedDamages.reduce((sum, d) => sum + d.repairCost, 0);
                    
                    // Mock lifecycle status
                    let lifecycle = "Optimal Condition";
                    if (seg.healthScore < 40) lifecycle = "Replacement Scheduled";
                    else if (seg.healthScore < 60) lifecycle = "Heavy Rehabilitation Required";
                    else if (seg.healthScore < 80) lifecycle = "Routine Preservation Due";
                    else if (seg.healthScore < 90) lifecycle = "Active Surveillance";

                    return (
                      <tr key={seg.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/30 transition-colors" id={`asset-row-${seg.id}`}>
                        <td className="py-3 px-2 font-bold text-sky-400">{seg.id}</td>
                        <td className="py-3 px-2 text-zinc-100 font-sans font-medium">{seg.name}</td>
                        <td className="py-3 px-2 text-zinc-400">{seg.lengthKm} km</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${status.bg} ${status.color} border ${status.border}`}>
                            {seg.healthScore} ({status.label})
                          </span>
                        </td>
                        <td className="py-3 px-2 text-zinc-405 text-[11px] font-sans font-medium">{lifecycle}</td>
                        <td className="py-3 px-2 text-zinc-300 font-semibold">${(cumCost || 2500 * (100 - seg.healthScore)).toLocaleString()}</td>
                        <td className="py-3 px-2 text-zinc-500">{seg.lastInspectionDate}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
