// src/utils/ndwiPathFinder.js

let ndwiData = null;
let ndwiPoints = [];

// Load your NDWI data
export const loadNDWIData = async () => {
    if (ndwiData) return ndwiData;

    try {
        const response = await import('../data/ndwi_pixels_water.json');
        ndwiData = response.default;

        // Extract all NDWI points for quick access
        ndwiPoints = [];
        if (ndwiData && ndwiData.features) {
            ndwiData.features.forEach(feature => {
                if (feature.geometry.type === 'Point') {
                    const [lng, lat] = feature.geometry.coordinates;
                    const ndwiValue = feature.properties.NDWI;
                    ndwiPoints.push({
                        lng,
                        lat,
                        ndwi: ndwiValue,
                        quality: ndwiToQuality(ndwiValue)
                    });
                }
            });
        }

        console.log(`Loaded ${ndwiPoints.length} NDWI data points`);
        return ndwiData;
    } catch (error) {
        console.error('Failed to load NDWI data:', error);
        return null;
    }
};

// Get all NDWI points for the map
export const getNDWIPoints = () => {
    return ndwiPoints;
};

// Find the nearest NDWI point to a given coordinate
export const findNearestNDWIPoint = (lng, lat, maxDistance = 0.01) => {
    if (ndwiPoints.length === 0) return null;

    let nearestPoint = null;
    let minDistance = Infinity;

    ndwiPoints.forEach(point => {
        const distance = Math.sqrt(Math.pow(lng - point.lng, 2) + Math.pow(lat - point.lat, 2));
        if (distance < minDistance && distance < maxDistance) {
            minDistance = distance;
            nearestPoint = point;
        }
    });

    return nearestPoint;
};

// Check if a point is valid (has nearby NDWI data)
export const isValidPoint = (lng, lat) => {
    return findNearestNDWIPoint(lng, lat) !== null;
};

// Convert NDWI value to water quality score (0-100)
const ndwiToQuality = (ndwi) => {
    // NDWI ranges from -1 to 1
    // Negative values: non-water (very poor)
    // 0 to 1: water, higher is better
    if (ndwi < 0) return 10; // Very poor - not really water
    if (ndwi < 0.1) return 30; // Poor water quality
    if (ndwi < 0.3) return 60; // Moderate
    if (ndwi < 0.5) return 80; // Good
    return 95; // Excellent
};

// Get water quality at any point by finding nearest NDWI measurements
export const getWaterQualityFromNDWI = (lng, lat) => {
    const nearestPoint = findNearestNDWIPoint(lng, lat);
    return nearestPoint ? nearestPoint.quality : null;
};

// A* pathfinding using only NDWI data points
export const findOptimalPathsWithNDWI = (startPoint, endPoint) => {
    if (!startPoint || !endPoint) return null;

    console.log('Finding paths between:', startPoint, 'and', endPoint);

    // Generate paths that only go through NDWI points
    const path1 = generateDirectPathThroughNDWI(startPoint, endPoint);
    const path2 = generateQualityPathThroughNDWI(startPoint, endPoint);

    return {
        direct: calculatePathScore(path1),
        qualityOptimized: calculatePathScore(path2)
    };
};

// Generate path that goes through nearest NDWI points
const generateDirectPathThroughNDWI = (start, end) => {
    const path = [start];

    // Find intermediate NDWI points along the way
    const intermediatePoints = findIntermediateNDWIPoints(start, end, 5);
    path.push(...intermediatePoints);

    path.push(end);
    return path;
};

// Generate path that maximizes water quality using NDWI points
const generateQualityPathThroughNDWI = (start, end) => {
    const path = [start];

    // Find high-quality intermediate points
    const qualityPoints = findHighQualityNDWIPoints(start, end, 8);
    path.push(...qualityPoints);

    path.push(end);
    return path;
};

// Find NDWI points between start and end
const findIntermediateNDWIPoints = (start, end, maxPoints = 5) => {
    const points = [];
    const [startLng, startLat] = start;
    const [endLng, endLat] = end;

    // Calculate direction vector
    const dirLng = endLng - startLng;
    const dirLat = endLat - startLat;
    const length = Math.sqrt(dirLng * dirLng + dirLat * dirLat);

    const normalizedDirLng = dirLng / length;
    const normalizedDirLat = dirLat / length;

    // Find points along the path
    for (let i = 1; i <= maxPoints; i++) {
        const t = i / (maxPoints + 1);
        const targetLng = startLng + dirLng * t;
        const targetLat = startLat + dirLat * t;

        // Find nearest NDWI point to this target
        const nearest = findNearestNDWIPoint(targetLng, targetLat, 0.02);
        if (nearest && !points.some(p => p[0] === nearest.lng && p[1] === nearest.lat)) {
            points.push([nearest.lng, nearest.lat]);
        }
    }

    return points;
};

// Find high-quality NDWI points between start and end
const findHighQualityNDWIPoints = (start, end, maxPoints = 8) => {
    const [startLng, startLat] = start;
    const [endLng, endLat] = end;

    // Get all NDWI points in the general area between start and end
    const candidates = ndwiPoints.filter(point => {
        // Check if point is roughly between start and end
        const isBetween = isPointBetween(point, start, end);
        return isBetween && point.quality >= 60; // Only consider decent quality points
    });

    // Sort by quality (highest first) and take the best ones
    const sortedCandidates = candidates
        .sort((a, b) => b.quality - a.quality)
        .slice(0, maxPoints)
        .sort((a, b) => {
            // Sort by distance from start to maintain order
            const distA = distance(start, [a.lng, a.lat]);
            const distB = distance(start, [b.lng, b.lat]);
            return distA - distB;
        });

    return sortedCandidates.map(point => [point.lng, point.lat]);
};

// Check if a point is between start and end
const isPointBetween = (point, start, end) => {
    const [startLng, startLat] = start;
    const [endLng, endLat] = end;

    // Simple bounding box check
    const minLng = Math.min(startLng, endLng) - 0.01;
    const maxLng = Math.max(startLng, endLng) + 0.01;
    const minLat = Math.min(startLat, endLat) - 0.01;
    const maxLat = Math.max(startLat, endLat) + 0.01;

    return point.lng >= minLng && point.lng <= maxLng &&
        point.lat >= minLat && point.lat <= maxLat;
};

const calculatePathScore = (path) => {
    if (path.length < 2) {
        return {
            path: [],
            quality: 0,
            distance: 0,
            score: 0,
            valid: false
        };
    }

    let totalQuality = 0;
    let totalDistance = 0;
    let validPoints = 0;

    for (let i = 1; i < path.length; i++) {
        const quality = getWaterQualityFromNDWI(path[i][0], path[i][1]);
        if (quality !== null) {
            totalQuality += quality;
            validPoints++;
        }
        totalDistance += distance(path[i-1], path[i]);
    }

    const avgQuality = validPoints > 0 ? totalQuality / validPoints : 0;
    const score = Math.round(avgQuality * 0.8 - totalDistance * 1000);

    return {
        path,
        quality: Math.round(avgQuality),
        distance: totalDistance,
        score: Math.max(0, score),
        valid: validPoints > 0
    };
};

const distance = (point1, point2) => {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
};