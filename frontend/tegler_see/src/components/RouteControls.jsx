// src/components/RouteControls.jsx
const RouteControls = ({ visibleRoutes, onRouteVisibilityChange }) => {
    return (
        <>
            <div className="checkbox">
                <input
                    type="checkbox"
                    id="good-routes"
                    checked={visibleRoutes.good}
                    onChange={() => onRouteVisibilityChange('good')}
                />
                <label htmlFor="good-routes">Good Routes (80-100)</label>
            </div>
            <div className="checkbox">
                <input
                    type="checkbox"
                    id="medium-routes"
                    checked={visibleRoutes.medium}
                    onChange={() => onRouteVisibilityChange('medium')}
                />
                <label htmlFor="medium-routes">Medium Routes (60-79)</label>
            </div>
            <div className="checkbox">
                <input
                    type="checkbox"
                    id="bad-routes"
                    checked={visibleRoutes.bad}
                    onChange={() => onRouteVisibilityChange('bad')}
                />
                <label htmlFor="bad-routes">Bad Routes (0-59)</label>
            </div>
        </>
    );
};

export default RouteControls;