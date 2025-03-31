import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, formatDate, truncateDescription }) => {
  // Make sure we have required props or defaults
  const formatDateFn = formatDate || ((date) => {
    if (!date) return "No date specified";
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return date;
    }
  });

  const truncateDescriptionFn = truncateDescription || ((desc, maxLength = 150) => {
    if (!desc) return 'No description available';
    return desc.length > maxLength ? `${desc.substring(0, maxLength)}...` : desc;
  });

  // Get event properties with fallbacks
  const title = event.title || event.name || "Untitled Event";
  const description = event.description || "";
  const location = event.location || "No location specified";
  const date = event.date || "";
  const attendees = event.attendees || [];
  const imageUrl = event.image_url || "";

  // Track image loading error state
  const [imageError, setImageError] = useState(false);
  
  // Get image URL based on backend format
  const getImageUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL, use it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's from our backend but not a full URL
    return `http://localhost:5000/api/events/images/${encodeURIComponent(url)}`;
  };

  // Get a color based on the event title (for fallback)
  const getCategoryColor = () => {
    const firstLetter = (title || "E")[0].toLowerCase();
    const colors = {
      a: "bg-purple-600", b: "bg-blue-600", c: "bg-green-600", 
      d: "bg-yellow-600", e: "bg-red-600", f: "bg-indigo-600",
      g: "bg-pink-600", h: "bg-teal-600", i: "bg-orange-600",
      j: "bg-cyan-600", k: "bg-lime-600", l: "bg-emerald-600",
      m: "bg-violet-600", n: "bg-fuchsia-600", o: "bg-rose-600",
      p: "bg-sky-600", q: "bg-amber-600", r: "bg-blue-600",
      s: "bg-green-600", t: "bg-red-600", u: "bg-indigo-600",
      v: "bg-purple-600", w: "bg-teal-600", x: "bg-orange-600",
      y: "bg-pink-600", z: "bg-cyan-600"
    };
    return colors[firstLetter] || "bg-blue-600";
  };

  // Process image URL
  const processedImageUrl = getImageUrl(imageUrl);
  const hasImage = processedImageUrl && processedImageUrl.trim() !== '';

  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className={`h-40 ${getCategoryColor()} relative`}>
        {hasImage && !imageError ? (
          <img 
            src={processedImageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => {
              console.log("Image failed to load:", processedImageUrl);
              setImageError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold text-4xl opacity-80">
              {title.slice(0, 1).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-lg text-white truncate">{title}</h3>
          <div className="flex items-center mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Event
            </span>
            <span className="ml-2 text-xs text-white/90">{formatDateFn(date)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-2 text-sm text-gray-600 truncate">{location}</span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-3">
            {truncateDescriptionFn(description)}
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="ml-1 text-xs font-medium text-gray-500">
              {Array.isArray(attendees) ? `${attendees.length} attendees` : "0 attendees"}
            </span>
          </div>
          <Link to={`/events/${event._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 flex items-center">
            View Details
            <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;