import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Plus, Image, X, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    image_url: '',
    banner_image: '',
    gallery_images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    
    if (!file) return;
    
    setImageUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/api/events/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      const imageUrl = data.image_url;
      
      if (fieldName === 'gallery_images') {
        setFormData(prev => ({
          ...prev,
          gallery_images: [...prev.gallery_images, imageUrl]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: imageUrl
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setImageUploading(false);
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organizer_id: userId,
          date: formData.date.toISOString()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const data = await response.json();
      setSuccess(true);
      setTimeout(() => navigate('/my-events'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
                <p>Event created successfully! Redirecting...</p>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Event Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event title"
                />
              </div>
              
              {/* Event Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your event..."
                />
              </div>
              
              {/* Date and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.date}
                      onChange={handleDateChange}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter event location"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Event Image
                </label>
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {imageUploading ? 'Uploading...' : 'Click to upload'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      name="image_url"
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Image uploaded</span>
                  </div>
                )}
              </div>
              
              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gallery Images
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.gallery_images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`Gallery ${index}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center">
                      <Plus className="w-6 h-6 text-gray-500" />
                    </div>
                    <input 
                      type="file" 
                      name="gallery_images"
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                  </label>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;