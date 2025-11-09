import { leaderboardData } from '../data/tegelerSeeRoutes.js';

const InfoPanel = ({ selectedRoute, onRouteVisibilityChange, visibleRoutes }) => {
    const currentScore = selectedRoute?.score || 83;
    const currentType = selectedRoute?.type || 'good';
    const credits = Math.floor(currentScore / 7);

    const getScoreText = (type) => {
        const texts = {
            good: 'Good',
            medium: 'Medium',
            bad: 'Bad'
        };
        return texts[type] || 'Good';
    };

    return (
        <div className="info-panel">
            <div className="score-section">
                <div className="score-value">Your score now : 0 points</div>
            </div>

            <div className="credits-section">
                <div className="credits-value">Create your route</div>
            </div>

            <div className="panel-section">
                <div className="section-title">Route Legend</div>
                <div className="legend-item">
                    <div className="color-box good"></div>
                    <div>Good (80-100) - Minimal Impact</div>
                </div>
                <div className="legend-item">
                    <div className="color-box medium"></div>
                    <div>Medium (60-79) - Moderate Impact</div>
                </div>
                <div className="legend-item">
                    <div className="color-box bad"></div>
                    <div>Bad (0-59) - High Impact</div>
                </div>
            </div>

            <div className="leaderboard-container">
                <div className="section-title">Route Leaderboard</div>

                {/* Header Row */}
                <div className="leaderboard-header">
                    <div className="rank">Rank</div>
                    <div className="boat-id">Boat ID</div>
                    <div className="strategy">Strategy</div>
                    <div className="total-score">Total Score</div>
                    <div className="total-distance">Total Distance (deg)</div>
                    <div className="average-ndwi">Average NDWI</div>
                    <div className="steps-taken">Steps Taken</div>
                    <div className="finished">Finished</div>
                </div>

                {/* Data Rows */}
                {leaderboardData.map(item => (
                    <div key={item.rank} className="leaderboard-item">
                        <div className="rank">{item.rank}</div>
                        <div className="boat-id">{item.boatId}</div>
                        <div className="strategy">{item.strategy}</div>
                        <div className="total-score">{item.totalScore.toFixed(2)}</div>
                        <div className="total-distance">{item.totalDistance.toFixed(2)}</div>
                        <div className="average-ndwi">{item.averageNDWI.toFixed(2)}</div>
                        <div className="steps-taken">{item.stepsTaken}</div>
                        <div className="finished">{item.finished ? 'True' : 'False'}</div>
                    </div>
                ))}
            </div>

            <div className="explanation">
                Score is computed from Copernicus NDWI + waterway sensitivity analysis.
                Higher scores indicate lower environmental impact.
            </div>

            <div className="bottom-right-logo">
                <img src="src/images/logo.png" alt="Sponsor / App Logo"/>
            </div>

            <div className="footer">
                Powered by Copernicus + OSM | Race_Publica
            </div>
        </div>
    );
};

export default InfoPanel;