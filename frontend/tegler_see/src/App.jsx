// src/App.jsx
import { useState } from 'react';
import MapComponent from './components/MapComponent';
import InfoPanel from './components/InfoPanel';
import RouteControls from './components/RouteControls';
import { waterways, leaderboardData } from './data/tegelerSeeRoutes'; // ← CHANGED
import './App.css';

function App() {
    const [selectedRoute, setSelectedRoute] = useState(waterways[0]);
    const [visibleRoutes, setVisibleRoutes] = useState({
        good: true,
        medium: true,
        bad: true
    });

    const handleRouteSelect = (route) => {
        setSelectedRoute(route);
    };

    const handleRouteVisibilityChange = (type) => {
        setVisibleRoutes(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    return (
        <>
            <div className="header">
                <h1>Tegeler See Waterway Impact Assessment</h1>
                <p>Evaluating ecological sensitivity of routes around Berlin's Tegeler See</p>
            </div>

            <div className="container">
                <MapComponent
                    waterways={waterways}
                    selectedRoute={selectedRoute}
                    onRouteSelect={handleRouteSelect}
                    visibleRoutes={visibleRoutes}
                    routeControls={
                        <RouteControls
                            visibleRoutes={visibleRoutes}
                            onRouteVisibilityChange={handleRouteVisibilityChange}
                        />
                    }
                />

                <InfoPanel
                    selectedRoute={selectedRoute}
                    onRouteVisibilityChange={handleRouteVisibilityChange}
                    visibleRoutes={visibleRoutes}
                />
            </div>
        </>
    );
}

export default App;
