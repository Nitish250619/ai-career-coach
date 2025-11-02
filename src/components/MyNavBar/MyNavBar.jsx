import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import "./MyNavBar.scss";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/react-router";
import ProfileAndCoaching from "../ProfileAndCoaching/ProfileAndCoaching";


const MyNavBar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage the mobile menu visibility
    const navigate = useNavigate();
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };


  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo/Brand Name - Using Link for root */}
        <Link to="/" className="brand" onClick={() => setIsOpen(false)}>
          MyBrand
        </Link>

        {/* Desktop Navigation Links and Auth Buttons */}
        <div className={`nav-group ${isOpen ? "active" : ""}`}>
          <div className="nav-links">
            {/* Using Link for internal navigation */}
            <Link to="/home" onClick={toggleMenu}>
              Home
            </Link>
            <Link to="/about" onClick={toggleMenu}>
              About
            </Link>
            <Link to="/services" onClick={toggleMenu}>
              Services
            </Link>
            <Link to="/contact" onClick={toggleMenu}>
              Contact
            </Link>
          </div>
          <div className="auth-buttons">
            {/* These could also be Links if they go to specific pages */}
            
            <SignedOut>
              <button
              
              className="login-btn"
              onClick={() => {
                 toggleMenu();
                 navigate("/login");
              }}
            >
              Login
            </button>
            <button
              className="signup-btn"
              onClick={() => {
                 toggleMenu();
                 navigate("/signup");
              }}
            >
              Sign Up
            </button>
            </SignedOut>
            <SignedIn>
              <ProfileAndCoaching/>
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu Button (CSS Hamburger Icon) */}
        <div className="menu-toggle">
          <button
            onClick={toggleMenu}
            className={`menu-button ${isOpen ? "open" : ""}`}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MyNavBar;
