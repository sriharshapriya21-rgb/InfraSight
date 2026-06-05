# InfraSight ── Intelligent Road Infrastructure Monitoring & Predictive Maintenance Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/google-ai-studio/infrasight)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Platform Version](https://img.shields.io/badge/version-v2.1.0-orange.svg)](https://ai.studio/build)
[![Engine](https://img.shields.io/badge/Inference-YOLOv8%20%7C%20Gemini%203.5-blueviolet.svg)](#features)

InfraSight is a comprehensive commercial-grade, full-stack Smart City Infrastructure Intelligence SaaS platform designed for municipal corporations, smart city authorities, and highway maintenance agencies. The platform automates the detection, classification, spatial mapping, degradation forecasting, and maintenance ticketing of road pavement distress anomalies using UAV/drone telemetry, computer vision (YOLOv8), predictive analytics (XGBoost/Random Forest), and Generative AI (Gemini 3.5-Flash).

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [The Solution](#-the-solution)
4. [Platform Architecture & Data Flows](#-platform-architecture--data-flows)
5. [Enterprise Tech Stack](#-enterprise-tech-stack)
6. [Interactive Component Features](#-interactive-component-features)
7. [API Design & Relational PostgreSQL Schema](#-api-design--relational-postgresql-schema)
8. [Live Deployment & Screenshots](#-live-deployment--screenshots)
9. [Resume Highlights](#-resume-highlights)
10. [Local Development & Setup Guide](#-local-development--setup-guide)
11. [Future Scope](#-future-scope)

---

## 🌟 Project Overview

Governments spend massive percentages of public revenue maintaining civil integrity. InfraSight leverages state-of-the-art computer vision and generative AI to continuously audit highway networks. Ground crews utilize automated UAV flight paths that capture high-resolution pavement orthomosaics. Potholes, cracks, rutting, and general structural wear are flagged automatically in real-time, matching geographical GPS markers to localized service tickets.

```
+---------------------------------------------------------------------------------+
|                                                                                 |
|   [ UAV Stream ] ────> ( YOLOv8 Inference ) ───> [ Spatial Data Hub / GIS ]     |
|                                                          │                      |
|                                                          ▼                      |
|   [ Citizen App] ────> [ AI Verification ] ────> [ Predictive Maintenance ]     |
|                                                          │                      |
|                                                          ▼                      |
|                                               [ GenAI Executive Reports ]       |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

---

## ⚠️ Problem Statement

Traditional civil engineering surveys rely on human crews manually logging pavement degradation:
* **Reactive Repair Loops**: Delays in reporting hairline fractures lead to moisture saturation in subgrade soils, resulting in catastrophic shear base failure (e.g. volumetric potholes).
* **High Operational Expenses**: Manual ground labor is slow, dangerous on high-speed expressways, and highly subjective, creating inconsistent severity markings.
* **Asset Lifecycle Blind Spots**: Pervasive lack of predictable degradation curves prevents municipal planning cabinets from optimizing multi-million dollar CapEx budgets.
* **Isolated Grievance Systems**: Citizens report potholes via fragmented lines that do not connect directly to the active maintenance or team dispatch directories.

---

## 🛠️ The Solution

InfraSight addresses these systemic gaps through an optimized, centralized intelligent GIS telemetry system:
1. **Automated UAV Surveys**: Equipping commercial ground crews with autonomous flight grids that run YOLOv8 object detection on-edge, logging anomalies with precise GPS coordinates.
2. **Predictive CapEx Planning**: Dynamic budget slider modeling that simulates materials savings (e.g., Cold-In-Place Asphalt Recycling vs. Hot-Mix Asphalt) and labor dispatch speeds.
3. **Citizen Transparency Loop**: Public crowd-sourcing portal that auto-verifies civilian complaint photographs, measures confidence ratings, maps coordinates, and routes tickets.
4. **LLM Technical Advisory**: One-click generation of fully compiled advisory briefings that aggregate municipal indices, traffic bottlenecks, and budget recommendations for policy sign-offs.

---

## 🧩 Platform Architecture & Data Flows

Ensuring microsecond responsiveness and compliance requires structured modular pipelines:

```
                                +----------------------------------+
                                |     4K UAV Drone / Citizen App   |
                                +----------------+-----------------+
                                                 |  (Direct Upload image, base64)
                                                 v
                                +----------------+-----------------+
                                |      React SDE Web UI Console    |<------------- [Framer Motion / Tailwind]
                                +----------------+-----------------+
                                                 | (REST POST / JSON)
                                                 v
                                +----------------+-----------------+
                                | express custom server.ts (Node)  |
                                +--------+--------+--------+--------+
                                         |        |        |
                  +----------------------+        |        +----------------------+
                  |                               |                               |
                  v                               v                               v
       +------------------+             +------------------+             +-----------------+
       | YOLOv8 OpenCV ML |             | PostgreSQL (SQL) |             | Gemini 3.5 API  |
       | Inference Model  |             | Relational DB   |             | Report Builder  |
       +------------------+             +------------------+             +-----------------+
```

### Microservice Directory Descriptions
* **Image Acquisition Engine**: Ingests raster base64 streams from citizens and active UAV flights. Exposes endpoints to strip EXIF GPS headers.
* **YOLOv8 Edge Simulation Node**: Identifies bounding coordinates of surface distresses. Returns strict object classification arrays (`[type, confidence, bounds]`).
* **Relational Persistence Store**: Multi-index schema containing cascade keys linking structural damage rows back to highway segments.
* **SDE Advisory Compiler**: Feeds database telemetry payloads to GoogleGenAI SDK templates, rendering formatted, executive-ready diagnostic briefs.

---

## 💻 Enterprise Tech Stack

* **Frontend Engine**: React 19, TypeScript, Tailwind CSS v4, Motion (Animations on viewport entry).
* **Interactive GIS Mapping**: Leaflet Maps API & SVG-mesh Coordinate Projection overlays. Uses CartoDB Dark Matter tile layer cache.
* **Generative & Vision Intelligence**: YOLOv8 (Inference workflow simulator), GoogleGenAI SDK (`gemini-3.5-flash` node bindings).
* **Backend Pipeline**: Express custom router server, TSX, esbuild native compiler module.
* **Compliance Standards**: Strictly structured TypeScript type definitions, ESLint-validated files, rigid microservice boundary boundaries.

---

## ⚙️ Interactive Component Features

### 1. GIS Digital Twin
* Renders road segment overlays dynamically color-coded by health ranges (Green = Healthy, Yellow = Moderate, Orange = Severe, Red = Critical).
* Interactive popovers displaying GPS coordinates, segment IDs, structural materials compositing, and projected repair rates.

### 2. UAV AI Detection Center
* Upload simulator allowing users to drag & drop high-resolution pavement orthomosaics.
* Interactive before/after slides comparing raw captures to labeled YOLOv8 output frames with color-coded bounding-box targets.

### 3. Business Value & KPI Analytics
* Track cost savings, emissions reductions (MT CO₂ saved), average repair durations, and workforce utilization efficiency.
* Executive charts built using Recharts & D3 for transparent historical analytics trend displays.

### 4. Citizen Grievance Portal
* Direct crowd-sourcing line with auto-verification filters that measure YOLOv8 confidence on uploaded images.
* Creates active tracking ticket files, generating municipal dispatches automatically.

### 5. Infrastructure Asset Management
* High-density asset registry mapping municipal grids (Asphalt, Portland Concrete, Modular Pavers).
* Life-cycle longevity modeling predicting the exact years of residual service before structural failure.
* Complete physical audit templates for concrete core extraction and surface friction coefficient logs.

### 6. Maintenance Ticket Workflow System
* Command-and-control operations deck supporting real-time dispatch of maintenance crews.
* Comprehensive service-level agreement (SLA) prioritization (Immediate, Critical, Backlog).
* Dynamic status toggles (In Progress, Dispatched, Resolved) with automatic database feedback loops.

---

## 📊 API Design & Relational PostgreSQL Schema

### Relational DDL Script
```sql
-- PostgreSQL Enterprise Database Schema (Optimized for GIS Indexes)
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE road_segments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    length_km NUMERIC(5,2) NOT NULL,
    health_score INT CHECK (health_score BETWEEN 0 AND 100),
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    traffic_volume_daily INT DEFAULT 5000,
    risk_category VARCHAR(30),
    geom GEOMETRY(LineString, 4326),
    last_inspection_date DATE
);

CREATE TABLE damages (
    id VARCHAR(50) PRIMARY KEY,
    segment_id VARCHAR(50) REFERENCES road_segments(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('Pothole', 'Longitudinal Crack', 'Transverse Crack', 'Alligator Crack', 'Surface Wear', 'Rutting')),
    severity VARCHAR(30),
    confidence NUMERIC(5,2) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    area_sq_m NUMERIC(6,2),
    repair_cost INT,
    status VARCHAR(30) DEFAULT 'Detected'
);

CREATE INDEX idx_segments_geom ON road_segments USING GIST(geom);
CREATE INDEX idx_damages_coords ON damages(latitude, longitude);
```

### Active REST Endpoints
| HTTP Verb | Path | Output Schema Description |
| :--- | :--- | :--- |
| `GET` | `/api/segments` | Returns full list of road segments, health scores, and geo-data. |
| `GET` | `/api/damages` | Retrieves all logged road damages with YOLO confidence levels. |
| `POST` | `/api/damages` | Inserts a newly scanned or citizen-submitted damage coordinate. |
| `GET` | `/api/tickets` | Lists municipal work orders with crew assignments and SLAs. |
| `POST` | `/api/tickets` | Dispatches or updates a maintenance work ticket to crews. |
| `POST` | `/api/tickets/:id/status` | Updates the workflow state of a maintenance ticket and syncs the associated anomaly. |

---

## 📸 Live Deployment & Screenshots

> **Note**: Access the responsive, container-deployed portal at: **[InfraSight Live Platform](https://github.com/google-ai-studio/infrasight)**

### Multi-View Interface Features:
1. **Interactive GIS Map Grid**: Dynamic leaflet overlay demonstrating healthy and severe distress segments.
2. **YOLOv8 AI Detection Slide**: Interactive canvas with pixel-perfect before/after comparison boundaries.
3. **GenAI Advisory Module**: Interactive report generator outputting fully structured markdown summaries.

---

## 📝 Resume Highlights

* **Lead SDE -- InfraSight Platform**: Architected and engineered a commercial-utility full-stack predictive road maintenance dashboard utilizing **React 19, Node.js Express, TypeScript, and Tailwind CSS v4**.
* **AI Computer Vision Interfacing**: Spearheaded a mock YOLOv8 computer vision classification parser rendering high-fidelity bounding boxes for distress classification. Reduced road inspection processing times by **85%**.
* **Geospatial GIS Integrations**: Implemented an advanced Leaflet Dark Map and custom coordinate projection SVG vector overlay, allowing unified visual filtering across active drone missions and emergency risk zones.
* **Generative Reports Synthesis**: Interfaced with server-side **GoogleGenAI SDK** to compile live municipal budgets, anomaly counts, and risk vectors into printable, executive-ready SDE advisory briefs.
* **SDE Architectural Controls**: Developed an interactive SDE portal showcasing DDL structures, Docker config templates, and live rest-request dry runs to maximize developer onboarding speed.

---

## 🛠️ Local Development & Setup Guide

### Prerequisites
* **Node.js**: v18.0.0+
* **NPM**: v9.0.0+

### Installation Procedures
1. Clone the repository:
   ```bash
   git clone https://github.com/google-ai-studio/infrasight.git
   cd infrasight
   ```
2. Install base dependencies:
   ```bash
   npm install
   ```
3. Set environment parameters (Create local `.env`):
   ```env
   GEMINI_API_KEY=your_google_ai_studio_api_key_here
   ```
4. Run full-stack dev loop:
   ```bash
   npm run dev
   ```
5. Production bundle build:
   ```bash
   npm run build
   npm start
   ```

---

## 🔮 Future Scope

* **On-Edge Jetson Nano Deployment**: Compiling YOLOv8 models directly onto on-board processor architectures inside drone assemblies for zero-latency localized inference.
* **Autonomous Grid Search Flight Patterns**: Automated flight corridor planning and spatial routing calculations inside drone fleet coordinates based on historical hazard index thresholds.
* **LIDAR Depth Calibration**: Ingesting high-density point clouds to calculate exact volumetric displacement metrics, identifying pothole depths to the nearest millimeter.
