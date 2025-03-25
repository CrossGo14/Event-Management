import { useState } from 'react'
import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Clerk from './lib/clerk';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}
function App() {
  

  return (
    <BrowserRouter>
       
       <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <Clerk />
       </ClerkProvider>
       <Routes>
        
       </Routes>
    </BrowserRouter>
  )
}

export default App
