import React from "react";
import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/react-router";

import MyNavBar from "./components/MyNavBar/MyNavBar";
import HomePage from "./Pages/HomePage/HomePage";
import SignInPage from "./Pages/SignInPage/SignInPage";
import SignUpPage from "./Pages/SignUpPage/SignUpPage";
import MyFooter from "./components/MyFooter/MyFooter";
import ResumeCreatePage from "./Pages/ResumeCreatePage/ResumeCreatePage";
import CoverLetterPage from "./Pages/CoverLetterPage/CoverLetterPage";
import PreparePage from "./Pages/PreparePage/PreparePage";

const App = () => {
  return (
    <>
      <MyNavBar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage/>} />
       {/* Auth (note the /* to allow /sso-callback, /factor-one, etc.) */}
        <Route path="/login/*" element={<SignInPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />

        Protected Route Example
        <Route
          path="/resume-builder"
          element={
            
              <ResumeCreatePage/>
            
          }
        />
         <Route
          path="/cover-letter"
          element={
            
              <CoverLetterPage/>
            
          }
        />
         <Route
          path="/preparation"
          element={
            
              <PreparePage/>
            
          }
        />
        {/* <Route
          path="/dashboard"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        /> */}
      </Routes>
      <MyFooter/>
    </>
  );
};

export default App;
