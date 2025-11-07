# Race_Publica — Software Architecture & Data Flow

## Mission
Create a gamified navigation layer for Berlin’s waterways using Copernicus and Galileo data.  
Participants (vessels, tourists, operators) earn Civic Credits for eco-friendly routes that reduce congestion and environmental stress.

---

## System Overview
```text
┌──────────────────────┐
│ Copernicus Data Space│  ← Satellite imagery (Sentinel-2/3)
└──────────┬───────────┘
           ↓
┌───────────────────────────────┐
│ Data Ingestion Layer (Python) │
│ - Download/parse GeoTIFFs     │
│ - Import OSM/GeoJSON waterways│
│ - Simulate vessel tracks      │
└──────────┬────────────────────┘
           ↓
┌───────────────────────────────┐
│ Processing & Scoring Engine   │
│ - Zone sensitivity analysis   │
│ - Conflict detection          │
│ - Civic Credit rules          │
│ (GeoPandas, Pandas, Shapely)  │
└──────────┬────────────────────┘
           ↓
┌───────────────────────────────┐
│ Data Store                    │
│ - SQLite / CSV / JSON         │
│ - Stores vessel tracks, scores│
└──────────┬────────────────────┘
           ↓
┌───────────────────────────────┐
│ Visualization Layer           │
│ - Jupyter + ipyleaflet maps   │
│ - Streamlit / Plotly dashboard│
│ - Leaderboard & Eco Index     │
└──────────┬────────────────────┘
           ↓
┌───────────────────────────────┐
│ Gamification & Rewards Logic  │
│ - Civic Credit engine (Python)│
│ - Mock tokenization module    │
└───────────────────────────────┘


## Key Components & Libraries
Layer	Tools	Purpose
Data Access	sentinelsat, Copernicus Data Space API	Download Sentinel-2 imagery for water analysis
Geospatial Analysis	GeoPandas, Shapely, rasterio	Process waterways, zones, and vessel tracks
Visualization (Prototype)	ipyleaflet, folium, plotly, matplotlib	Interactive maps and analytics inside Jupyter
Visualization (MVP Web)	Streamlit, leafmap	Public-facing demo with scoring and leaderboard
Data Storage	SQLite, CSV, JSON	Lightweight persistence
Gamification Logic	Python modules	Civic Credit calculations, eco-score updates
Version Control	GitHub	Collaboration and reproducibility
Deployment (optional)	Streamlit Cloud	Free hosting for demo app
Data Flow Description

Ingest Copernicus Sentinel-2 imagery via API and clip to Berlin’s waterways.

Import OpenStreetMap/GeoJSON shapefile for river geometry.

Process raster and vector data to assign sensitivity scores to segments.

Simulate Galileo-like vessel positions (synthetic data).

Score routes based on overlap with sensitive areas and timing (off-peak earns more).

Store results in SQLite/CSV.

Visualize dynamic map with ipyleaflet (dev) and Streamlit (demo).

Display leaderboard, total eco-credits and district eco-index.

(Optional) Tokenize credits for interoperability with city systems.

Development Roles
Role	Member	Focus
Data Engineering & Ingestion	Pavlo	Copernicus data access, file structure
Data Science / Scoring	Sahand	Rule logic, analytics, KPIs
Technical Lead / PM	Jeremy	Architecture, visualisation, gamification
Frontend / UX (TBD)	–	Ivan
