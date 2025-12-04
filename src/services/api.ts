import { v4 as uuidv4 } from 'uuid';
import { GeoData, GeoDataCollection, ApiResponse } from '../types';

// Mock API base URL - in a real app, this would be an environment variable
const API_BASE_URL = 'https://api.poc-mobile-collect.mock';

// In-memory storage for mock data (simulating serverless backend)
let mockStorage: GeoDataCollection[] = [];

/**
 * Simulates network delay for realistic mock behavior
 */
const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mock API service for geo data operations
 */
export const ApiService = {
  /**
   * Submit geo data collection to the mock backend
   */
  async submitGeoData(items: GeoData[]): Promise<ApiResponse<GeoDataCollection>> {
    await simulateNetworkDelay();

    try {
      const collection: GeoDataCollection = {
        id: uuidv4(),
        items,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      };

      mockStorage.push(collection);

      console.log('Mock API: Data submitted successfully', collection);

      return {
        success: true,
        data: collection,
        message: 'Data submitted successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get all submitted geo data collections
   */
  async getSubmittedData(): Promise<ApiResponse<GeoDataCollection[]>> {
    await simulateNetworkDelay();

    try {
      return {
        success: true,
        data: [...mockStorage],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get a specific geo data collection by ID
   */
  async getCollectionById(id: string): Promise<ApiResponse<GeoDataCollection | null>> {
    await simulateNetworkDelay();

    try {
      const collection = mockStorage.find(c => c.id === id);
      return {
        success: true,
        data: collection || null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Delete a geo data collection by ID
   */
  async deleteCollection(id: string): Promise<ApiResponse<boolean>> {
    await simulateNetworkDelay();

    try {
      const index = mockStorage.findIndex(c => c.id === id);
      if (index !== -1) {
        mockStorage.splice(index, 1);
        return {
          success: true,
          data: true,
          message: 'Collection deleted successfully',
        };
      }
      return {
        success: false,
        error: 'Collection not found',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Sync local data with the mock backend (mark as synced)
   */
  async syncData(collectionId: string): Promise<ApiResponse<GeoDataCollection | null>> {
    await simulateNetworkDelay(800);

    try {
      const collection = mockStorage.find(c => c.id === collectionId);
      if (collection) {
        collection.status = 'synced';
        return {
          success: true,
          data: collection,
          message: 'Data synced successfully',
        };
      }
      return {
        success: false,
        error: 'Collection not found',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Clear all mock storage (for testing purposes)
   */
  clearMockStorage(): void {
    mockStorage = [];
  },

  /**
   * Get mock API endpoint info
   */
  getApiInfo(): { baseUrl: string; version: string; endpoints: string[] } {
    return {
      baseUrl: API_BASE_URL,
      version: '1.0.0',
      endpoints: [
        'POST /submit - Submit geo data collection',
        'GET /collections - Get all submitted collections',
        'GET /collections/:id - Get specific collection',
        'DELETE /collections/:id - Delete collection',
        'POST /sync/:id - Sync collection',
      ],
    };
  },
};

export default ApiService;
