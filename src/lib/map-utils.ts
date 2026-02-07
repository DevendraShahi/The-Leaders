
export type Coordinate = [number, number]; // [lon, lat]
export type Position = Coordinate;
export type Polygon = Position[];
export type MultiPolygon = Polygon[];

export interface GeoJSONFeature {
    type: "Feature";
    properties: any;
    geometry: {
        type: "Polygon" | "MultiPolygon";
        coordinates: Polygon[] | MultiPolygon[];
    };
}

export interface GeoJSON {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

// Bounding Box for Nepal
const BOUNDS = {
    minLon: 80.0,
    maxLon: 88.3,
    minLat: 26.3,
    maxLat: 30.6,
};

const WIDTH = 1000;
const HEIGHT = 500;

// Simple Equirectangular Projection
export function projectPoint(lon: number, lat: number): [number, number] {
    const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * WIDTH;
    const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * HEIGHT;
    return [x, y];
}

export function geoJsonToPath(geometry: any): string {
    if (!geometry) return "";

    if (geometry.type === "Polygon") {
        return polygonToPath(geometry.coordinates as Polygon[]);
    } else if (geometry.type === "MultiPolygon") {
        return (geometry.coordinates as MultiPolygon[]).map(poly => polygonToPath(poly)).join(" ");
    }
    return "";
}

function polygonToPath(rings: Position[][]): string {
    return rings.map(ring => {
        if (!ring || ring.length === 0) return "";
        const points = ring.map(pos => {
            const [x, y] = projectPoint(pos[0], pos[1]);
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        });
        return "M" + points.join("L") + "Z";
    }).join(" ");
}

// Calculate Centroid for Label Placement
export function calculateGeoJsonCentroid(geometry: any): [number, number] | null {
    if (!geometry) return null;

    let points: Position[] = [];

    // Flatten coordinates to just a list of points
    // For MultiPolygon, ideally we take the largest polygon, but average is okay for now
    if (geometry.type === "Polygon") {
        points = geometry.coordinates[0]; // Outer ring
    } else if (geometry.type === "MultiPolygon") {
        // Find the polygon with the most points (heuristic for largest area)
        let maxPoints = 0;
        let largestPoly: Position[] = [];
        (geometry.coordinates as MultiPolygon[]).forEach(poly => {
            if (poly[0].length > maxPoints) {
                maxPoints = poly[0].length;
                largestPoly = poly[0];
            }
        });
        points = largestPoly;
    }

    if (!points || points.length === 0) return null;

    // Calculate average
    let xSum = 0;
    let ySum = 0;
    points.forEach(p => {
        xSum += p[0];
        ySum += p[1];
    });

    const centerLon = xSum / points.length;
    const centerLat = ySum / points.length;

    return projectPoint(centerLon, centerLat);
}

export const MAP_DIMENSIONS = { width: WIDTH, height: HEIGHT };
