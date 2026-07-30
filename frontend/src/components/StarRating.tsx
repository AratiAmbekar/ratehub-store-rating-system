import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onRatingChange,
  size = 20,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleStarClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="stars-container" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= Math.round(currentDisplayRating);

        return (
          <Star
            key={starValue}
            id={`star-${starValue}`}
            size={size}
            className={`star-icon ${isFilled ? 'star-filled' : 'star-empty'}`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        );
      })}
    </div>
  );
};
