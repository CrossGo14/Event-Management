import React, { useEffect } from "react";
import { SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Music, Award, Clock, MapPin, Ticket } from "lucide-react";

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
                    className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
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
                      <Ticket className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Ticketing</h3>
                      <p className="text-gray-400">Sell tickets with secure payments</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Venue Management</h3>
                      <p className="text-gray-400">Find and book perfect locations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Scheduling</h3>
                      <p className="text-gray-400">Coordinate timelines and agendas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-800 bg-opacity-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-white mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "This platform saved me countless hours in event planning. Highly recommended!",
                name: "Sarah Johnson",
                title: "Marketing Director"
              },
              {
                quote: "The attendee management tools are incredible. Our events have never been smoother.",
                name: "Michael Chen",
                title: "Event Coordinator"
              },
              {
                quote: "From small meetups to large conferences, this system handles it all beautifully.",
                name: "Emma Rodriguez",
                title: "Community Manager"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-700 bg-opacity-50 p-6 rounded-lg">
                <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p>
                <p className="text-white font-medium">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">{testimonial.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;