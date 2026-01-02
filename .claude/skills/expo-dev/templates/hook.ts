/**
 * TanStack Query Hook Template
 *
 * Usage: Copy and adapt for data fetching hooks
 * Location: src/features/{feature}/hooks/
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureService } from '../services/feature.service';
import type { FeatureItem, CreateFeatureInput, UpdateFeatureInput } from '../types';

// Query keys factory (for consistent cache management)
export const featureKeys = {
  all: ['feature'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...featureKeys.lists(), filters] as const,
  details: () => [...featureKeys.all, 'detail'] as const,
  detail: (id: string) => [...featureKeys.details(), id] as const,
};

/**
 * Fetch list of items with optional filters
 */
interface UseFeatureListOptions {
  filters?: Record<string, unknown>;
  enabled?: boolean;
}

export function useFeatureList(options: UseFeatureListOptions = {}) {
  const { filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: featureKeys.list(filters),
    queryFn: () => featureService.getList(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Fetch single item by ID
 */
export function useFeatureDetail(id: string | undefined) {
  return useQuery({
    queryKey: featureKeys.detail(id!),
    queryFn: () => featureService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create new item
 */
export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFeatureInput) => featureService.create(input),
    onSuccess: (newItem) => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });

      // Optionally set the new item in cache
      queryClient.setQueryData(featureKeys.detail(newItem.id), newItem);
    },
    onError: (error) => {
      console.error('Failed to create:', error);
    },
  });
}

/**
 * Update existing item
 */
export function useUpdateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateFeatureInput & { id: string }) =>
      featureService.update(id, input),
    onSuccess: (updatedItem, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(featureKeys.detail(id), updatedItem);

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
  });
}

/**
 * Delete item
 */
export function useDeleteFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => featureService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: featureKeys.detail(id) });

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
  });
}

/**
 * Optimistic update example
 */
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateFeatureInput & { id: string }) =>
      featureService.update(id, input),

    // Optimistically update before server responds
    onMutate: async ({ id, ...newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: featureKeys.detail(id) });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<FeatureItem>(
        featureKeys.detail(id)
      );

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData(featureKeys.detail(id), {
          ...previousData,
          ...newData,
        });
      }

      return { previousData };
    },

    // Rollback on error
    onError: (err, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(featureKeys.detail(id), context.previousData);
      }
    },

    // Always refetch after error or success
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: featureKeys.detail(id) });
    },
  });
}
