import { useState, useRef, useEffect } from 'react';
import { tegelerSeeBoundary } from '../data/tegelerSeeRoutes.js';
import {
    loadNDWIData,
    findOptimalPathsWithNDWI,
    findNearestNDWIPoint,
    getNDWIPoints
} from '../utils/ndwiPathFinder.js';
// (keep other utils if used for path calculation on click)
// Debug component to handle map clicks
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e);
        },
    });
    return null;
}

const MapComponent = ({
                          waterways,
                          selectedRoute,
                          onRouteSelect,
                          visibleRoutes,
                          routeControls
                      }) => {
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [calculatedPaths, setCalculatedPaths] = useState(null);
    const [ndwiData, setNdwidata] = useState(null);
    const [ndwiPoints, setNdwipoints] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [clickMessage, setClickMessage] = useState('Click near a water data point to start');
    const mapRef = useRef();

    useEffect(() => {
        // Load NDWI data on component mount
        const loadData = async () => {
            setIsLoading(true);
            const data = await loadNDWIData();
            setNdwidata(data);
            setNdwipoints(getNDWIPoints());
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleMapClick = async (e) => {
        if (!ndwiData) return;

        const { lat, lng } = e.latlng;

        // Check if clicked point is near any NDWI data
        const nearestPoint = findNearestNDWIPoint(lng, lat);

        if (!nearestPoint) {
            setClickMessage('No water data here. Click near the lake where data points are visible.');
            setTimeout(() => {
                if (!startPoint) setClickMessage('Click near a water data point to start');
                else if (!endPoint) setClickMessage('Click near a water data point to set end');
            }, 2000);
            return;
        }

        // Use the actual NDWI point coordinates, not the click coordinates
        const actualPoint = [nearestPoint.lng, nearestPoint.lat];

        if (!startPoint) {
            setStartPoint(actualPoint);
            setClickMessage('Now click another water data point for the end');
        } else if (!endPoint) {
            setEndPoint(actualPoint);
            setIsLoading(true);

            // Calculate paths using NDWI data
            const paths = findOptimalPathsWithNDWI(startPoint, actualPoint);
            setCalculatedPaths(paths);
            setIsLoading(false);
            setClickMessage('Click any water data point to start new route');
        } else {
            // Reset and start new
            setStartPoint(actualPoint);
            setEndPoint(null);
            setCalculatedPaths(null);
            setClickMessage('Now click another water data point for the end');
        }
    };

    const getPathColor = (quality) => {
        if (quality >= 80) return '#10b981'; // Green - Excellent
        if (quality >= 60) return '#f59e0b'; // Yellow - Good
        if (quality >= 40) return '#f97316'; // Orange - Moderate
        return '#ef4444'; // Red - Poor
    };

    const getPointColor = (ndwiValue) => {
        if (ndwiValue >= 0.5) return '#10b981'; // Green - Excellent
        if (ndwiValue >= 0.3) return '#f59e0b'; // Yellow - Good
        if (ndwiValue >= 0.1) return '#f97316'; // Orange - Moderate
        if (ndwiValue >= 0) return '#ef4444'; // Red - Poor
        return '#6b7280'; // Gray - Non-water
    };

    const getRouteStyle = (type, isSelected = false) => {
        const baseStyles = {
            good: { color: '#10b981', weight: 5, opacity: 0.6 },
            medium: { color: '#f59e0b', weight: 5, opacity: 0.6 },
            bad: { color: '#ef4444', weight: 5, opacity: 0.6 }
        };

        const selectedStyles = {
            good: { color: '#059669', weight: 8, opacity: 1 },
            medium: { color: '#d97706', weight: 8, opacity: 1 },
            bad: { color: '#dc2626', weight: 8, opacity: 1 }
        };

        return isSelected
            ? selectedStyles[type] || selectedStyles.good
            : baseStyles[type] || baseStyles.good;
    };

    const filteredWaterways = waterways.filter(waterway =>
        visibleRoutes[waterway.type]
    );

    return (
        <div className="map-container">
            {/* ✅ Static JPG instead of Leaflet map */}
            <img
                src="src/images/1.jpg" // ← make sure this path is correct (see note below)
                alt="Tegeler See Map"
                className="static-map-image"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain', // or 'cover' if you want full fill
                    display: 'block',
                    backgroundColor: '#f1f5f9'
                }}
                // Optional: add click handler (see Bonus below)
                // onClick={handleImageClick}
            />

            {/* Loading indicator */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">Calculating optimal routes...</div>
                </div>
            )}

            {/* Path comparison panel */}
            {calculatedPaths && calculatedPaths.direct.valid && (
                <div className="path-comparison-panel">
                    <h3>🌊 Route Comparison (NDWI-based)</h3>
                    <div className="path-option">
                        <div className="path-color" style={{ backgroundColor: '#6b7280' }}></div>
                        <div className="path-info">
                            <strong>Direct Route:</strong><br />
                            Quality: {calculatedPaths.direct.quality} | Distance: {calculatedPaths.direct.distance.toFixed(4)}
                        </div>
                    </div>
                    <div className="path-option">
                        <div className="path-color" style={{ backgroundColor: getPathColor(calculatedPaths.qualityOptimized.quality) }}></div>
                        <div className="path-info">
                            <strong>Quality Route:</strong><br />
                            Quality: {calculatedPaths.qualityOptimized.quality} | Distance: {calculatedPaths.qualityOptimized.distance.toFixed(4)}
                        </div>
                    </div>
                    <div className="quality-legend">
                        <small>NDWI Quality: 🟢0.5+ 🟡0.3-0.5 🟠0.1-0.3 🔴0-0.1 ⚫Negative</small>
                    </div>
                </div>
            )}

            {/* Click instructions */}
            <div className="click-instructions">
                {clickMessage}
            </div>

            {/* Data points info */}
            <div className="data-points-info" style={{
                position: 'absolute',
                bottom: '60px',
                left: '20px',
                background: 'rgba(255,255,255,0.9)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                zIndex: 1000
            }}>
                {ndwiPoints.length} water data points loaded
            </div>

            {/* Controls & route info (keep as-is) */}
            <div className="map-controls">
                <div className="control-title">Route Visibility</div>
                <div className="control-group">
                    {routeControls}
                </div>
            </div>

            {selectedRoute && (
                <div className="route-info">
                    <div className="route-title">Current Route: {selectedRoute.name}</div>
                    <div className="route-desc">
                        Score: {selectedRoute.score} ({selectedRoute.type})
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;