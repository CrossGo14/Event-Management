import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import RegisteredEventsList from '../components/RegisteredEventsList';

const RegisteredEventsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const queryParams = new URLSearchParams(location.search);
  const paymentStatus = queryParams.get('payment_status');
  const sessionId = queryParams.get('session_id');
  const eventId = queryParams.get('event_id');
  
  // Handle successful payment and registration
  useEffect(() => {
    if (paymentStatus === 'success' && eventId && sessionId) {
      // Update attendees count in the backend
      const updateAttendees = async () => {
        try {
          const userId = user?.id || localStorage.getItem('userId') || 'anonymous';
          const response = await fetch(`http://localhost:5000/api/events/update-attendees/${eventId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              user_id: userId,
              session_id: sessionId
            }),
          });
          
          if (response.ok) {
            console.log('Successfully registered for event');
            // Clear URL parameters after processing
            setTimeout(() => {
              navigate('/registered-events', { replace: true });
            }, 5000);
          } else {
            const errorData = await response.json();
            console.error('Failed to update attendees:', errorData.error);
            if (errorData.error === 'User already registered') {
              // If user is already registered, just clear the URL parameters
              setTimeout(() => {
                navigate('/registered-events', { replace: true });
              }, 5000);
            }
          }
        } catch (error) {
          console.error('Error updating attendees:', error);
        }
      };
      
      updateAttendees();
    }
  }, [paymentStatus, eventId, sessionId, navigate, user]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Payment Success Message */}
      {paymentStatus === 'success' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Payment successful! You have been registered for the event.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Your Events
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View your registered events and provide feedback for past events
              </p>
            </div>
          </div>
        </div>
        
        <RegisteredEventsList />
      </div>
    </div>
  );
};

export default RegisteredEventsPage;