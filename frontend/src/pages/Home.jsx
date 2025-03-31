import React, { useEffect } from "react";
import { SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Music, Award } from "lucide-react";

const Home = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
              <span className="block">Effortless</span>
              <span className="block text-blue-400">Event Management</span>
            </h1>
            <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Plan, organize, and execute stunning events with our comprehensive platform. 
              From corporate conferences to intimate gatherings, we've got you covered.
            </p>
            
            <div className="mt-8 sm:max-w-lg sm:mx-auto lg:mx-0">
              <SignedOut>
                <div className="flex flex-col items-center lg:items-start">
                  <SignInButton
                    mode="modal"
                    redirectUrl="/dashboard"
                    className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition duration-300 shadow-lg"
                  />
                  <p className="mt-3 text-sm text-gray-400">
                    No credit card required. Start planning your events today.
                  </p>
                </div>
              </SignedOut>
            </div>
          </div>
          
          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
              <div className="px-6 py-8 sm:p-10">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Event Planning</h3>
                      <p className="text-gray-400">Create and manage events effortlessly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Attendee Management</h3>
                      <p className="text-gray-400">Track RSVPs and guest information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Vendor Coordination</h3>
                      <p className="text-gray-400">Manage caterers, DJs, and more</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Analytics & Reporting</h3>
                      <p className="text-gray-400">Gain insights into your events</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-gray-800 bg-opacity-50">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Trusted by event planners worldwide</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300">
              Join thousands of professionals using our platform to create memorable experiences.
            </p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-gray-900 rounded-lg shadow-lg p-6">
                <p className="text-gray-300">"This platform revolutionized how we organize our corporate conferences. Everything in one place!"</p>
                <div className="mt-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="font-bold">JD</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-medium">Jane Doe</h3>
                    <p className="text-gray-400 text-sm">Marketing Director</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg shadow-lg p-6">
                <p className="text-gray-300">"We saved countless hours planning our company retreat. The interface is intuitive and powerful."</p>
                <div className="mt-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="font-bold">MS</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-medium">Michael Smith</h3>
                    <p className="text-gray-400 text-sm">HR Manager</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg shadow-lg p-6">
                <p className="text-gray-300">"From weddings to birthdays, this tool has made event planning a breeze for our small agency."</p>
                <div className="mt-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="font-bold">AT</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-medium">Alicia Taylor</h3>
                    <p className="text-gray-400 text-sm">Event Planner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Ready to transform your event planning?
        </h2>
        <p className="mt-4 text-lg text-gray-300">
          Get started today and see the difference our platform can make.
        </p>
        <div className="mt-8">
          <SignedOut>
            <SignInButton
              mode="modal"
              redirectUrl="/dashboard"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition duration-300 shadow-lg"
            />
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default Home;