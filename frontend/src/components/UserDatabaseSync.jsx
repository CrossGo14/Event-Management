import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

const UserDatabaseSync = () => {
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    const storeUserInDatabase = async () => {
      try {
        // Prepare user data
        const userData = {
          clerk_id: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          username: user?.username,
          first_name: user?.firstName,
          last_name: user?.lastName,
          profile_image_url: user?.profileImageUrl
        };

        // Send user data to backend
        const response = await fetch('http://localhost:5000/auth/store-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        // Handle response
        const result = await response.json();

        if (response.ok) {
          console.log('User processed successfully:', result);
        } else if (response.status === 409) {
          // User already exists - this is not an error in our case
          console.log('User already in database:', result);
        } else {
          console.error('Failed to process user:', result);
        }
      } catch (error) {
        console.error('Detailed error storing user in database:', error);
      }
    };

    // Only attempt to sync if user is loaded
    if (isUserLoaded && user) {
      storeUserInDatabase();
    }
  }, [isUserLoaded, user]);

  return null;
};

export default UserDatabaseSync;