import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const EventCard = ({ event, formatDate, truncateDescription }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const formatDateFn = formatDate || ((date) => (date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "No date specified"));
  const truncateDescriptionFn = truncateDescription || ((desc, maxLength = 150) => (desc ? (desc.length > maxLength ? `${desc.substring(0, maxLength)}...` : desc) : 'No description available'));

  const title = event.title || event.name || "Untitled Event";
  const description = event.description || "";
  const location = event.location || "No location specified";
  const date = event.date || "";
  const attendees = event.attendees || [];
  const attendeeCount = event.attendee_count || attendees.length; // Use attendee_count if available
  const imageUrl = event.image_url || "";
  const eventId = event._id;
  const price = event.price || 0; // No payment, so price is optional

  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  
  // Add states for comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  const getImageUrl = (url) => (url && (url.startsWith('http://') || url.startsWith('https://')) ? url : `http://localhost:5000/api/events/images/${encodeURIComponent(url)}`) || null;

  const getCategoryColor = () => {
    const firstLetter = (title || "E")[0].toLowerCase();
    const colors = { a: "bg-purple-600", b: "bg-blue-600", c: "bg-green-600", d: "bg-yellow-600", e: "bg-red-600", f: "bg-indigo-600", g: "bg-pink-600", h: "bg-teal-600", i: "bg-orange-600", j: "bg-cyan-600", k: "bg-lime-600", l: "bg-emerald-600", m: "bg-violet-600", n: "bg-fuchsia-600", o: "bg-rose-600", p: "bg-sky-600", q: "bg-amber-600", r: "bg-blue-600", s: "bg-green-600", t: "bg-red-600", u: "bg-indigo-600", v: "bg-purple-600", w: "bg-teal-600", x: "bg-orange-600", y: "bg-pink-600", z: "bg-cyan-600" };
    return colors[firstLetter] || "bg-blue-600";
  };

  const processedImageUrl = getImageUrl(imageUrl);
  const hasImage = processedImageUrl && processedImageUrl.trim() !== '';

  const handleRegister = async () => {
    if (!user) {
      alert("Please log in to register for this event.");
      return;
    }
    setShowModal(true); // Show confirmation popup
  };

  const confirmRegistration = async () => {
    if (isUserRegistered || isProcessing) return;
    setIsProcessing(true);
    setShowModal(false);
    try {
      const response = await fetch(`http://localhost:5000/api/events/update-attendees/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, session_id: `manual_${Date.now()}` }), // Unique session ID
      });
      const data = await response.json();
      if (response.ok) {
        setIsUserRegistered(true);
        // Optionally refetch event data or update state to reflect new attendee count
        alert("Registration successful!");
      } else {
        alert("Registration failed: " + data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert("An error occurred during registration.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelRegistration = () => {
    setShowModal(false);
  };

  // Function to fetch comments for an event
  const fetchComments = async () => {
    if (!eventId) return;
    
    setIsLoadingComments(true);
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        console.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Function to submit a new comment
  const submitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please log in to post a comment.");
      return;
    }
    
    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    
    setIsPostingComment(true);
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username || user.firstName || user.fullName || 'Anonymous',
          text: newComment
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Add the new comment to the existing comments
        setComments(prevComments => [data.comment, ...prevComments]);
        setNewComment(''); // Clear the input field
      } else {
        const errorData = await response.json();
        alert(`Failed to post comment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert("An error occurred while posting your comment.");
    } finally {
      setIsPostingComment(false);
    }
  };

  // Handle comment button click
  const handleCommentClick = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments();
    }
  };

  useEffect(() => {
    if (user && event.attendees) {
      setIsUserRegistered(event.attendees.includes(user.id));
    }
  }, [user, event.attendees]);

  return (
    <>
      <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        <div className={`h-40 ${getCategoryColor()} relative`}>
          {hasImage && !imageError ? (
            <img src={processedImageUrl} alt={title} className="w-full h-full object-cover" onError={() => setImageError(true)} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white font-bold text-4xl opacity-80">{title.slice(0, 1).toUpperCase()}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-lg text-white truncate">{title}</h3>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Event</span>
              <span className="ml-2 text-xs text-white/90">{formatDateFn(date)}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-sm text-gray-600 truncate">{location}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <span>{attendeeCount} {attendeeCount === 1 ? 'Attendee' : 'Attendees'}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-3">{truncateDescriptionFn(description)}</p>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-xs font-medium text-gray-500">{attendeeCount} attendees</span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleCommentClick} 
                className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors duration-150 flex items-center"
              >
                {showComments ? 'Hide Comments' : 'Comments'} 
                <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
              </button>
              <button onClick={() => setShowModal(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 flex items-center">
                View Details <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </button>
              {user && (
                <button
                  onClick={handleRegister}
                  disabled={isProcessing || isUserRegistered}
                  className={`text-sm font-medium ${isUserRegistered ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-700'} transition-colors duration-150 flex items-center`}
                >
                  {isProcessing ? 'Processing...' : (isUserRegistered ? 'Registered' : 'Register')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <h4 className="font-medium text-sm text-gray-700 mb-3">Comments</h4>
            
            {isLoadingComments ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
              </div>
            ) : (
              <>
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {comments.map((comment, index) => (
                      <div key={comment._id || index} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm">{comment.username || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm mt-1 text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {user ? (
                  <form onSubmit={submitComment} className="mt-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-grow">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={2}
                          disabled={isPostingComment}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isPostingComment || !newComment.trim()}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                          isPostingComment || !newComment.trim() 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isPostingComment ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-3 text-center py-2 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">Please <span className="text-blue-600 font-medium">log in</span> to post a comment.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={cancelRegistration}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Confirm Registration</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Are you sure you want to register for <strong>{title}</strong>?</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmRegistration}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Yes'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelRegistration}
                >
                  No
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