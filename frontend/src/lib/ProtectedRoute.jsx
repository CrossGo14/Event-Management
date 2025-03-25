import { SignedIn, RedirectToSignIn } from "@clerk/clerk-react";

const ProtectedRoute = ({ children }) => {
  return (
    <SignedIn>
      {children}
    </SignedIn>
  ) || <RedirectToSignIn />;
};

export default ProtectedRoute;
