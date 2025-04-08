import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Star, StarHalf } from 'lucide-react';

const FeedbackForm = ({ event, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { user } = useUser();
  
  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };
  
  const handleRatingHover = (hoveredRating) => {
    setHoveredRating(hoveredRating);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/submit/${event._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }
      
      setSuccess(true);
      setComment('');
      setRating(0);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStars = () => {
    return [
      [1, 'Poor'],
      [2, 'Fair'],
      [3, 'Good'],
      [4, 'Very Good'],
      [5, 'Excellent']
    ].map(([value, label]) => (
      <div key={value} className="flex flex-col items-center mx-2">
        <button
          type="button"
          className="focus:outline-none"
          onClick={() => handleRatingClick(value)}
          onMouseEnter={() => handleRatingHover(value)}
          onMouseLeave={() => handleRatingHover(0)}
          aria-label={`Rate ${value} out of 5`}
        >
          <Star 
            className={`w-8 h-8 ${(hoveredRating || rating) >= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        </button>
        <span className="text-xs mt-1">{label}</span>
      </div>
    ));
  };
  
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-green-800 mb-2">Thank you for your feedback!</h3>
        <p className="text-green-600">Your feedback helps us improve future events.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Rate your experience</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">How would you rate this event?</label>
          <div 
            className="flex justify-center items-center py-3"
            onMouseLeave={() => handleRatingHover(0)}
          >
            {renderStars()}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comments (optional)
          </label>
          <textarea
            id="comment"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your thoughts about the event..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;