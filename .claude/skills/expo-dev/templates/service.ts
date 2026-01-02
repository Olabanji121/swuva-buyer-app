/**
 * API Service Template
 *
 * Usage: Copy and adapt for API service modules
 * Location: src/features/{feature}/services/
 */

import { api } from '@/lib/api';
import type {
  FeatureItem,
  FeatureListParams,
  FeatureListResponse,
  CreateFeatureInput,
  UpdateFeatureInput,
} from '../types';

/**
 * Feature Service
 *
 * Handles all API calls for the feature.
 * Each method returns the data directly (unwrapped from response).
 */
export const featureService = {
  /**
   * Get paginated list of items
   */
  getList: async (params: FeatureListParams = {}): Promise<FeatureListResponse> => {
    const { data } = await api.get<{ data: FeatureListResponse }>('/feature', {
      params: {
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
        sortBy: params.sortBy ?? 'createdAt',
        sortOrder: params.sortOrder ?? 'desc',
        ...params.filters,
      },
    });
    return data.data;
  },

  /**
   * Get single item by ID
   */
  getById: async (id: string): Promise<FeatureItem> => {
    const { data } = await api.get<{ data: FeatureItem }>(`/feature/${id}`);
    return data.data;
  },

  /**
   * Create new item
   */
  create: async (input: CreateFeatureInput): Promise<FeatureItem> => {
    const { data } = await api.post<{ data: FeatureItem }>('/feature', input);
    return data.data;
  },

  /**
   * Update existing item
   */
  update: async (id: string, input: UpdateFeatureInput): Promise<FeatureItem> => {
    const { data } = await api.patch<{ data: FeatureItem }>(`/feature/${id}`, input);
    return data.data;
  },

  /**
   * Delete item
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/feature/${id}`);
  },

  /**
   * Search items
   */
  search: async (query: string, filters?: Record<string, unknown>): Promise<FeatureItem[]> => {
    const { data } = await api.get<{ data: FeatureItem[] }>('/feature/search', {
      params: { q: query, ...filters },
    });
    return data.data;
  },

  /**
   * Batch operations
   */
  batchUpdate: async (
    updates: Array<{ id: string; data: UpdateFeatureInput }>
  ): Promise<FeatureItem[]> => {
    const { data } = await api.post<{ data: FeatureItem[] }>('/feature/batch', {
      updates,
    });
    return data.data;
  },

  /**
   * Upload file/image
   */
  uploadImage: async (id: string, file: FormData): Promise<{ url: string }> => {
    const { data } = await api.post<{ data: { url: string } }>(
      `/feature/${id}/image`,
      file,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data.data;
  },
};

/**
 * Types for the service
 * Location: src/features/{feature}/types.ts
 */

// Re-export for convenience (actual types in types.ts)
export interface FeatureItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface FeatureListParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface FeatureListResponse {
  items: FeatureItem[];
  total: number;
  hasMore: boolean;
}

export interface CreateFeatureInput {
  name: string;
  description?: string;
}

export interface UpdateFeatureInput {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}
