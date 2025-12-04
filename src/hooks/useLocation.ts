import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types';

interface LocationState {
  coordinate: Coordinate | null;
  error: string | null;
  loading: boolean;
  hasPermission: boolean | null;
}

interface UseLocationReturn extends LocationState {
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Coordinate | null>;
}

export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<LocationState>({
    coordinate: null,
    error: null,
    loading: false,
    hasPermission: null,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      setState(prev => ({ ...prev, hasPermission }));
      return hasPermission;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to request location permission',
        hasPermission: false,
      }));
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<Coordinate | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (!state.hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Location permission denied',
          }));
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coordinate: Coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      setState(prev => ({
        ...prev,
        coordinate,
        loading: false,
        error: null,
      }));

      return coordinate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [state.hasPermission, requestPermission]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    ...state,
    requestPermission,
    getCurrentLocation,
  };
}

interface UseLocationTrackingReturn {
  coordinates: Coordinate[];
  isTracking: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  clearCoordinates: () => void;
}

export function useLocationTracking(): UseLocationTrackingReturn {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const startTracking = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      setIsTracking(true);
      // Clear previous coordinates when starting a new tracking session
      // Users should save their trace/shape before starting a new one
      setCoordinates([]);

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (location) => {
          const newCoordinate: Coordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          setCoordinates(prev => [...prev, newCoordinate]);
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start tracking';
      setError(errorMessage);
      setIsTracking(false);
    }
  }, []);

  const stopTracking = useCallback((): void => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const clearCoordinates = useCallback((): void => {
    setCoordinates([]);
  }, []);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  return {
    coordinates,
    isTracking,
    error,
    startTracking,
    stopTracking,
    clearCoordinates,
  };
}
