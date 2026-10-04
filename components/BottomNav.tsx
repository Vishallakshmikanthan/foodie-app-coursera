import React from 'react';
import { FloatingTabBar, FloatingTabBarProps } from './FloatingTabBar';

/**
 * BottomNav is now a drop-in wrapper around the Phase 2 FloatingTabBar.
 * It provides the floating frosted glass pill navigation bar with active circle indicator
 * across both Expo Router tabs and Snack/fallback navigation modes.
 */
export const BottomNav: React.FC<FloatingTabBarProps> = (props) => {
  return <FloatingTabBar {...props} />;
};

export default BottomNav;
