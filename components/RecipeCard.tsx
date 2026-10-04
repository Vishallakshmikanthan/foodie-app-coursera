import React from 'react';
import { ListCard, ListCardProps } from './ListCard';

export type RecipeCardProps = ListCardProps;

/**
 * RecipeCard - The standard card component for lists and grids.
 * Powered by ListCard from M4 Recipe Card System with category-tinted gradients,
 * glass chips, subtle difficulty indicators, and spring press animations.
 */
export const RecipeCard: React.FC<RecipeCardProps> = (props) => {
  return <ListCard {...props} />;
};

export default RecipeCard;
