import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GeoData, GeoPoint, GeoTrace, GeoShape, Coordinate } from '../types';
import { ApiService } from '../services/api';

interface GeoDataState {
  collectedData: GeoData[];
  isSubmitting: boolean;
  error: string | null;
  lastSubmissionId: string | null;
}

type GeoDataAction =
  | { type: 'ADD_GEOPOINT'; payload: { coordinate: Coordinate; name?: string; description?: string } }
  | { type: 'ADD_GEOTRACE'; payload: { coordinates: Coordinate[]; name?: string; description?: string } }
  | { type: 'ADD_GEOSHAPE'; payload: { coordinates: Coordinate[]; name?: string; description?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: string }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: GeoDataState = {
  collectedData: [],
  isSubmitting: false,
  error: null,
  lastSubmissionId: null,
};

function geoDataReducer(state: GeoDataState, action: GeoDataAction): GeoDataState {
  switch (action.type) {
    case 'ADD_GEOPOINT': {
      const newGeoPoint: GeoPoint = {
        id: uuidv4(),
        type: 'geopoint',
        coordinate: action.payload.coordinate,
        name: action.payload.name,
        description: action.payload.description,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        collectedData: [...state.collectedData, newGeoPoint],
      };
    }
    case 'ADD_GEOTRACE': {
      const newGeoTrace: GeoTrace = {
        id: uuidv4(),
        type: 'geotrace',
        coordinates: action.payload.coordinates,
        name: action.payload.name,
        description: action.payload.description,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        collectedData: [...state.collectedData, newGeoTrace],
      };
    }
    case 'ADD_GEOSHAPE': {
      const newGeoShape: GeoShape = {
        id: uuidv4(),
        type: 'geoshape',
        coordinates: action.payload.coordinates,
        name: action.payload.name,
        description: action.payload.description,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        collectedData: [...state.collectedData, newGeoShape],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        collectedData: state.collectedData.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        collectedData: [],
        lastSubmissionId: null,
      };
    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true,
        error: null,
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        collectedData: [],
        lastSubmissionId: action.payload,
      };
    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface GeoDataContextType extends GeoDataState {
  addGeoPoint: (coordinate: Coordinate, name?: string, description?: string) => void;
  addGeoTrace: (coordinates: Coordinate[], name?: string, description?: string) => void;
  addGeoShape: (coordinates: Coordinate[], name?: string, description?: string) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  submitData: () => Promise<boolean>;
  clearError: () => void;
}

const GeoDataContext = createContext<GeoDataContextType | undefined>(undefined);

interface GeoDataProviderProps {
  children: ReactNode;
}

export function GeoDataProvider({ children }: GeoDataProviderProps) {
  const [state, dispatch] = useReducer(geoDataReducer, initialState);

  const addGeoPoint = useCallback((coordinate: Coordinate, name?: string, description?: string) => {
    dispatch({ type: 'ADD_GEOPOINT', payload: { coordinate, name, description } });
  }, []);

  const addGeoTrace = useCallback((coordinates: Coordinate[], name?: string, description?: string) => {
    dispatch({ type: 'ADD_GEOTRACE', payload: { coordinates, name, description } });
  }, []);

  const addGeoShape = useCallback((coordinates: Coordinate[], name?: string, description?: string) => {
    dispatch({ type: 'ADD_GEOSHAPE', payload: { coordinates, name, description } });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const submitData = useCallback(async (): Promise<boolean> => {
    if (state.collectedData.length === 0) {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'No data to submit' });
      return false;
    }

    dispatch({ type: 'SUBMIT_START' });

    try {
      const response = await ApiService.submitGeoData(state.collectedData);
      
      if (response.success && response.data) {
        dispatch({ type: 'SUBMIT_SUCCESS', payload: response.data.id });
        return true;
      } else {
        dispatch({ type: 'SUBMIT_ERROR', payload: response.error || 'Submission failed' });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'SUBMIT_ERROR', payload: errorMessage });
      return false;
    }
  }, [state.collectedData]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: GeoDataContextType = {
    ...state,
    addGeoPoint,
    addGeoTrace,
    addGeoShape,
    removeItem,
    clearAll,
    submitData,
    clearError,
  };

  return (
    <GeoDataContext.Provider value={value}>
      {children}
    </GeoDataContext.Provider>
  );
}

export function useGeoData(): GeoDataContextType {
  const context = useContext(GeoDataContext);
  if (context === undefined) {
    throw new Error('useGeoData must be used within a GeoDataProvider');
  }
  return context;
}
