import { SignedIn, RedirectToSignIn,useUser } from "@clerk/clerk-react";
import {Navigate} from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const {isSignedIn}=useUser();

  if(!isSignedIn){
    return <Navigate to='/' />;
  }
  return children;
};

export default ProtectedRoute;
