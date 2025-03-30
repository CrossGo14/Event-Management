import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    
    const navigate = useNavigate();
    
    // Fetch events from backend
    useEffect(() => {
        setLoading(true);
        
        fetch("http://localhost:5000/all")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Fetched data:", data);
                if (Array.isArray(data)) {
                    setEvents(data);
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
        const searchIn = (event.title || event.name || "").toLowerCase();
        const matchesSearch = searchIn.includes(searchQuery.toLowerCase());
        
        // Filter logic can be expanded based on actual data structure
        if (activeFilter === "all") return matchesSearch;
        if (activeFilter === "upcoming") {
            // Example: assuming event.date is in a format that can be parsed
            const eventDate = new Date(event.date);
            return matchesSearch && eventDate >= new Date();
        }
        if (activeFilter === "past") {
            const eventDate = new Date(event.date);
            return matchesSearch && eventDate < new Date();
        }
        return matchesSearch;
    }) : [];
    
    // Function to format date (example implementation)
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
            return dateString; // Fallback to the original string
        }
    };
    
    // Get truncated description
    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return "No description available";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };
    
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="text-blue-600 text-xl font-semibold flex items-center">
                <svg className="animate-spin mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading events...
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
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
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            {/* <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-blue-600">EventHub</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150">
                                Dashboard
                            </button>
                            <button className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150">
                                My Events
                            </button>
                            <button className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150">
                                Calendar
                            </button>
                            <div className="relative">
                                <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                        A
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Events
                        </h2>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4">
                        <button
                            onClick={() => navigate('/create-event')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Create Event
                        </button>
                    </div>
                </div>
                
                {/* Filters and Search */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <button 
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveFilter('all')}
                            >
                                All Events
                            </button>
                            <button 
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeFilter === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveFilter('upcoming')}
                            >
                                Upcoming
                            </button>
                            <button 
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeFilter === 'past' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveFilter('past')}
                            >
                                Past
                            </button>
                        </div>
                        <div className="mt-2 sm:mt-0 relative flex-grow max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Events Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, index) => (
                            <div
                                key={event._id || index}
                                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 flex flex-col"
                            >
                                <div className="h-32 bg-blue-600 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-white font-bold text-xl">{(event.title || event.name || "Event").slice(0, 1).toUpperCase()}</div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                                        <h3 className="font-bold text-lg text-white truncate">{event.title || event.name || "Untitled Event"}</h3>
                                    </div>
                                </div>
                                <div className="flex-1 p-4">
                                    <div className="mt-2 space-y-3">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="ml-2 text-sm text-gray-500">{formatDate(event.date)}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="ml-2 text-sm text-gray-500 truncate">{event.location || "No location specified"}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {truncateDescription(event.description)}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-medium text-gray-500">
                                            {event.attendees ? `${event.attendees.length} attendees` : "0 attendees"}
                                        </span>
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="bg-white p-8 rounded-lg shadow text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating a new event or try a different search.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => navigate('/create-event')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Create Event
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;