import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const location = useLocation();
  
  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-2xl font-bold text-blue-600">Event Hub</span>
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link 
                  to="/events/create" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/events/create') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Create Event
                </Link>
                <Link 
                  to="/events/browse" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/events/browse') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Browse Events
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className={`hidden md:block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/dashboard') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <div className="border-l border-gray-300 h-6 hidden md:block"></div>
            <div className="flex items-center">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - shown below md breakpoint */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 py-3 space-y-1 sm:px-3 flex justify-around">
          <Link 
            to="/dashboard" 
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/events/create" 
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/events/create') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
            }`}
          >
            Create
          </Link>
          <Link 
            to="/events/browse" 
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/events/browse') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
            }`}
          >
            Browse
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;