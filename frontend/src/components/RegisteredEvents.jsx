import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Calendar, Star, Clock } from 'lucide-react';
import FeedbackForm from './FeedbackForm';

const RegisteredEvents = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [eventFeedbacks, setEventFeedbacks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewingFeedback, setViewingFeedback] = useState(false);
  
  const { user } = useUser();
  
  // Function to fetch feedback for a specific event
  const fetchEventFeedback = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/event/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const feedbackData = await response.json();
      setEventFeedbacks(prev => ({
        ...prev,
        [eventId]: feedbackData
      }));
      
      return feedbackData;
    } catch (err) {
      console.error(`Error fetching feedback for event ${eventId}:`, err);
      return null;
    }
  };
  
  useEffect(() => {
    if (!user) return;
    
    const fetchRegisteredEvents = async () => {
      try {
        setLoading(true);
        
        // Fetch all events
        const eventsResponse = await fetch('http://localhost:5000/api/events/all');
        if (!eventsResponse.ok) {
          throw new Error(`HTTP error! Status: ${eventsResponse.status}`);
        }
        
        const allEvents = await eventsResponse.json();
        
        // Filter events where user is an attendee
        const userEvents = allEvents.filter(event => 
          event.attendees && event.attendees.includes(user.id)
        );
        
        setRegisteredEvents(userEvents);
        
        // Fetch pending feedback events
        const pendingResponse = await fetch(`http://localhost:5000/api/feedback/pending/${user.id}`);
        if (!pendingResponse.ok) {
          throw new Error(`HTTP error! Status: ${pendingResponse.status}`);
        }
        
        const pendingData = await pendingResponse.json();
        setPendingFeedback(pendingData);
        
      } catch (err) {
        console.error('Error fetching registered events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegisteredEvents();
  }, [user]);
  
  const handleFeedbackSubmit = (data) => {
    // Remove the event from pending feedback list
    setPendingFeedback(prev => prev.filter(event => event._id !== selectedEvent._id));
    setSelectedEvent(null);
  };
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // Check if event is upcoming or past
  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    try {
      const eventDate = new Date(dateString);
      return eventDate > new Date();
    } catch (error) {
      return false;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Registered Events Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Registered Events</h2>
        
        {registeredEvents.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registered events</h3>
            <p className="text-gray-500">You haven't registered for any events yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredEvents.map(event => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {event.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isUpcoming(event.date) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  
                  {!isUpcoming(event.date) && (
                    <button
                      onClick={() => {
                        fetchEventFeedback(event._id);
                        setViewingFeedback(event._id);
                      }}
                      className="w-full mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-center">
                        <Star className="h-4 w-4 mr-2" />
                        View Feedback
                      </div>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pending Feedback Section */}
      {pendingFeedback.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Feedback</h2>
          <p className="text-gray-600 mb-6">Please provide feedback for these past events you've attended:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingFeedback.map(event => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {event.image_url && (
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 mr-2" />
                      Rate This Event
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Feedback Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <FeedbackForm event={selectedEvent} onSubmitSuccess={handleFeedbackSubmit} />
            </div>
          </div>
        </div>
      )}
      
      {/* View Feedback Modal */}
      {viewingFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Event Feedback</h3>
                <button 
                  onClick={() => setViewingFeedback(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {eventFeedbacks[viewingFeedback] ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`w-6 h-6 ${star <= eventFeedbacks[viewingFeedback].average_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-lg font-medium">{eventFeedbacks[viewingFeedback].average_rating.toFixed(1)} out of 5</p>
                    <p className="text-sm text-gray-500">{eventFeedbacks[viewingFeedback].count} {eventFeedbacks[viewingFeedback].count === 1 ? 'review' : 'reviews'}</p>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {eventFeedbacks[viewingFeedback].feedbacks.map((feedback) => (
                      <div key={feedback._id} className="py-4">
                        <div className="flex items-center mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-4 h-4 ${star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        {feedback.comment && (
                          <p className="text-gray-700 mt-2">{feedback.comment}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading feedback...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredEvents;