'use dom';

import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Popup, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create a simple SVG marker icon to avoid CDN dependencies
const createMarkerIcon = (color: string = '#2196F3') => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface LeafletMapViewProps {
  type: 'geopoint' | 'geotrace' | 'geoshape';
  coordinate?: Coordinate;
  coordinates?: Coordinate[];
  name?: string;
}

// Component to set view when map loads
function SetViewOnLoad({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function LeafletMapView({ type, coordinate, coordinates, name }: LeafletMapViewProps) {
  // Calculate center based on data type
  const getCenter = (): [number, number] => {
    if (type === 'geopoint' && coordinate) {
      return [coordinate.latitude, coordinate.longitude];
    }
    if ((type === 'geotrace' || type === 'geoshape') && coordinates && coordinates.length > 0) {
      const latSum = coordinates.reduce((sum, c) => sum + c.latitude, 0);
      const lngSum = coordinates.reduce((sum, c) => sum + c.longitude, 0);
      return [latSum / coordinates.length, lngSum / coordinates.length];
    }
    // Default to a neutral location (center of world map) with lower zoom
    return [20, 0];
  };

  const center = getCenter();
  // Use lower zoom for default location, higher for actual data
  const hasValidData = (type === 'geopoint' && coordinate) || 
    ((type === 'geotrace' || type === 'geoshape') && coordinates && coordinates.length > 0);
  const zoom = hasValidData ? 15 : 2;

  // Convert coordinates to Leaflet format [lat, lng]
  const polylinePositions = coordinates?.map(c => [c.latitude, c.longitude] as [number, number]) || [];

  // Get color based on type
  const getColor = () => {
    switch (type) {
      case 'geopoint': return '#4CAF50';
      case 'geotrace': return '#FF9800';
      case 'geoshape': return '#9C27B0';
      default: return '#2196F3';
    }
  };

  const markerIcon = createMarkerIcon(getColor());

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <style>{`
        .custom-marker-icon {
          background: transparent;
          border: none;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <SetViewOnLoad center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render GeoPoint as marker */}
        {type === 'geopoint' && coordinate && (
          <Marker position={[coordinate.latitude, coordinate.longitude]} icon={markerIcon}>
            <Popup>
              <strong>{name || 'GeoPoint'}</strong><br />
              Lat: {coordinate.latitude.toFixed(6)}<br />
              Lng: {coordinate.longitude.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Render GeoTrace as polyline */}
        {type === 'geotrace' && polylinePositions.length > 0 && (
          <>
            <Polyline 
              positions={polylinePositions} 
              color={getColor()}
              weight={4}
            />
            {/* Add circle markers at start and end */}
            <CircleMarker center={polylinePositions[0]} radius={8} color={getColor()} fillColor="#fff" fillOpacity={1}>
              <Popup>Start Point</Popup>
            </CircleMarker>
            <CircleMarker center={polylinePositions[polylinePositions.length - 1]} radius={8} color={getColor()} fillColor={getColor()} fillOpacity={1}>
              <Popup>End Point</Popup>
            </CircleMarker>
          </>
        )}

        {/* Render GeoShape as polygon */}
        {type === 'geoshape' && polylinePositions.length > 2 && (
          <Polygon 
            positions={polylinePositions}
            color={getColor()}
            fillColor={getColor()}
            fillOpacity={0.3}
            weight={3}
          />
        )}
      </MapContainer>
    </div>
  );
}
