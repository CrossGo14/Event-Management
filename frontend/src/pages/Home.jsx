import {React,useEffect} from "react";
import { SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";


const Home = () => {

  const {isSignedIn}=useUser();
  const navigate=useNavigate();

  useEffect(()=>{
    if(isSignedIn)
    {
      navigate("/dashboard");
    }
  },[isSignedIn,navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <span>Press this button to Enter the Event Management</span>
      {/* Show Sign-In button only when signed out */}
      <SignedOut>
        <SignInButton 
          mode="modal" 
          redirectUrl="/dashboard" 
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 transition duration-300 text-white font-semibold rounded-lg"
        />
      </SignedOut>
    </div>
  );
};

export default Home;
