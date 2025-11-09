import json, sys
from pathlib import Path
import streamlit as st

st.set_page_config(page_title="Race_Publica", layout="wide")
st.title("Race_Publica — Sustainable Waterway Navigation (Berlin MVP)")

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
scored_path = DATA_DIR / "eco_zones_scored.geojson"
routes_path = DATA_DIR / "vessel_routes_scored.geojson"

# Ensure a tiny GeoJSON exists so the app always shows something
if not scored_path.exists():
    scored_path.write_text("""{
      "type":"FeatureCollection","features":[
        {"type":"Feature","properties":{"segment_id":"seg_00001","eco_score":85,"category":"good"},
         "geometry":{"type":"LineString","coordinates":[[13.40,52.50],[13.45,52.51]]}},
        {"type":"Feature","properties":{"segment_id":"seg_00002","eco_score":55,"category":"medium"},
         "geometry":{"type":"LineString","coordinates":[[13.38,52.51],[13.40,52.52]]}},
        {"type":"Feature","properties":{"segment_id":"seg_00003","eco_score":30,"category":"bad"},
         "geometry":{"type":"LineString","coordinates":[[13.46,52.49],[13.50,52.50]]}}
      ]}""")

# Show paths we’re using (helps debug blanks)
st.caption(f"Using: {scored_path.resolve()}")

# Lazy-import heavy deps so we can surface errors nicely
try:
    import geopandas as gpd
    import folium
    from streamlit_folium import st_folium
except Exception as e:
    st.error(f"Import error: {e}")
    st.stop()

# Load GeoJSON with error surface to UI
try:
    gdf = gpd.read_file(scored_path)
    if gdf.empty:
        st.warning("GeoJSON loaded but is empty.")
except Exception as e:
    st.error(f"Failed to read {scored_path.name}: {e}")
    st.stop()

# Build folium map (robust)
center = [52.52, 13.405]
m = folium.Map(location=center, zoom_start=12, tiles="OpenStreetMap")
colors = {"good":"green","medium":"orange","bad":"red"}

for _, row in gdf.iterrows():
    col = colors.get(row.get("category","medium"), "blue")
    geom = row.geometry.__geo_interface__
    folium.GeoJson(
        data=geom,
        style_function=lambda _ , c=col: {"color": c, "weight": 3, "opacity": 0.9},
        tooltip=f'{row.get("segment_id","")} | score={row.get("eco_score","?")} | {row.get("category","")}'
    ).add_to(m)

st_folium(m, height=620)

st.markdown("""
### What the colors mean
- 🟢 **Good** (≥ 70) — low-conflict, eco-preferred  
- 🟠 **Medium** (40–69) — moderate impact  
- 🔴 **Bad** (< 40) — sensitive/congested
""")

# Optional routes table if present
if routes_path.exists():
    try:
        routes = gpd.read_file(routes_path)
        st.subheader("Demo Route Scores")
        st.dataframe(routes.drop(columns="geometry", errors="ignore"))
    except Exception as e:
        st.warning(f"Could not read routes: {e}")
else:
    st.info("Waiting for sample demo routes… (`data/vessel_routes_scored.geojson`).")

