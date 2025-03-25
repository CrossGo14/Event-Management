import { useState } from 'react'

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

// if (!PUBLISHABLE_KEY) {
//   throw new Error("Missing Publishable Key")
// }

function Clerk() {
  

  return (
    <>
       <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
    </>
  )
}

export default Clerk