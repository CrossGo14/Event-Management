import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Menu, X, Home, Calendar, PlusCircle, User } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const navigate = useNavigate();

    return (
        <nav className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="text-white font-bold text-xl">EventHub</Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/dashboard" className="border-white text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                <Home className="mr-1 h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link to="/my-events" className="border-transparent text-white hover:border-white hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                <User className="mr-1 h-4 w-4" />
                                My Events
                            </Link>
                            <Link to="/create-event" className="border-transparent text-white hover:border-white hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                <PlusCircle className="mr-1 h-4 w-4" />
                                Create Event
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/dashboard" className="bg-blue-700 border-white text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            <Home className="inline mr-2 h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link to="/my-events" className="border-transparent text-white hover:bg-blue-700 hover:border-white hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            <User className="inline mr-2 h-4 w-4" />
                            My Events
                        </Link>
                        <Link to="/create-event" className="border-transparent text-white hover:bg-blue-700 hover:border-white hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            <PlusCircle className="inline mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </div>
                    <div className="pt-4 pb-3 border-t border-white">
                        <div className="flex items-center px-4">
                            <div className="ml-3">
                                <div className="text-base font-medium text-white">Account</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;