import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Home from "./pages/Home";  
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./lib/ProtectedRoute";
import UserDatabaseSync from "./components/UserDatabaseSync";
import CreateEvent from "./pages/CreateEvent";


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function Header() {
  const location = useLocation(); // Get current path

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
      <h1 className="text-lg font-semibold">Event Management</h1>

      <div className="flex items-center gap-4">
        <SignedOut>
          {/* Hide Sign-In button on Home page */}
          {location.pathname !== "/" && (
            <SignInButton 
              redirectUrl="/dashboard" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 transition duration-300 text-white font-semibold rounded-lg"
            />
          )}
        </SignedOut>
        
        <SignedIn>
          <UserButton />
          <UserDatabaseSync />
        </SignedIn>
      </div>
    </header>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><CreateEvent /> </ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;
