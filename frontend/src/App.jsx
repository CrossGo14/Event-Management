import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import RegisteredEventsPage from './pages/RegisteredEvents';
import ProtectedRoute from './lib/ProtectedRoute';
import UserDatabaseSync from './components/UserDatabaseSync';
import './App.css';
import EventCard from './components/EventCard';

// Get Clerk publishable key from environment variable
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/registered-events" element={<ProtectedRoute><RegisteredEventsPage /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><RegisteredEventsPage /></ProtectedRoute>} />
          <Route path="/payment-cancel" element={<ProtectedRoute><RegisteredEventsPage /></ProtectedRoute>} />
          <Route path="/events" element={<EventCard />} /> {/* Adjust path as needed */}

        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;
