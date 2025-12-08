/**
 * Represents a single geographic coordinate point
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  timestamp?: number;
}

/**
 * GeoPoint - A single geographic location
 */
export interface GeoPoint {
  id: string;
  type: 'geopoint';
  coordinate: Coordinate;
  name?: string;
  description?: string;
  createdAt: string;
}

/**
 * GeoTrace - A line/path represented by multiple coordinates
 */
export interface GeoTrace {
  id: string;
  type: 'geotrace';
  coordinates: Coordinate[];
  name?: string;
  description?: string;
  createdAt: string;
}

/**
 * GeoShape - A polygon/area represented by multiple coordinates (closed path)
 */
export interface GeoShape {
  id: string;
  type: 'geoshape';
  coordinates: Coordinate[];
  name?: string;
  description?: string;
  createdAt: string;
}

/**
 * Union type for all geo data types
 */
export type GeoData = GeoPoint | GeoTrace | GeoShape;

/**
 * Collection of geo data for submission
 */
export interface GeoDataCollection {
  id: string;
  items: GeoData[];
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'synced';
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
