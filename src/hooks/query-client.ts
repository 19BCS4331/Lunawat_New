import { QueryClient, QueryCache } from '@tanstack/react-query';
import { handleApiError } from '@/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      const apiError = handleApiError(error);
      console.error('Query error:', apiError);
      
      // Handle token expiry globally
      if (apiError.code === 'INVALID_TOKEN') {
        // Navigate to login - this would be handled by a navigation service
        console.warn('Token expired, redirecting to login');
      }
    },
  }),
});
