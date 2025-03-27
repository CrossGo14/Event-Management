import React, { useState, useEffect } from 'react';
import CreateEvent from './CreateEvent';
import { Navigate,useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [events, setEvents] = useState([]);  // Store events from MongoDB
    const [searchQuery, setSearchQuery] = useState("");  // Search input value

    const navigate=useNavigate()

    // Fetch events from backend
    useEffect(() => {
        fetch("http://localhost:5000/events") // Replace with your actual backend URL
            .then((response) => response.json())
            .then((data) => setEvents(data))
            .catch((error) => console.error("Error fetching events:", error));
    }, []);

    // Filter events based on search query
    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-pink-100 p-6">
            {/* Top Section: Create Event & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                {/* Create Event Button */}
                <button className="bg-blue-600 hover:bg-red-700 transition duration-300 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                onClick={()=>{navigate('/create-event')}}>
                    ➕ Create Event
                </button>

                {/* Search Bar */}
                <div className="flex w-full sm:w-auto border border-gray-300 rounded-lg overflow-hidden">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border-none focus:ring-0 focus:outline-none"
                        placeholder="Search Events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-red-700 hover:bg-pink-600 transition duration-500 text-white font-semibold px-4 py-2">
                        🔍 Search
                    </button>
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event, index) => (
                        <div
                            key={index}
                            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                        >
                            <h2 className="text-xl font-semibold text-gray-700">{event.name}</h2>
                            <p className="text-gray-500">📅 {event.date}</p>
                            <p className="text-gray-500">📍 {event.location}</p>
                            <p className="text-gray-600 mt-2">{event.description}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600 text-center col-span-full">No events found</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
