/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Send, Upload, Star, User, Phone, MapPin, Compass, CheckCircle2, ShieldCheck, Activity, Eye, FileText, AlertTriangle } from "lucide-react";
import { Complaint, MaintenanceTicket } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CitizenPortalProps {
  complaints: Complaint[];
  tickets: MaintenanceTicket[];
  onSubmitComplaint: (complaintData: any) => Promise<any>;
}

export default function CitizenPortal({
  complaints,
  tickets,
  onSubmitComplaint,
}: CitizenPortalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [detectedAnomaly, setDetectedAnomaly] = useState<any>(null);
  
  // Tab layout: Submit Complaint vs Track Complaints
  const [activeSubTab, setActiveSubTab] = useState<"submit" | "track">("submit");

  // Coordinates
  const [lat, setLat] = useState(40.718);
  const [lng, setLng] = useState(-74.001);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !desc) return;
    
    setSubmitting(true);
    setVerifying(true);
    setVerificationDone(false);
    
    // Simulate Neural Network scanning latency
    setTimeout(async () => {
      try {
        const result = await onSubmitComplaint({
          citizenName: name,
          phone,
          locationDescription: desc,
          latitude: lat,
          longitude: lng
        });

        setDetectedAnomaly(result);
        setVerifying(false);
        setVerificationDone(true);
        
        // Reset state
        setName("");
        setPhone("");
        setDesc("");
      } catch (err) {
        console.error("Verification failed", err);
        setVerifying(false);
      } finally {
        setSubmitting(false);
      }
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="citizen-portal-root">
      
      {/* Left Column: Interactive Navigation & FAQ */}
      <div className="lg:col-span-1 bg-[#111216] border border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col justify-between animate-fadeIn" id="citizen-portal-instructions">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-zinc-900 border border-zinc-805 text-[#38bdf8] rounded font-mono text-[9px] font-bold">
              <User size={13} />
            </span>
            <h3 className="font-semibold text-zinc-150 font-mono tracking-wider uppercase text-xs">Citizen Desk</h3>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Infrastructure safety is co-operative. Residents can upload photo evidence of road distress. InfraSight AI immediately verifies complaints to initiate fast service dispatches.
          </p>

          <div className="border-t border-zinc-850 pt-3 space-y-2">
            <button
              id="set-portal-submit-tab"
              onClick={() => { setActiveSubTab("submit"); setVerificationDone(false); }}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activeSubTab === "submit"
                  ? "bg-sky-505/10 border-sky-500/30 text-[#38bdf8] font-bold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-850 text-zinc-400"
              }`}
            >
              <Send size={13} />
              <span className="text-xs">Log Pavement Incident</span>
            </button>

            <button
              id="set-portal-track-tab"
              onClick={() => { setActiveSubTab("track"); }}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activeSubTab === "track"
                  ? "bg-sky-505/10 border-sky-500/30 text-[#38bdf8] font-bold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-850 text-zinc-400"
              }`}
            >
              <Eye size={13} />
              <span className="text-xs">Track Ticket Statuses ({complaints.length})</span>
            </button>
          </div>
        </div>

        {/* Feature 29 verification guide banner */}
        <div className="bg-zinc-950/60 border border-zinc-850 rounded-lg p-3.5 mt-4 text-[10px] text-zinc-400 space-y-1.5">
          <span className="font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1 font-mono">
            <ShieldCheck className="text-[#38bdf8]" size={12} />
            YOLOv8 Edge Audit
          </span>
          <p className="leading-relaxed text-[9.5px]">
            Uploaded photos are streamed directly to our computer vision verification nodes to bypass clerical backlogs, mapping GPS metadata and generating immediate repair prioritized indexes.
          </p>
        </div>
      </div>

      {/* Right Column Content Panel */}
      <div className="lg:col-span-2 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm" id="citizen-portal-main-area">
        <AnimatePresence mode="wait">
          {activeSubTab === "submit" && !verificationDone && (
            <motion.form
              key="complaint-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-4"
              id="citizen-complaint-submission-form"
            >
              <div className="border-b border-zinc-850 pb-2.5">
                <h3 className="font-bold font-sans text-zinc-150 text-xs tracking-wider uppercase font-mono">Register Road Hazard</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Provide localized coordinates and attach drone/smartphone telemetry imagery.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-zinc-500" size={13} />
                    <input
                      id="citizen-input-name"
                      type="text"
                      required
                      placeholder="e.g. Amanda Cole"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">Active Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-zinc-500" size={13} />
                    <input
                      id="citizen-input-phone"
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">Damage Description & Landmarks</label>
                <textarea
                  id="citizen-input-desc"
                  required
                  placeholder="Describe location size, landmarks, or lane alignment details. E.g. Broadway Lane 2, near exit 4 tunnel."
                  rows={2.5}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Grid Location mock inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1">Latitude Coordinate</label>
                  <input
                    id="citizen-input-lat"
                    type="number"
                    step="0.001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1">Longitude Coordinate</label>
                  <input
                    id="citizen-input-lng"
                    type="number"
                    step="0.001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              {/* Mock photo slot */}
              <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-lg flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Upload size={14} className="text-[#38bdf8]" />
                  <span>Road Anomaly Thumbnail (YOLO Simulated Source)</span>
                </div>
                <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[8.5px] rounded font-bold uppercase font-mono">
                  Telemetry Linked
                </span>
              </div>

              <button
                id="submit-complaint-btn"
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1b43bc] hover:bg-blue-700 font-bold font-mono text-white p-2.5 text-[11px] rounded transition-all disabled:opacity-50 cursor-pointer shadow flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Activity size={13} className="animate-spin text-emerald-400" />
                    <span>Infrasight Edge Verifier Running...</span>
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Transmit & Run AI Verification Scan</span>
                  </>
                )}
              </button>
            </motion.form>
          )}

          {/* AI Automatic Verification overlay screen (Feature 29: AI Complaint Verification) */}
          {activeSubTab === "submit" && verificationDone && detectedAnomaly && (
            <motion.div
              key="ai-verification-splash"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 text-center py-4"
              id="verification-completed-banner"
            >
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <ShieldCheck size={24} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-150 font-mono tracking-wider uppercase">Hazard Verification Successful</h3>
                <p className="text-[10px] text-emerald-400 font-bold font-mono flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} /> YOLOv8 CV Node: 100% Quality Confirmed
                </p>
              </div>

              {/* Box of auto-approval specifics */}
              <div className="bg-zinc-950/60 border border-zinc-850 rounded-lg p-3.5 max-w-md mx-auto text-left space-y-3 font-mono">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <span className="text-[8.5px] font-bold text-zinc-500">Defect Classification</span>
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {detectedAnomaly.complaint.detectedType}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-[10px]">
                  <div>
                    <span className="text-zinc-500 block text-[8px] font-bold uppercase">CORMS SCORE</span>
                    <span className="font-bold text-red-400">{detectedAnomaly.complaint.verifiedSeverity} Severity Level</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px] font-semibold uppercase">GPS LOCATION MATRIX</span>
                    <span className="font-bold text-zinc-300">{detectedAnomaly.complaint.latitude.toFixed(4)}, {detectedAnomaly.complaint.longitude.toFixed(4)}</span>
                  </div>
                </div>

                <div className="bg-sky-505/10 border border-sky-500/20 p-2.5 rounded-lg flex items-start gap-2 text-[10px] text-sky-400">
                  <Activity size={12} className="text-sky-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-[9.5px] uppercase tracking-wider font-mono">Dispatch Initiated</span>
                    <p className="text-[9px] text-[#38bdf8] leading-normal mt-0.5 font-sans">
                      Work Team Dispatch ticket <span className="font-mono font-bold">#{detectedAnomaly.ticket.id}</span> structured for <span className="font-bold text-zinc-200">{detectedAnomaly.ticket.assignedTeam}</span> with autonomous cost audit projection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2 pt-2 text-[11px] font-mono font-bold">
                <button
                  id="reset-complaint-center-btn"
                  onClick={() => { setVerificationDone(false); setActiveSubTab("submit"); }}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-400 py-1.5 px-3.5 rounded hover:text-zinc-200 cursor-pointer transition-all"
                >
                  Post Another Incident
                </button>
                <button
                  id="view-tracked-after-submit"
                  onClick={() => { setActiveSubTab("track"); setVerificationDone(false); }}
                  className="bg-[#1b43bc] hover:bg-blue-700 text-white py-1.5 px-3.5 rounded cursor-pointer transition-all border border-[#1b2580]/50"
                >
                  Inspect In Portal Ledger
                </button>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Track Citizen Complaints list */}
          {activeSubTab === "track" && (
            <motion.div
              key="complaints-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
              id="citizen-complaints-list-container"
            >
              <div className="border-b border-zinc-850 pb-2.5">
                <h3 className="font-bold font-sans text-zinc-150 text-xs tracking-wider uppercase font-mono">Civil Ledger Logs</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Active civil complaints registered and validated through community sensors.</p>
              </div>

              <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
                {complaints.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic text-center py-8 font-mono">No public entries registered.</p>
                ) : (
                  complaints.map((c, i) => (
                    <div key={c.id || i} className="p-3 bg-zinc-950/40 border border-zinc-850/80 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all" id={`citizen-complaint-item-${i}`}>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-zinc-200 text-xs">{c.citizenName}</span>
                          <span className="text-[8.5px] font-mono text-zinc-500">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</span>
                        </div>
                        <p className="text-xs text-zinc-400 italic">"{c.locationDescription}"</p>
                        
                        {c.detectedType && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8.5px] bg-red-500/10 text-red-400 border border-red-550/20 font-bold px-1.5 py-0.5 rounded font-mono">
                              Verified: {c.detectedType}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right space-y-1 shrink-0 w-full md:w-auto font-mono">
                        <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border block text-center md:inline-block ${
                          c.status === "Ticket Created" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-sky-505/10 text-sky-400 border-sky-500/20"
                        }`}>
                          {c.status}
                        </span>
                        {c.ticketId && (
                          <span className="text-[8.5px] font-mono text-zinc-500 block">
                            Dispatch ID: <span className="text-zinc-300 font-bold">#{c.ticketId}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
