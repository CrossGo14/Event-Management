import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

// Debug and load Stripe with publishable key from environment variable
console.log('Stripe Publishable Key:', import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY);
const stripePromise = import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : loadStripe('pk_test_51R8jhnJoj9GjRK6iM2qsKXZfCa7i8TMbSD5E4QAUZ37IowaZqXSolVfFm3F994GF3D1FcmD8V1KsGTLGcTmgobpE00fD9EgVwh'); // Use your publishable key

const EventCard = ({ event, formatDate, truncateDescription }) => {
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

  const title = event.title || event.name || "Untitled Event";
  const description = event.description || "";
  const location = event.location || "No location specified";
  const date = event.date || "";
  const attendees = event.attendees || [];
  const imageUrl = event.image_url || "";
  const price = event.price || 10;
  const eventId = event._id; // Ensure event has an _id

  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://localhost:5000/api/events/images/${encodeURIComponent(url)}`;
  };

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

  const processedImageUrl = getImageUrl(imageUrl);
  const hasImage = processedImageUrl && processedImageUrl.trim() !== '';

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      const stripe = await stripePromise;
      console.log('Stripe instance:', stripe);
      const response = await fetch('http://localhost:5000/api/events/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, price, title }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Payment session creation failed: ' + errorText);
      }

      const session = await response.json();
      setSessionId(session.id);
      console.log('Checkout session ID:', session.id);

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        console.error('Stripe checkout error:', error);
        alert('Payment failed: ' + error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Details: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = query.get('session_id');
    const paymentStatusFromUrl = query.get('payment_status');
    const eventIdFromUrl = query.get('event_id');

    console.log('URL Params:', { sessionIdFromUrl, paymentStatusFromUrl, eventIdFromUrl, currentEventId: eventId }); // Debug URL params

    if (sessionIdFromUrl && paymentStatusFromUrl && eventIdFromUrl === eventId) {
      if (paymentStatusFromUrl === 'success') {
        setPaymentStatus('success');
        const updateAttendees = async () => {
          console.log('Attempting to update attendees for eventId:', eventId);
          const response = await fetch(`http://localhost:5000/api/events/update-attendees/${eventId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 'test_user_123' }), // Hardcoded for testing
          });

          console.log('Update attendees response status:', response.status); // Debug response
          if (response.ok) {
            const result = await response.json();
            console.log('Update attendees result:', result);
            alert(`Registration successful! New attendee count: ${result.attendees}`);
            window.location.href = '/dashboard';
          } else {
            const errorText = await response.text();
            console.error('Update attendees error:', errorText);
            alert('Failed to update attendee count: ' + errorText);
          }
        };
        updateAttendees();
      } else if (paymentStatusFromUrl === 'cancel') {
        setPaymentStatus('cancel');
        alert('Payment was canceled.');
        window.location.href = '/dashboard';
      }
    }
  }, [sessionId, eventId]);

  return (
    <>
      <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        <div className={`h-40 ${getCategoryColor()} relative`}>
          {hasImage && !imageError ? (
            <img
              src={processedImageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
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
            <button
              onClick={() => setShowModal(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 flex items-center"
            >
              View Details
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{title}</h3>
                    <div className="mt-4 mb-4">
                      {hasImage && !imageError ? (
                        <img src={processedImageUrl} alt={title} className="w-full h-48 object-cover rounded-md" onError={() => setImageError(true)} />
                      ) : (
                        <div className={`w-full h-48 ${getCategoryColor()} rounded-md flex items-center justify-center`}>
                          <span className="text-white text-4xl font-bold">{title.slice(0, 1).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-700">{formatDateFn(date)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-700">{location}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-700">
                          {Array.isArray(attendees) ? `${attendees.length} attendees` : "0 attendees"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-700">${price.toFixed(2)}</span>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Description</h4>
                        <p className="mt-1 text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Register - $${price.toFixed(2)}`}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;