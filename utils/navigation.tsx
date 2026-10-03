import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter as useExpoRouter, useLocalSearchParams as useExpoLocalSearchParams, usePathname as useExpoPathname } from 'expo-router';

export interface AppNavRoute {
  pathname: string;
  params?: Record<string, any>;
}

export interface AppRouterType {
  push: (route: string | AppNavRoute) => void;
  replace: (route: string | AppNavRoute) => void;
  back: () => void;
  canGoBack: () => boolean;
  pathname: string;
  params: Record<string, any>;
}

export const AppNavigationContext = createContext<AppRouterType | null>(null);

export const AppNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<AppNavRoute[]>([{ pathname: '/' }]);

  const currentRoute = history[history.length - 1] || { pathname: '/' };

  const parseRoute = (route: string | AppNavRoute): AppNavRoute => {
    if (typeof route === 'string') {
      if (route.startsWith('/recipe/')) {
        const id = route.replace('/recipe/', '');
        return { pathname: '/recipe', params: { id } };
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

  const push = useCallback((route: string | AppNavRoute) => {
    const parsed = parseRoute(route);
    setHistory((prev) => [...prev, parsed]);
  }, []);

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
    return {
      push: (route) => {
        if (typeof route === 'string') {
          expoRouter.push(route as any);
        } else {
          expoRouter.push(route as any);
        }
      },
      replace: (route) => {
        if (typeof route === 'string') {
          expoRouter.replace(route as any);
        } else {
          expoRouter.replace(route as any);
        }
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
