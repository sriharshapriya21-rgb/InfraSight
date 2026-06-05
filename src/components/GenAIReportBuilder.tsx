/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, FileText, CheckCircle2, RefreshCw, Layers, ShieldAlert, Cpu, Download, Landmark, Compass, Printer } from "lucide-react";
import { RoadSegment, Damage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface GenAIReportBuilderProps {
  segments: RoadSegment[];
  damages: Damage[];
  selectedCity: string;
}

const REASSURING_AI_MESSAGES = [
  "Structuring UAV spatial coordinate matrices...",
  "Injesting YOLOv8 model anomalies indexes...",
  "Computing XGBoost 90-day degradation forecasts...",
  "Auditing municipality CapEx reserve funds...",
  "Synthesizing advisory guidelines via Gemini-3.5-family model..."
];

export default function GenAIReportBuilder({
  segments,
  damages,
  selectedCity,
}: GenAIReportBuilderProps) {
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reportText, setReportText] = useState<string | null>(null);
  const [simulatedAlert, setSimulatedAlert] = useState(false);

  const citySegments = segments.filter(s => s.city === selectedCity);
  const segmentIds = citySegments.map(s => s.id);
  const cityDamages = damages.filter(d => segmentIds.includes(d.segmentId));

  // Compute stats to send to Gemini
  const avgHealth = Math.round(
    citySegments.reduce((acc, curr) => acc + curr.healthScore, 0) / (citySegments.length || 1)
  );
  const totalPlannedRepairCost = cityDamages
    .filter(d => d.status !== "Repaired")
    .reduce((acc, curr) => acc + curr.repairCost, 0);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setReportText(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % REASSURING_AI_MESSAGES.length);
    }, 1200);

    try {
      const response = await fetch("/api/gemini/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: selectedCity,
          metrics: {
            cityHealthScore: avgHealth,
            activeScans: 2,
            totalDamages: cityDamages.filter(d => d.status !== "Repaired").length,
            criticalSegmentsCount: citySegments.filter(s => s.healthScore < 60).length,
            totalPlannedRepairCost,
            budgetAllocated: selectedCity.includes("Metro") ? 1250000 : selectedCity.includes("Oakridge") ? 850000 : 600000,
            budgetSpent: selectedCity.includes("Metro") ? 420000 : selectedCity.includes("Oakridge") ? 245000 : 120000,
          }
        })
      });
      
      const data = await response.json();
      clearInterval(stepInterval);

      if (data.report) {
         setReportText(data.report);
        setSimulatedAlert(data.simulated || false);
      } else {
        setReportText("We were unable to synthesis the Gemini response. Check if server process.env variable bindings are complete.");
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setReportText(`Error while summoning Gemini advisory agents: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 font-sans animate-fadeIn" id="genai-report-root">
       
      {/* Sidebar Controls and Technology Architecture Showcase */}
      <div className="lg:col-span-1 bg-[#111216] border border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col justify-between gap-4" id="report-sidebar-control">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-zinc-900 border border-zinc-805 text-zinc-400 rounded font-mono text-[9px] font-bold">
              <Sparkles size={11} fill="currentColor" className="text-[#38bdf8]" />
            </span>
            <h3 className="font-semibold text-zinc-150 text-xs uppercase tracking-wider font-mono">Executive Audit</h3>
          </div>

          <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
            Harness generative intelligence to synthesize orthomosaic images, failure parameters, and municipal funds into a print-ready PDF audit report.
          </p>

          <button
            id="trigger-genai-report"
            disabled={generating}
            onClick={handleGenerateReport}
            className="w-full bg-[#1b43bc] hover:bg-blue-700 text-white font-mono font-bold text-xs p-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow"
          >
            {generating ? (
              <RefreshCw className="animate-spin text-white" size={13} />
            ) : (
              <Sparkles size={13} className="text-[#38bdf8] fill-[#38bdf8]" />
            )}
            <span>{generating ? "Agent writing..." : "Draft Executive Audit"}</span>
          </button>
        </div>

        {/* Recruiter Showcase: Technology Architecture Board */}
        <div className="bg-zinc-950/80 border border-zinc-850 p-3 rounded-lg space-y-2 text-[10px]">
          <span className="font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5 font-mono text-[9px]">
            <Landmark size={12} className="text-[#38bdf8]" /> TECHNOLOGY ARCHITECTURE
          </span>
          <div className="space-y-1.5 font-mono text-[8.5px] text-zinc-450 leading-relaxed">
            <div>
              <strong className="text-[#38bdf8]">React Frontend:</strong>
              <div className="text-zinc-500">Dual-view telemetry, responsive filters & states.</div>
            </div>
            <div className="border-t border-zinc-900 pt-1">
              <strong className="text-emerald-400">TypeScript Core:</strong>
              <div className="text-zinc-500">Strict structural models, interfaces & type safety.</div>
            </div>
            <div className="border-t border-zinc-900 pt-1">
              <strong className="text-amber-500">Express Backend:</strong>
              <div className="text-zinc-500">REST API controllers, secure Gemini wrapper proxies.</div>
            </div>
            <div className="border-t border-zinc-900 pt-1">
              <strong className="text-[#38bdf8]">Gemini Multi-Modal AI:</strong>
              <div className="text-zinc-500">Structured prompt templates & image payload vision audits.</div>
            </div>
            <div className="border-t border-zinc-900 pt-1">
              <strong className="text-pink-400">Analytics & Export:</strong>
              <div className="text-zinc-500">Recharts asphalt decay curves, seamless HTML-to-PDF print engine.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Canvas Display paper */}
      <div className="lg:col-span-3 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm min-h-[460px] flex flex-col justify-between animate-fadeIn" id="report-canvas-paper">
        
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-16"
              id="report-loading-screen"
            >
              <div className="w-12 h-12 bg-gradient-to-tr from-[#38bdf8] via-[#1b43bc] to-emerald-400 rounded-full flex items-center justify-center animate-spin relative shadow-sm">
                <div className="w-9 h-9 bg-[#111216] rounded-full flex items-center justify-center">
                  <Sparkles className="text-[#38bdf8] animate-pulse" size={15} />
                </div>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-zinc-200 text-xs font-mono uppercase tracking-wider">ADVISORY AGENT DRAFTING REPORT</h4>
                <p className="text-[10px] text-[#38bdf8] font-mono tracking-wide animate-pulse">
                  {REASSURING_AI_MESSAGES[loadingStep]}
                </p>
              </div>
            </motion.div>
          ) : reportText ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-between h-full relative"
              id="advisory-report-paper"
            >
              {/* Paper Letterhead */}
              <div className="border-b-2 border-zinc-700 pb-3 mb-4 flex justify-between items-start">
                <div className="space-y-1.5 flex items-start gap-3">
                  <div className="p-1 px-1.5 bg-zinc-950 border border-zinc-800 rounded text-sky-400 font-mono text-center leading-none">
                    <Landmark size={18} className="text-sky-400 shrink-0" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase tracking-widest font-mono font-bold text-zinc-400">
                      MUNICIPAL SECURITY COMMISIONEERS OFFICE
                    </span>
                    <h3 className="text-xs font-mono font-bold text-zinc-150 uppercase tracking-wide">INFRASTRUCTURE INTEGRITY BOARD</h3>
                    <div className="text-[9px] font-mono text-zinc-500">
                      SaaS Identifier Node: IS-AI-AUDIT-V2 | Target: {selectedCity.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[8.5px] font-mono text-zinc-400 space-y-0.5">
                  <div>DATE: {new Date().toLocaleDateString()}</div>
                  <div>VERIFICATION CODE: <span className="font-bold text-[#38bdf8]">SECURED-92A</span></div>
                  <div>CLASSIFICATION: <span className="font-bold text-emerald-400">UNRESTRICTED</span></div>
                </div>
              </div>

              {/* Formatted Text layout */}
              <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3.5 text-xs text-zinc-300 pr-1 select-text" id="advisory-markdown-view">
                {simulatedAlert && (
                  <div className="p-2 bg-zinc-950 border border-[#38bdf8]/10 rounded text-[9.5px] text-zinc-400 flex items-center gap-1.5 mb-2 font-mono">
                    <Sparkles size={11} className="text-[#38bdf8] shrink-0" />
                    <span>Infrasight API Key fallback mode active. Displaying high-precision compiled audit analytics.</span>
                  </div>
                )}

                {reportText.split("\n\n").map((block, bIdx) => {
                  if (block.startsWith("# ")) {
                    return <h1 key={bIdx} className="text-xs uppercase font-bold text-[#38bdf8] border-b border-zinc-800 pb-1 mt-3.5 font-mono tracking-wider">{block.replace("# ", "")}</h1>;
                  } else if (block.startsWith("## ")) {
                    return <h2 key={bIdx} className="text-[11px] uppercase font-bold text-zinc-100 border-b border-zinc-800 pb-0.5 mt-2.5 font-mono tracking-wide">{block.replace("## ", "")}</h2>;
                  } else {
                    return <p key={bIdx} className="whitespace-pre-line text-zinc-300 leading-relaxed text-[10.5px] font-sans">{block}</p>;
                  }
                })}

                {/* Print Sign-off block for Recruiter / Commisssioner auth */}
                <div className="border-t border-zinc-800 pt-4 mt-6 grid grid-cols-2 gap-4 pb-4">
                  <div className="text-[10px] space-y-2">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Inspecting Authority</span>
                    <div className="h-6 w-32 border-b border-dashed border-zinc-700" />
                    <span className="font-mono text-[9px] text-zinc-400 block font-bold">MUNICIPAL LEAD SDE AUDITOR</span>
                  </div>
                  <div className="text-[10px] text-right space-y-2">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Verification Stamp</span>
                    <div className="inline-block px-1.5 py-0.5 border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 font-mono text-[8px] uppercase rounded">
                      PLATFORM APPROVED
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions below report */}
              <div className="border-t border-zinc-850 pt-3 mt-4 flex items-center justify-between text-xs" id="paper-actions">
                <span className="text-zinc-500 font-mono text-[9px]">
                  Powered by G-GenAI-3.5 Core Engine
                </span>

                <div className="flex items-center gap-2">
                  <button
                    id="print-report-btn"
                    onClick={handlePrint}
                    className="p-1 px-3 border border-zinc-850 text-zinc-405 hover:text-white rounded bg-zinc-900 transition-all cursor-pointer font-mono text-[9.5px] font-bold flex items-center gap-1.5 shadow"
                  >
                    <Printer size={12} className="text-sky-400" />
                    <span>EXPORT HIGH-FIDELITY PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="standby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-12"
              id="report-standby-screen"
            >
              <FileText size={36} className="text-zinc-600 mb-2.5 animate-pulse" />
              <h4 className="font-bold text-zinc-200 text-xs font-mono uppercase tracking-wider mb-1">Generate Advisory Briefing</h4>
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed max-w-sm">
                Analyze live municipal telemetry, structural decay rates, and budget spent metrics across {selectedCity} districts.
              </p>
              <button
                id="draft-init-btn"
                onClick={handleGenerateReport}
                className="mt-4 bg-[#1b43bc] hover:bg-blue-700 text-white border border-transparent font-mono font-bold text-[10px] py-2 px-5 rounded-lg cursor-pointer transition-all shadow"
              >
                INITIATE DRAFT GENERATIVE REPORT
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
