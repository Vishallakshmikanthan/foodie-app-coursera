import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter as useExpoRouter, useLocalSearchParams as useExpoLocalSearchParams, usePathname as useExpoPathname } from 'expo-router';

export interface AppNavRoute {
  pathname: string;
  params?: Record<string, any>;
}

export interface AppRouterType {
  push: (route: string | AppNavRoute) => void;
  navigate: (route: string | AppNavRoute) => void;
  replace: (route: string | AppNavRoute) => void;
  back: () => void;
  canGoBack: () => boolean;
  pathname: string;
  params: Record<string, any>;
}

export const AppNavigationContext = createContext<AppRouterType | null>(null);

const TAB_ROUTES = new Set(['/', '/index', '/explore', '/favorites', '/my-food']);

export const AppNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<AppNavRoute[]>([{ pathname: '/' }]);

  const currentRoute = history[history.length - 1] || { pathname: '/' };

  const parseRoute = (route: string | AppNavRoute): AppNavRoute => {
    if (typeof route === 'string') {
      if (route.startsWith('/recipe/')) {
        const id = route.replace('/recipe/', '');
        return { pathname: '/recipe', params: { id } };
      }
      if (route.startsWith('/cook/')) {
        const id = route.replace('/cook/', '');
        return { pathname: '/cook', params: { id } };
      }
      if (route.includes('?')) {
        const [path, queryString] = route.split('?');
        const params: Record<string, string> = {};
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((val, key) => {
          params[key] = val;
        });
        return { pathname: path, params };
      }
      return { pathname: route };
    }
    return route;
  };

  const navigate = useCallback((route: string | AppNavRoute) => {
    const parsed = parseRoute(route);
    const isTab = TAB_ROUTES.has(parsed.pathname);

    setHistory((prev) => {
      const current = prev[prev.length - 1];
      // If switching between tabs, replace the top tab so the history does not grow endlessly
      if (isTab && current && TAB_ROUTES.has(current.pathname)) {
        return [...prev.slice(0, prev.length - 1), parsed];
      }
      return [...prev, parsed];
    });
  }, []);

  const push = useCallback((route: string | AppNavRoute) => {
    const parsed = parseRoute(route);
    if (TAB_ROUTES.has(parsed.pathname)) {
      navigate(parsed);
    } else {
      setHistory((prev) => [...prev, parsed]);
    }
  }, [navigate]);

  const replace = useCallback((route: string | AppNavRoute) => {
    const parsed = parseRoute(route);
    setHistory((prev) => [...prev.slice(0, prev.length - 1), parsed]);
  }, []);

  const back = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  }, []);

  const canGoBack = useCallback(() => {
    return history.length > 1;
  }, [history]);

  return (
    <AppNavigationContext.Provider
      value={{
        push,
        navigate,
        replace,
        back,
        canGoBack,
        pathname: currentRoute.pathname,
        params: currentRoute.params || {},
      }}
    >
      {children}
    </AppNavigationContext.Provider>
  );
};

export function useAppRouter(): AppRouterType {
  const customContext = useContext(AppNavigationContext);
  if (customContext) {
    return customContext;
  }

  // Fallback to Expo Router
  try {
    const expoRouter = useExpoRouter();

    const navigate = (route: string | AppNavRoute) => {
      const target = typeof route === 'string' ? route : route.pathname;
      if (typeof expoRouter.navigate === 'function') {
        expoRouter.navigate(target as any);
      } else {
        expoRouter.push(target as any);
      }
    };

    const push = (route: string | AppNavRoute) => {
      const target = typeof route === 'string' ? route : route.pathname;
      // If target is one of the main tabs, navigate instead of pushing to prevent stack explosion
      if (TAB_ROUTES.has(target)) {
        navigate(route);
      } else {
        expoRouter.push(target as any);
      }
    };

    return {
      push,
      navigate,
      replace: (route) => {
        const target = typeof route === 'string' ? route : route.pathname;
        expoRouter.replace(target as any);
      },
      back: () => {
        if (expoRouter.canGoBack()) {
          expoRouter.back();
        } else {
          expoRouter.replace('/');
        }
      },
      canGoBack: () => expoRouter.canGoBack(),
      pathname: '/',
      params: {},
    };
  } catch {
    return {
      push: () => {},
      navigate: () => {},
      replace: () => {},
      back: () => {},
      canGoBack: () => false,
      pathname: '/',
      params: {},
    };
  }
}

export function useAppPathname(): string {
  const customContext = useContext(AppNavigationContext);
  if (customContext) {
    return customContext.pathname;
  }
  try {
    return useExpoPathname();
  } catch {
    return '/';
  }
}

export function useAppParams<T extends Record<string, any>>(): T {
  const customContext = useContext(AppNavigationContext);
  if (customContext && customContext.params) {
    return customContext.params as T;
  }
  try {
    return useExpoLocalSearchParams<T>();
  } catch {
    return {} as T;
  }
}
