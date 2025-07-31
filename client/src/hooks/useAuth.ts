import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { useEffect } from "react";

// Token storage utilities
const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

const setStoredToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

const removeStoredToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Check for token in URL (from Google OAuth)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      console.log('Token found in URL, storing...');
      setStoredToken(token);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  }, [queryClient]);

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const token = getStoredToken();
        if (!token) {
          return null;
        }

        const response = await fetch("/api/auth/user", {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.status === 401) {
          removeStoredToken();
          return null;
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        removeStoredToken();
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await response.json();
      
      // Store token
      if (data.token) {
        setStoredToken(data.token);
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Обновляем данные пользователя в кэше
      queryClient.setQueryData(["/api/auth/user"], data.user);
      // Принудительно обновляем запрос для синхронизации состояния
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { 
      email: string; 
      password: string; 
      firstName?: string; 
      lastName?: string; 
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const data = await response.json();
      
      // Store token
      if (data.token) {
        setStoredToken(data.token);
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Обновляем данные пользователя в кэше
      queryClient.setQueryData(["/api/auth/user"], data.user);
      // Принудительно обновляем запрос для синхронизации состояния
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error('Register mutation error:', error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      removeStoredToken();
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear(); // Clear all cache
      setLocation("/login", { replace: true });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}