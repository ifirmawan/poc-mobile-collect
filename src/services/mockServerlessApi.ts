/**
 * Mock Serverless Backend API
 * 
 * This file simulates a serverless backend for the mobile data collection app.
 * In a real application, this would be replaced with actual API calls to a
 * serverless backend like AWS Lambda, Google Cloud Functions, or Azure Functions.
 * 
 * API Endpoints (simulated):
 * - POST /api/collections - Submit a new geo data collection
 * - GET /api/collections - Get all submitted collections
 * - GET /api/collections/:id - Get a specific collection by ID
 * - DELETE /api/collections/:id - Delete a collection
 * - POST /api/collections/:id/sync - Sync a collection
 */

import { v4 as uuidv4 } from 'uuid';
import { GeoData, GeoDataCollection, ApiResponse } from '../types';

// Simulated database storage
interface MockDatabase {
  collections: Map<string, GeoDataCollection>;
}

const mockDB: MockDatabase = {
  collections: new Map(),
};

// Simulated network conditions
interface NetworkConfig {
  latencyMs: number;
  failureRate: number; // 0-1, probability of random failure
  isOnline: boolean;
}

let networkConfig: NetworkConfig = {
  latencyMs: 300,
  failureRate: 0,
  isOnline: true,
};

/**
 * Simulates network latency and potential failures
 */
async function simulateNetwork(): Promise<void> {
  // Add latency
  await new Promise(resolve => setTimeout(resolve, networkConfig.latencyMs));
  
  // Simulate offline state
  if (!networkConfig.isOnline) {
    throw new Error('Network Error: Device is offline');
  }
  
  // Simulate random failures
  if (Math.random() < networkConfig.failureRate) {
    throw new Error('Network Error: Request failed');
  }
}

/**
 * Mock Serverless API Handler
 */
export const MockServerlessAPI = {
  /**
   * POST /api/collections
   * Submit a new geo data collection
   */
  async createCollection(items: GeoData[]): Promise<ApiResponse<GeoDataCollection>> {
    try {
      await simulateNetwork();

      // Deep copy items to avoid unintended mutations of nested objects
      const deepCopiedItems = JSON.parse(JSON.stringify(items)) as GeoData[];

      const collection: GeoDataCollection = {
        id: uuidv4(),
        items: deepCopiedItems,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      };

      mockDB.collections.set(collection.id, collection);

      console.log(`[Mock API] Collection created: ${collection.id}`);
      console.log(`[Mock API] Items count: ${items.length}`);
      console.log(`[Mock API] Items breakdown:`, {
        geopoints: items.filter(i => i.type === 'geopoint').length,
        geotraces: items.filter(i => i.type === 'geotrace').length,
        geoshapes: items.filter(i => i.type === 'geoshape').length,
      });

      return {
        success: true,
        data: collection,
        message: 'Collection submitted successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Mock API] Error creating collection: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * GET /api/collections
   * Get all submitted collections
   */
  async listCollections(): Promise<ApiResponse<GeoDataCollection[]>> {
    try {
      await simulateNetwork();

      const collections = Array.from(mockDB.collections.values());
      
      console.log(`[Mock API] Listing ${collections.length} collections`);

      return {
        success: true,
        data: collections,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Mock API] Error listing collections: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * GET /api/collections/:id
   * Get a specific collection by ID
   */
  async getCollection(id: string): Promise<ApiResponse<GeoDataCollection | null>> {
    try {
      await simulateNetwork();

      const collection = mockDB.collections.get(id);
      
      if (!collection) {
        console.log(`[Mock API] Collection not found: ${id}`);
        return {
          success: false,
          error: 'Collection not found',
        };
      }

      console.log(`[Mock API] Retrieved collection: ${id}`);

      return {
        success: true,
        data: collection,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Mock API] Error getting collection: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * DELETE /api/collections/:id
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<ApiResponse<void>> {
    try {
      await simulateNetwork();

      if (!mockDB.collections.has(id)) {
        console.log(`[Mock API] Collection not found for deletion: ${id}`);
        return {
          success: false,
          error: 'Collection not found',
        };
      }

      mockDB.collections.delete(id);
      console.log(`[Mock API] Deleted collection: ${id}`);

      return {
        success: true,
        message: 'Collection deleted successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Mock API] Error deleting collection: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * POST /api/collections/:id/sync
   * Sync a collection (mark as synced)
   */
  async syncCollection(id: string): Promise<ApiResponse<GeoDataCollection>> {
    try {
      await simulateNetwork();

      const collection = mockDB.collections.get(id);
      
      if (!collection) {
        console.log(`[Mock API] Collection not found for sync: ${id}`);
        return {
          success: false,
          error: 'Collection not found',
        };
      }

      collection.status = 'synced';
      mockDB.collections.set(id, collection);
      
      console.log(`[Mock API] Synced collection: ${id}`);

      return {
        success: true,
        data: collection,
        message: 'Collection synced successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Mock API] Error syncing collection: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  },

  // ============ Utility Methods ============

  /**
   * Configure network simulation
   */
  configureNetwork(config: Partial<NetworkConfig>): void {
    networkConfig = { ...networkConfig, ...config };
    console.log('[Mock API] Network config updated:', networkConfig);
  },

  /**
   * Get current network configuration
   */
  getNetworkConfig(): NetworkConfig {
    return { ...networkConfig };
  },

  /**
   * Set online/offline state
   */
  setOnline(online: boolean): void {
    networkConfig.isOnline = online;
    console.log(`[Mock API] Network ${online ? 'online' : 'offline'}`);
  },

  /**
   * Clear all stored data (for testing)
   */
  clearAllData(): void {
    mockDB.collections.clear();
    console.log('[Mock API] All data cleared');
  },

  /**
   * Get statistics about stored data
   */
  getStats(): {
    totalCollections: number;
    totalItems: number;
    itemsByType: Record<string, number>;
    collectionsByStatus: Record<string, number>;
  } {
    const collections = Array.from(mockDB.collections.values());
    const items = collections.flatMap(c => c.items);
    
    return {
      totalCollections: collections.length,
      totalItems: items.length,
      itemsByType: items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      collectionsByStatus: collections.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
};

export default MockServerlessAPI;
