import React from "react";
import { SignUp } from "@clerk/clerk-react"; // Correct import for @clerk/clerk-react

const SignUpPage = () => {
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
      
        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/login"
          
        />
      
    </div>
  );
};

export default SignUpPage;
