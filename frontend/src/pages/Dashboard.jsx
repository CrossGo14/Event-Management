import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { Search, Plus, Loader, AlertTriangle, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [showNotification, setShowNotification] = useState(false);
    
    const navigate = useNavigate();
    
    // Fetch events from backend
    useEffect(() => {
        setLoading(true);
        
        fetch("http://localhost:5000/api/events/all")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then((text) => {
                console.log("Raw response text:", text);
                const data = JSON.parse(text);
                console.log("Parsed data:", data);
                
                if (Array.isArray(data)) {
                    if (data.length > 0) {
                        console.log("First event keys:", Object.keys(data[0]));
                        console.log("First event data:", data[0]);
                    }
                    setEvents(data);
                    // Show notification when events load
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 3000);
                } else {
                    console.error("Expected array but received:", typeof data);
                    setError("Data format is not as expected");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching events:", error);
                setError(error.message);
                setLoading(false);
            });
    }, []);
    
    // Apply filters and search
    const filteredEvents = Array.isArray(events) ? events.filter(event => {
        const searchIn = (event.title || event.name || event.eventName || "").toLowerCase();
        const matchesSearch = searchIn.includes(searchQuery.toLowerCase());
        
        if (activeFilter === "all") return matchesSearch;
        if (activeFilter === "upcoming") {
            const eventDate = new Date(event.date);
            return matchesSearch && eventDate >= new Date();
        }
        if (activeFilter === "past") {
            const eventDate = new Date(event.date);
            return matchesSearch && eventDate < new Date();
        }
        return matchesSearch;
    }) : [];
    
    // Function to format date
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
    
    // Get truncated description
    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return "No description available";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };
    
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
                <Loader className="animate-spin text-blue-600 h-10 w-10 mb-4" />
                <div className="text-blue-600 text-xl font-semibold">Loading events...</div>
                <p className="text-gray-500 mt-2">Please wait while we fetch your events</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-medium text-center text-gray-900 mb-2">Error Loading Events</h3>
                <p className="text-gray-500 text-center mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out">
                    Try Again
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            {/* Notification */}
            {showNotification && (
                <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transition-all duration-300 transform translate-x-0 max-w-md">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Success!</p>
                            <p className="text-sm">{filteredEvents.length} events loaded successfully.</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                Events Dashboard
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Browse, search, and manage your events in one place
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4">
                            <button
                                onClick={() => navigate('/create-event')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Filters and Search - Redesigned */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="p-4 sm:flex sm:items-center sm:justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <button 
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 flex items-center ${activeFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setActiveFilter('all')}
                            >
                                <span className="mr-2">🔍</span>
                                All Events
                            </button>
                            <button 
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 flex items-center ${activeFilter === 'upcoming' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setActiveFilter('upcoming')}
                            >
                                <span className="mr-2">📅</span>
                                Upcoming
                            </button>
                            <button 
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 flex items-center ${activeFilter === 'past' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setActiveFilter('past')}
                            >
                                <span className="mr-2">⏱️</span>
                                Past
                            </button>
                        </div>
                        <div className="mt-4 sm:mt-0 relative flex-grow max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md transition-colors duration-150"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Events Grid - Enhanced */}
                {filteredEvents.length > 0 ? (
                    <>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                Showing {filteredEvents.length} events
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredEvents.map((event, index) => (
                                <EventCard 
                                    key={event._id || index}
                                    event={event}
                                    formatDate={formatDate}
                                    truncateDescription={truncateDescription}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="bg-white p-12 rounded-lg shadow text-center">
                        <div className="bg-gray-100 w-24 h-24 mx-auto rounded-full flex items-center justify-center">
                            <Calendar className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mt-6 text-xl font-semibold text-gray-900">No events found</h3>
                        <p className="mt-2 text-gray-500 max-w-md mx-auto">
                            {searchQuery 
                                ? `We couldn't find any events matching "${searchQuery}". Try a different search term or clear your filters.` 
                                : "Get started by creating a new event or changing your filter settings."}
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/create-event')}
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create New Event
                            </button>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <footer className="bg-white mt-12 py-6 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="text-gray-500 text-sm">
                            © 2025 EventHub. All rights reserved.
                        </div>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Facebook</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Twitter</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">GitHub</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;