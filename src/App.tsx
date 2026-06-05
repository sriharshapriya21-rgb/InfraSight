/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RoadSegment, Damage, DroneFlight, MaintenanceTicket, Complaint, BudgetSnapshot, AuditLog } from "./types";
import { Compass, ShieldAlert, Layers, LayoutDashboard, Cpu, Sparkles, Terminal, Activity, Menu, ShieldCheck, User, CheckCircle2, Moon, Sun, MapPin, Map, RefreshCw } from "lucide-react";

import CommandCenter from "./components/CommandCenter";
import SmartCityGIS from "./components/SmartCityGIS";
import DroneUAVCenter from "./components/DroneUAVCenter";
import CitizenPortal from "./components/CitizenPortal";
import PredictiveAnalytics from "./components/PredictiveAnalytics";
import GenAIReportBuilder from "./components/GenAIReportBuilder";
import DeveloperHub from "./components/DeveloperHub";
import LandingPage from "./components/LandingPage";
import InfrastructureAssets from "./components/InfrastructureAssets";
import TicketOperations from "./components/TicketOperations";

export default function App() {
  // Global States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [segments, setSegments] = useState<RoadSegment[]>([]);
  const [damages, setDamages] = useState<Damage[]>([]);
  const [flights, setFlights] = useState<DroneFlight[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [budgets, setBudgets] = useState<BudgetSnapshot[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Filters & Settings
  const [selectedCity, setSelectedCity] = useState("Metro City (Central District)");
  const [userRole, setUserRole] = useState<"Admin" | "Inspector" | "Municipality Officer" | "Viewer">("Municipality Officer");
  const [activeTab, setActiveTab] = useState<"command" | "gis" | "drone" | "citizen" | "assets" | "tickets" | "predictive" | "advisory" | "dev">("command");
  
  // App Toast alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Segment for detail views
  const [selectedSegment, setSelectedSegment] = useState<RoadSegment | null>(null);

  // Fetch full dataset on load
  const loadPlatformData = async () => {
    try {
      const [segRes, dmgRes, flgRes, tktRes, cmpRes, bdgRes, logRes] = await Promise.all([
        fetch("/api/segments"),
        fetch("/api/damages"),
        fetch("/api/flights"),
        fetch("/api/tickets"),
        fetch("/api/complaints"),
        fetch("/api/budgets"),
        fetch("/api/logs")
      ]);

      const [seg, dmg, flg, tkt, cmp, bdg, lg] = await Promise.all([
        segRes.json(),
        dmgRes.json(),
        flgRes.json(),
        tktRes.json(),
        cmpRes.json(),
        bdgRes.json(),
        logRes.json()
      ]);

      setSegments(seg.segments);
      setDamages(dmg.damages);
      setFlights(flg.flights);
      setTickets(tkt.tickets);
      setComplaints(cmp.complaints);
      setBudgets(bdg.budgets);
      setLogs(lg.logs);

      // Default selected segment for detail views
      const filteredSegs = seg.segments.filter((s: RoadSegment) => s.city === selectedCity);
      if (filteredSegs.length > 0) {
        setSelectedSegment(filteredSegs[0]);
      }
    } catch (err) {
      console.error("Critical: Failed to sync platform data from API endpoints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, [selectedCity]);

  // Show customized banner alert
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Create real persistent damage entry via API (YOLOv8 Scan output)
  const handleAddNewDamage = async (dmg: Damage) => {
    try {
      const res = await fetch("/api/damages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dmg)
      });
      const newDmg = await res.json();
      
      // Update local states
      setDamages(prev => [newDmg, ...prev]);
      triggerToast(`🚨 Anomaly Detected: New ${newDmg.type} committed to ${newDmg.roadName} segment!`);
      
      // Refresh segments to reflect updated health indices
      loadPlatformData();
    } catch (err) {
      console.error("Failed to commit anomaly:", err);
    }
  };

  // Submit and verify Citizen complaint dynamically via REST API
  const handleVerifyComplaint = async (complaintData: any) => {
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintData)
      });
      
      const payload = await res.json();
      
      // Reload states & show alert
      loadPlatformData();
      triggerToast(`📱 complaint auto-verified! Created work order #${payload.ticket.id}`);
      
      return payload;
    } catch (err) {
      console.error("Complaint verification failed:", err);
      throw err;
    }
  };

  // Generate / resolve ticket directly
  const handleResolveTicket = async (ticketId: string) => {
    try {
      const res = await fetch("/api/tickets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId })
      });
      await res.json();
      loadPlatformData();
      triggerToast(`✅ Work order ${ticketId} resolved. Pavement sealed and safe!`);
    } catch (err) {
      console.error("Ticket resolution failure:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center space-y-4" id="global-spinner">
        <div className="w-12 h-12 border-4 border-t-emerald-400 border-r-transparent border-slate-700 rounded-full animate-spin" />
        <div className="space-y-1">
          <h1 className="text-white font-bold tracking-tight text-base font-sans">InfraSight platform</h1>
          <p className="text-slate-400 text-xs font-mono animate-pulse">Initializing YOLOv8 mapping telemetry nodes...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onEnterPlatform={() => setIsAuthenticated(true)} />;
  }

  // Active dataset for selected city
  const citySegments = segments.filter(s => s.city === selectedCity);
  const segmentIdSet = citySegments.map(s => s.id);
  const cityDamages = damages.filter(d => segmentIdSet.includes(d.segmentId));
  const cityBudget = budgets.find(b => b.city === selectedCity);

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 font-sans flex flex-col justify-between" id="app-root-frame">
      
      {/* Toast HUD */}
      {toastMessage && (
        <div id="platform-system-toast" className="fixed top-5 right-5 z-50 bg-zinc-950/95 border border-zinc-800 text-white p-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm animate-bounce">
          <Activity size={16} className="text-[#38bdf8] shrink-0 animate-pulse" />
          <span className="text-xs font-semibold leading-relaxed font-mono text-zinc-200">{toastMessage}</span>
        </div>
      )}

      {/* Primary Navigation Shell */}
      <div className="grow">
        {/* Superior Application controller ribbon */}
        <header className="bg-zinc-950/90 text-white border-b border-zinc-800/80 sticky top-0 z-40 px-5 py-2.5 shadow-md backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3" id="primary-app-header">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-zinc-900 border border-zinc-800 text-sky-400 rounded-xl shadow-inner flex items-center justify-center">
              <Compass size={18} className="animate-spin text-sky-400" style={{ animationDuration: "25s" }} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold font-sans tracking-tight text-white uppercase">InfraSight</h1>
                <span className="bg-sky-500/10 border border-sky-500/30 text-[#38bdf8] text-[8px] font-mono tracking-wider uppercase px-1 py-0.5 rounded-sm font-bold">
                  SaaS Core
                </span>
              </div>
              <p className="text-[8px] text-zinc-500 font-mono tracking-wider">INTELLIGENT ROAD RECONNAISSANCE & PREDICTIVE ANALYTICS</p>
            </div>
          </div>

          {/* SDE Global filters controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end" id="app-control-hud">
            {/* Multi-city Filter Dropdown */}
            <div className="space-y-0.5 min-w-[170px]" id="filter-city-dropdown">
              <span className="text-[8px] uppercase font-mono tracking-widest text-sky-400 block font-bold">District Network</span>
              <select
                id="global-city-select"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedSegment(null);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 p-1.5 px-3 text-xs rounded-lg text-zinc-200 focus:outline-none focus:border-sky-500/50 font-semibold cursor-pointer"
              >
                <option value="Metro City (Central District)">Metro City (Central District)</option>
                <option value="Oakridge Highway Sector">Oakridge Highway Sector</option>
                <option value="Southshore Coastal Route">Southshore Coastal Route</option>
              </select>
            </div>

            {/* RBAC Role Selector Dropdown */}
            <div className="space-y-0.5 min-w-[150px]" id="filter-role-dropdown">
              <span className="text-[8px] uppercase font-mono tracking-widest text-emerald-400 block font-bold">RBAC Access Scope</span>
              <select
                id="global-role-select"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 p-1.5 px-3 text-xs rounded-lg text-zinc-200 focus:outline-none focus:border-sky-500/50 font-semibold cursor-pointer"
              >
                <option value="Admin">Admin (Full Write Access)</option>
                <option value="Inspector">Inspector (Logging scope)</option>
                <option value="Municipality Officer">Municipality Officer (Dispatches enabled)</option>
                <option value="Viewer">Viewer (Read-only)</option>
              </select>
            </div>
          </div>
        </header>

        {/* Dashboard Tabs selections */}
        <nav className="bg-zinc-950/60 border-b border-zinc-900/80 px-5 py-1.5 flex items-center overflow-x-auto gap-1 shadow-sm scrollbar-none" id="dashboard-navbar">
          {[
            { id: "command", label: "Executive Center", icon: <LayoutDashboard size={12} /> },
            { id: "gis", label: "Digital Twin GIS", icon: <Map size={12} /> },
            { id: "drone", label: "UAV CV Scanner", icon: <Cpu size={12} /> },
            { id: "citizen", label: "Citizen Portal", icon: <User size={12} /> },
            { id: "assets", label: "Asset Registry", icon: <Layers size={12} /> },
            { id: "tickets", label: "Ticket Operations", icon: <ShieldCheck size={12} /> },
            { id: "predictive", label: "Predictive CapEx", icon: <RefreshCw size={12} /> },
            { id: "advisory", label: "AI Advisor", icon: <Sparkles size={12} /> },
            { id: "dev", label: "Developer Hub", icon: <Terminal size={12} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 p-1 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === tab.id
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 border border-transparent"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Dynamic Display Canvas */}
        <main className="max-w-7xl mx-auto p-4 md:p-5" id="dashboard-main-canvas">
          
          {/* Active Tab rendering router */}
          {activeTab === "command" && (
            <CommandCenter
              segments={segments}
              damages={damages}
              tickets={tickets}
              budgets={budgets}
              logs={logs}
              selectedCity={selectedCity}
            />
          )}

          {activeTab === "gis" && (
            <SmartCityGIS
              segments={segments}
              damages={damages}
              flights={flights}
              selectedCity={selectedCity}
              onSelectSegment={(seg) => setSelectedSegment(seg)}
            />
          )}

          {activeTab === "drone" && (
            <DroneUAVCenter
              segments={segments}
              flights={flights}
              selectedCity={selectedCity}
              onNewDamageDetected={handleAddNewDamage}
              userRole={userRole}
            />
          )}

          {activeTab === "citizen" && (
            <CitizenPortal
              complaints={complaints}
              tickets={tickets}
              onSubmitComplaint={handleVerifyComplaint}
            />
          )}

          {activeTab === "assets" && (
            <InfrastructureAssets
              segments={segments}
              damages={damages}
              selectedCity={selectedCity}
            />
          )}

          {activeTab === "tickets" && (
            <TicketOperations
              tickets={tickets}
              damages={damages}
              onUpdateTicketStatus={async (ticketId, status) => {
                try {
                  await fetch(`/api/tickets/${ticketId}/status`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status })
                  });
                  loadPlatformData();
                  triggerToast(`Status changed to ${status}`);
                } catch (err) {
                  console.error("Failed to update ticket status", err);
                }
              }}
              onAddTicket={async (newTicket) => {
                try {
                  const res = await fetch("/api/tickets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newTicket)
                  });
                  await res.json();
                  loadPlatformData();
                  triggerToast(`Dispatched crew and loaded ticket!`);
                } catch (err) {
                  console.error("Failed to add ticket", err);
                }
              }}
              selectedCity={selectedCity}
            />
          )}

          {activeTab === "predictive" && (
            <PredictiveAnalytics
              segments={segments}
              damages={damages}
              selectedCity={selectedCity}
            />
          )}

          {activeTab === "advisory" && (
            <GenAIReportBuilder
              segments={segments}
              damages={damages}
              selectedCity={selectedCity}
            />
          )}

          {activeTab === "dev" && (
            <DeveloperHub />
          )}

          {/* Segment Details pop-out shelf */}
          {activeTab === "gis" && selectedSegment && (
            <div className="bg-[#111216] border border-zinc-800 p-4 rounded-xl shadow-xl mt-4 space-y-3" id="segment-detail-shelf">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-2.5">
                <div>
                  <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">Selected Segment Specifications</span>
                  <h4 className="text-sm font-bold text-zinc-100 mt-0.5">{selectedSegment.name}</h4>
                  <p className="text-[9px] text-zinc-500 font-mono">Asset Reference ID: {selectedSegment.id}</p>
                </div>
                <button
                  id="close-segment-shelf"
                  onClick={() => setSelectedSegment(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-150 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 p-1 px-3 rounded-lg cursor-pointer"
                >
                  Hide Specifications
                </button>
              </div>

              {/* Specs detailed grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 font-mono block text-[9px] uppercase tracking-wider">Weekly Health Index</span>
                  <div className="font-bold flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${selectedSegment.healthScore < 60 ? "bg-red-500 animate-pulse" : selectedSegment.healthScore < 80 ? "bg-amber-400" : "bg-emerald-500"}`} />
                    <span className="text-zinc-200 text-sm font-mono font-semibold">{selectedSegment.healthScore}/100</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 font-mono block text-[9px] uppercase tracking-wider">Daily Traffic Volume</span>
                  <div className="font-bold text-zinc-200 font-mono">{selectedSegment.trafficVolumeDaily.toLocaleString()} vehicles/day</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 font-mono block text-[9px] uppercase tracking-wider">Segment Total Distance</span>
                  <div className="font-bold text-zinc-200 font-mono">{selectedSegment.lengthKm} Kilometers</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 font-mono block text-[9px] uppercase tracking-wider">Active Risk Rating</span>
                  <span className={`text-[10px] uppercase font-bold font-mono ${
                    selectedSegment.riskCategory === "Critical" ? "text-red-400 font-bold" :
                    selectedSegment.riskCategory === "High" ? "text-amber-400 font-bold" : "text-emerald-400"
                  }`}>{selectedSegment.riskCategory}</span>
                </div>
              </div>

              {/* Segment Associated Tickets/Damages list */}
              <div className="pt-2.5 border-t border-zinc-800 space-y-2">
                <h5 className="font-semibold text-zinc-300 text-[10px] tracking-wider uppercase font-mono">Current Logged Anomalies on Segment:</h5>
                <div className="space-y-2">
                  {damages.filter(d => d.segmentId === selectedSegment.id).length === 0 ? (
                    <p className="text-xs text-zinc-500 italic font-mono">No pavement distress entries registered. High structural integrity.</p>
                  ) : (
                    damages.filter(d => d.segmentId === selectedSegment.id).map((dmg) => {
                      const associatedTicket = tickets.find(t => t.damageId === dmg.id);
                      return (
                        <div key={dmg.id} className="p-2.5 bg-zinc-950/50 border border-zinc-800/80 rounded-lg flex items-center justify-between gap-3" id={`segment-dmg-row-${dmg.id}`}>
                          <div className="leading-snug">
                            <span className="text-[9px] font-mono text-zinc-500 capitalize block">
                              YOLO anomaly ({dmg.severity})
                            </span>
                            <span className="text-xs font-bold text-zinc-200">{dmg.type}</span>
                            <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                              Coordinate lat long: {dmg.latitude.toFixed(5)}, {dmg.longitude.toFixed(5)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              dmg.status === "Repaired" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              dmg.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            }`}>
                              {dmg.status}
                            </span>

                            {dmg.status !== "Repaired" && (userRole === "Admin" || userRole === "Municipality Officer") && (
                              <div className="flex items-center gap-2">
                                {associatedTicket ? (
                                  associatedTicket.status !== "Completed" && (
                                    <button
                                      id={`resolve-tkt-direct-${associatedTicket.id}`}
                                      onClick={() => handleResolveTicket(associatedTicket.id)}
                                      className="text-[9px] text-emerald-450 hover:text-white hover:bg-emerald-600 bg-emerald-900/20 border border-emerald-800/80 rounded p-1 px-2 font-bold cursor-pointer transition-all"
                                    >
                                      Mark Repaired
                                    </button>
                                  )
                                ) : (
                                  <button
                                    id={`auto-spawn-tkt-direct-${dmg.id}`}
                                    onClick={async () => {
                                      const tktData = {
                                        damageId: dmg.id,
                                        roadName: selectedSegment.name,
                                        damageType: `${dmg.type} (Validated via GIS Control)`,
                                        severity: dmg.severity,
                                        priority: dmg.severity === "Critical" ? "Immediate" : dmg.severity === "Severe" ? "High" : "Medium",
                                        assignedTeam: "Central Asphalt Unit 2",
                                        costEstimate: dmg.repairCost,
                                        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                      };
                                      await fetch("/api/tickets", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(tktData)
                                      });
                                      triggerToast(`Created road maintenance ticket!`);
                                      loadPlatformData();
                                    }}
                                    className="text-[9px] text-[#38bdf8] hover:text-white hover:bg-[#38bdf8]/40 bg-[#38bdf8]/10 border border-[#38bdf8]/30 rounded p-1 px-2 font-bold cursor-pointer transition-all"
                                  >
                                    Spawn Dispatch
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-4 px-6 mt-6 text-[9px] text-zinc-500 font-mono" id="primary-app-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <span>© 2026 InfraSight Platforms Co. | SDE Portfolio Demo</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Node.js v22 | React 19 | Tailwind CSS v4 | YOLOv8 Model Weights API</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
