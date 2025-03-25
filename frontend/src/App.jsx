import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
// import Home from "./pages/Home";  // Example page
 import Dashboard from "./pages/Dashboard"; // Protected page
import ProtectedRoute from "./lib/ProtectedRoute"; // Middleware for protected routes

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <header>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>

        <Routes>
           {/* <Route path="/" element={<Home />} /> */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> 
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;
