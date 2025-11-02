import React from "react";
import { SignIn } from "@clerk/clerk-react"; // Correct import for @clerk/clerk-react

const SignInPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection:"column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem", 
        backgroundColor:"grey",
        minHeight: "calc(100vh - 80px)"
        
      }}
    >
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
          
        />
      </div>
  );
};

export default SignInPage;
