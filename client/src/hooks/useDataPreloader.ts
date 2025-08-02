import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export const useDataPreloader = () => {
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const queryClient = useQueryClient();
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    const preloadCriticalData = async () => {
      try {
        setPreloadProgress(10);
        
        // Preload services data
        await queryClient.prefetchQuery({
          queryKey: ['/api/services'],
          queryFn: async () => {
            const response = await fetch('/api/services');
            if (!response.ok) throw new Error('Failed to fetch services');
            return response.json();
          },
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
        setPreloadProgress(40);

        // Preload reviews data
        await queryClient.prefetchQuery({
          queryKey: ['/api/reviews/all'],
          queryFn: async () => {
            const response = await fetch('/api/reviews/all');
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
          },
          staleTime: 10 * 60 * 1000, // 10 minutes
        });
        setPreloadProgress(70);

        // Preload courses data
        await queryClient.prefetchQuery({
          queryKey: ['/api/courses'],
          queryFn: async () => {
            const response = await fetch('/api/courses');
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
          },
          staleTime: 10 * 60 * 1000, // 10 minutes
        });
        setPreloadProgress(90);

        // Wait for auth to complete
        if (!authLoading) {
          setPreloadProgress(100);
          // Small delay for smooth transition
          setTimeout(() => {
            setIsPreloading(false);
          }, 500);
        }
      } catch (error) {
        console.error('Error preloading data:', error);
        // Continue even if preloading fails
        setPreloadProgress(100);
        setTimeout(() => {
          setIsPreloading(false);
        }, 500);
      }
    };

    preloadCriticalData();
  }, [queryClient, authLoading]);

  // Hide preloader when auth is done and data is preloaded
  useEffect(() => {
    if (!authLoading && preloadProgress >= 100) {
      setTimeout(() => {
        setIsPreloading(false);
      }, 500);
    }
  }, [authLoading, preloadProgress]);

  return {
    isPreloading,
    preloadProgress,
  };
}; 