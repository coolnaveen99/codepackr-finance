import React, { createContext, useContext } from 'react';
import { ToolDef } from '../types';

export type NavEntry = {
  kind: 'home' | 'tool' | 'category' | 'page';
  toolId?: string;
  category?: string;
  page?: string;
  tab?: 'privacy' | 'terms';
};

export interface NavigationContextValue {
  navStack: NavEntry[];
  onBack?: () => void;
  onBackToHome: () => void;
  navigateToTool: (tool: ToolDef, options?: { pushHistory?: boolean }) => void;
  navigateToHome: (options?: { pushHistory?: boolean }) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const NavigationProvider = NavigationContext.Provider;

export const useNavigation = (): NavigationContextValue | null => {
  return useContext(NavigationContext);
};
