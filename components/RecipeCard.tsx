import React from 'react';
import { ListCard, ListCardProps } from './ListCard';
import { AnimatedCardWrapper } from './AnimatedCardWrapper';

export interface RecipeCardProps extends ListCardProps {
  index?: number;
  disableAnimation?: boolean;
}

/**
 * RecipeCard - The standard card component for lists and grids.
 * Powered by ListCard from M4 Recipe Card System with category-tinted gradients,
 * glass chips, subtle difficulty indicators, and spring press animations.
 * Enhanced in M6 with staggered Reanimated fade-and-rise entry animations.
 */
export const RecipeCard: React.FC<RecipeCardProps> = ({
  index = 0,
  disableAnimation = false,
  ...props
}) => {
  return (
    <AnimatedCardWrapper index={index} disableAnimation={disableAnimation}>
      <ListCard {...props} />
    </AnimatedCardWrapper>
  );
};

export default RecipeCard;
