/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MaintenanceTicket, Damage } from "../types";
import { ShieldAlert, AlertTriangle, CheckCircle, CheckCircle2, Clock, Calendar, Users, Hammer, Plus, DollarSign, Activity, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TicketOperationsProps {
  tickets: MaintenanceTicket[];
  damages: Damage[];
  onUpdateTicketStatus: (ticketId: string, status: "Open" | "Dispatched" | "In Progress" | "Completed") => void;
  onAddTicket: (ticket: any) => void;
  selectedCity: string;
}

export default function TicketOperations({
  tickets,
  damages,
  onUpdateTicketStatus,
  onAddTicket,
  selectedCity,
}: TicketOperationsProps) {
  const [activeTab, setActiveTab] = useState<"active" | "analytics" | "create">("active");
  const [showToast, setShowToast] = useState(false);

  // Form State
  const [damageId, setDamageId] = useState("");
  const [roadName, setRoadName] = useState("");
  const [damageType, setDamageType] = useState("Pothole");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Immediate">("High");
  const [assignedTeam, setAssignedTeam] = useState("Meteoric Rapid Repair Unit");
  const [costModel, setCostModel] = useState("1800");

  const openTickets = tickets.filter((t) => t.status !== "Completed");
  const closedTickets = tickets.filter((t) => t.status === "Completed");

  const slametricTotal = tickets.length || 1;
  // SLA threshold limit: anything labeled Immediate must be done in 24 hours, High in 48 hours, Medium in 7 days, etc.
  // SLA compliance calculator
  const complianceCount = tickets.filter((t) => {
    if (t.status === "Completed") return true; // Compliant if completed
    if (t.priority === "Immediate") return false; // Needs immediate attention
    return true; // Simple logic
  }).length;
  const slaCompliancePct = Math.round((complianceCount / slametricTotal) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadName || !assignedTeam) return;

    onAddTicket({
      damageId: damageId || "DMG-CUSTOM",
      roadName,
      damageType,
      priority,
      assignedTeam,
      costEstimate: parseInt(costModel) || 1500,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Open"
    });

    setRoadName("");
    setDamageId("");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setActiveTab("active");
    }, 2000);
  };

  return (
    <div className="space-y-4" id="ticket-operations-root">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-emerald-500 text-white font-mono text-[11px] font-bold py-2 px-4 rounded-lg shadow-lg border border-emerald-600 z-50 flex items-center gap-1.5"
            id="ticket-toast-banner"
          >
            <CheckCircle size={13} />
            <span>ENTERPRISE MAINTENANCE TICKET SUCCESSFULLY SCHEDULED!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111216] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[8px] font-mono uppercase text-zinc-500 font-bold block">Active SLA Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{slaCompliancePct}%</div>
          <span className="text-[9px] text-zinc-550 block font-mono leading-tight">SLA Standards compliant across municipality boards.</span>
        </div>
        <div className="bg-[#111216] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[8px] font-mono uppercase text-zinc-500 font-bold block">Current Open Queues</span>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1">{openTickets.length} Tickets</div>
          <span className="text-[9px] text-zinc-550 block font-mono leading-tight">Assigned dispatches currently under active repair processes.</span>
        </div>
        <div className="bg-[#111216] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[8px] font-mono uppercase text-zinc-500 font-bold block">Fulfilled Logs</span>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{closedTickets.length} Complete</div>
          <span className="text-[9px] text-zinc-550 block font-mono leading-tight">Archived structural fixes successfully closed this quarter.</span>
        </div>
        <div className="bg-[#111216] border border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-[8px] font-mono uppercase text-zinc-500 font-bold block">Allocated CAPEX Pool</span>
          <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
            ${tickets.reduce((sum, t) => sum + (t.costEstimate || 0), 0).toLocaleString()}
          </div>
          <span className="text-[9px] text-zinc-550 block font-mono leading-tight">Aggregate municipal funds committed on scheduled assets.</span>
        </div>
      </div>

      {/* Selector Ribbon */}
      <div className="bg-[#111216] border border-zinc-800 p-2.5 rounded-xl flex justify-between items-center" id="tickets-navbar">
        <div className="flex gap-2 text-[11px] font-mono font-bold">
          <button
            id="ticket-tab-active"
            onClick={() => setActiveTab("active")}
            className={`py-1.5 px-3 rounded-lg border cursor-pointer transition-all ${
              activeTab === "active"
                ? "bg-sky-505/10 border-sky-500/30 text-[#38bdf8]"
                : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850 text-zinc-400"
            }`}
          >
            Dispatched Work queues ({openTickets.length + closedTickets.length})
          </button>
          <button
            id="ticket-tab-analytics"
            onClick={() => setActiveTab("analytics")}
            className={`py-1.5 px-3 rounded-lg border cursor-pointer transition-all ${
              activeTab === "analytics"
                ? "bg-sky-505/10 border-sky-500/30 text-[#38bdf8]"
                : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850 text-zinc-400"
            }`}
          >
            SLA Analytics
          </button>
          <button
            id="ticket-tab-create"
            onClick={() => setActiveTab("create")}
            className={`py-1.5 px-3 rounded-lg border cursor-pointer transition-all text-emerald-400 flex items-center gap-1 ${
              activeTab === "create"
                ? "bg-emerald-500/15 border-emerald-550/30 text-emerald-400"
                : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850"
            }`}
          >
            <Plus size={11} /> Create Work Ticket
          </button>
        </div>
      </div>

      {/* Main panel displays */}
      <div className="bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm" id="tickets-work-area">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ACTIVE DISPATCH LIST */}
          {activeTab === "active" && (
            <motion.div
              key="active-tickets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              id="active-tickets-scroller"
            >
              <div className="border-b border-zinc-850 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider font-mono">Dispatched Work Queue</h3>
                  <p className="text-[10px] text-zinc-500">Scheduled repairs mapped to localized operations centers.</p>
                </div>
                <span className="text-[8.5px] font-mono text-zinc-400">Total: {tickets.length}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tickets.map((t, idx) => {
                  let priorityColor = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                  if (t.priority === "Immediate") priorityColor = "bg-red-500/10 text-red-400 border-red-500/20";
                  else if (t.priority === "High") priorityColor = "bg-orange-500/10 text-orange-450 border-orange-500/20";
                  else if (t.priority === "Medium") priorityColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";

                  let statusColor = "text-zinc-400 bg-zinc-900 border-zinc-800";
                  if (t.status === "Completed") statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                  else if (t.status === "In Progress") statusColor = "text-blue-400 bg-blue-500/10 border-blue-550/20";
                  else if (t.status === "Dispatched") statusColor = "text-amber-400 bg-amber-500/10 border-amber-550/20";

                  // SLA metrics mock countdown
                  let countdown = "6h 42m remaining";
                  let slastatus = "SLA Met";
                  if (t.status !== "Completed") {
                    if (t.priority === "Immediate") {
                      countdown = "1h 15m remaining";
                      slastatus = "Critical SLA Alert";
                    } else if (t.priority === "High") {
                      countdown = "14h 50m remaining";
                    } else {
                      countdown = "4d 18h remaining";
                    }
                  }

                  return (
                    <div
                      key={t.id || idx}
                      className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl relative overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all project-ticket-card"
                      id={`ticket-card-${t.id}`}
                    >
                      <div className="flex justify-between items-start border-b border-zinc-900 pb-2 mb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                            Ticket #{t.id}
                          </span>
                          <h4 className="font-sans font-bold text-zinc-200 text-xs mt-1.5">{t.roadName}</h4>
                          <span className="text-[9.5px] text-[#38bdf8] font-mono block">{t.damageType} Repair Order</span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border ${priorityColor} font-bold uppercase`}>
                            {t.priority}
                          </span>
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border ${statusColor} font-bold uppercase`}>
                            {t.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] space-y-1.5 font-mono text-zinc-400 pb-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-550 font-bold uppercase flex items-center gap-1">
                            <Users size={11} /> Team Assignment:
                          </span>
                          <span className="text-zinc-300 font-sans font-semibold">{t.assignedTeam}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-550 font-bold uppercase flex items-center gap-1">
                            <Calendar size={11} /> Scheduled Target Date:
                          </span>
                          <span className="text-zinc-300">{t.dueDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-550 font-bold uppercase flex items-center gap-1">
                            <DollarSign size={11} /> Financial CapEx Cost:
                          </span>
                          <span className="text-emerald-400 font-semibold">${t.costEstimate?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* State Dispatch Picker buttons */}
                      <div className="border-t border-zinc-900/80 pt-2.5 flex justify-between items-center bg-zinc-950 font-mono">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-zinc-550 block font-bold uppercase">SLA COMPLIANCE INDICATOR:</span>
                          <span className={`text-[9px] font-bold ${t.status === "Completed" ? "text-emerald-400" : "text-amber-500 font-sans font-semibold"}`}>
                            {t.status === "Completed" ? "SLA Target Completed Successfully" : countdown}
                          </span>
                        </div>
                        
                        {t.status !== "Completed" && (
                          <div className="flex gap-1 text-[9px] font-bold">
                            <select
                              value={t.status}
                              onChange={(e) => onUpdateTicketStatus(t.id, e.target.value as any)}
                              className="bg-zinc-900 hover:bg-zinc-850 cursor-pointer border border-zinc-800 text-zinc-300 rounded p-1 text-[9px] font-mono leading-none focus:outline-none"
                            >
                              <option value="Open">Pending Action</option>
                              <option value="Dispatched">Dispatch Crew</option>
                              <option value="In Progress">Begin Paving</option>
                              <option value="Completed">Mark Completed / Archive</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: ANALYTICS */}
          {activeTab === "analytics" && (
            <motion.div
              key="ticket-analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              id="analytics-ticket-panel"
            >
              <div>
                <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider font-mono">Operations & Dispatch Metrics</h3>
                <p className="text-[10px] text-zinc-550">SLA thresholds, dispatch frequency, and budget allocations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gauge SLA Met */}
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-2">
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">SLA Compliance Index</span>
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="44" stroke="#1d2026" strokeWidth="6" fill="transparent" />
                      <circle cx="56" cy="56" r="44" stroke="#10b981" strokeWidth="6" fill="transparent"
                        strokeDasharray={276} strokeDashoffset={276 - (276 * slaCompliancePct) / 100} />
                    </svg>
                    <div className="absolute font-mono font-bold text-zinc-200 text-base">{slaCompliancePct}%</div>
                  </div>
                  <p className="text-[9.5px] text-zinc-550">Target compliance rate: &gt;95% (Excellent SLA)</p>
                </div>

                {/* Team dispatch distribution */}
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Resource Utilization</span>
                  <div className="space-y-2 text-[10px] font-mono">
                    {[
                      { name: "Metro Repair Division", hours: "14 tickets", val: 80, color: "bg-[#38bdf8]" },
                      { name: "Asphalt Tactical Crew", hours: "8 tickets", val: 55, color: "bg-emerald-400" },
                      { name: "Subsurface Utility Unit", hours: "3 tickets", val: 20, color: "bg-amber-400" }
                    ].map((crew, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-zinc-400">
                          <span>{crew.name}</span>
                          <span className="text-zinc-250 font-bold">{crew.hours}</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${crew.color}`} style={{ width: `${crew.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[8.5px] text-zinc-500 italic font-mono block">Workforce availability currently at: 89.2%</span>
                </div>

                {/* Performance SLA details */}
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3 font-mono text-[10.5px]">
                  <span className="text-[8.5px] text-zinc-500 uppercase tracking-widest font-bold block">SLA Threshold Specifications</span>
                  <div className="space-y-2 leading-relaxed">
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-red-400 font-bold">IMMEDIATE PRIORITY</span>
                      <span className="text-zinc-300">24-hour target (94.2% met)</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-orange-400 font-bold">HIGH PRIORITY</span>
                      <span className="text-zinc-300">72-hour target (96.0% met)</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-amber-500 font-semibold">MEDIUM PRIORITY</span>
                      <span className="text-zinc-300">7-day target (99.1% met)</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-550 leading-tight">Average municipal ticket turnaround time index is 4.2 days across all categories.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CREATE CUSTOM TICKET */}
          {activeTab === "create" && (
            <motion.form
              key="ticket-builder-view"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 max-w-lg mx-auto"
              id="enterprise-ticket-builder-form"
            >
              <div className="border-b border-zinc-850 pb-2 text-center">
                <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider font-mono">Launch Maintenance Ticket</h3>
                <p className="text-[10px] text-zinc-550 mt-0.5">Programmatic construction scheduler. Auto-assigns crews and structures budgets.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase tracking-wider text-zinc-500 block mb-1">Target Road / Sector Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oakridge Bypass Lane 4"
                    value={roadName}
                    onChange={(e) => setRoadName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded focus:outline-none focus:border-zinc-700 text-zinc-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase tracking-wider text-zinc-500 block mb-1">Severity Classification Option</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-zinc-350 cursor-pointer focus:outline-none"
                  >
                    <option value="Low">Low Priority (Scheduled Routine)</option>
                    <option value="Medium">Medium Priority (Standard Paving)</option>
                    <option value="High">High Priority (Expedited)</option>
                    <option value="Immediate">Immediate Priority (24h SLA Lock)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase tracking-wider text-zinc-500 block mb-1">Repairs Crew Assignment</label>
                  <select
                    value={assignedTeam}
                    onChange={(e) => setAssignedTeam(e.target.value)}
                    className="w-full"
                    style={{ background: "#090a0c", padding: "8px", border: "1px solid #27272a", borderRadius: "4px", color: "#a1a1aa" }}
                  >
                    <option value="Metro Highway Command">Metro Highway Command (Heavy Machinery)</option>
                    <option value="Cold-Pave Recycling Team">Cold-Pave Recycling Crew (Sustain-oriented)</option>
                    <option value="Asphalt Tacticals Squadron 4">Asphalt Tacticals Squadron 4 (Rapid Dispatch)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase tracking-wider text-zinc-500 block mb-1">Projected Construction Budget ($)</label>
                  <input
                    type="number"
                    value={costModel}
                    onChange={(e) => setCostModel(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-zinc-300 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 border border-emerald-555 font-bold text-white p-2 text-xs rounded transition-all font-mono tracking-wider w-full cursor-pointer shadow"
                >
                  DISPATCH CREW AND WRITE TICKET ENTRY
                </button>
              </div>
            </motion.form>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
