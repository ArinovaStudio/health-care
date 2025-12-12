"use client";
import React, { useState } from "react";
import { Shield, Menu, X } from "lucide-react"; // Imported Menu and X icons
import Login from "./Login";
import SignUp from "./SignUp";
import OTP from "./verifyOTP";
import { useRouter } from "next/navigation";

function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      // Close mobile menu after clicking a link
      setIsMobileMenuOpen(false);
    }
  };

  const section = [
    { name: "Home", id: "home" },
    { name: "Features", id: "features" },
    { name: "How It Works", id: "how" },
    { name: "FAQ", id: "faq" },
    { name: "Contact", id: "contact" },
  ];

  const handleAuthClick = () => {
    setIsLoginOpen(true);
    // Close mobile menu when opening a modal
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-16 flex items-center justify-center border-b border-gray-100/50 relative">
      <div className="w-full max-w-7xl flex justify-between items-center p-4">
        {/* Logo/Brand */}
        <div
          className="text-2xl flex items-center space-x-2 sm:space-x-4 font-semibold font-serif cursor-pointer"
          onClick={() => {
            router.push("/");
            setIsMobileMenuOpen(false); // Close menu on logo click
          }}
        >
          <Shield className="text-teal-500 w-6 h-6 sm:w-8 sm:h-8" /> 
          <span className="text-xl sm:text-2xl">MediLink</span>
        </div>

        {/* Desktop Navigation Links and Button (Visible on medium screens and up) */}
        <div className="hidden md:flex space-x-4 lg:space-x-7 text-base lg:text-lg items-center">
          {section.map((sec) => (
            <div
              key={sec.name}
              onClick={() => scrollToSection(sec.id)}
              tabIndex={0}
              className="flex justify-center items-center cursor-pointer hover:text-teal-600 transition-all duration-300"
            >
              <p>{sec.name}</p>
            </div>
          ))}
          <button
            onClick={handleAuthClick}
            className="text-teal-600 px-4 py-2 rounded-md border border-teal-600 hover:bg-teal-500 hover:text-white transition-colors duration-300"
          >
            Login/Sign up
          </button>
        </div>

        {/* Mobile Menu Button (Visible on small screens) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-teal-600 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay/Dropdown */}
      {/* This is positioned absolutely to overlay content */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg transition-all duration-300 ease-in-out z-50
        ${isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}
        `}
      >
        <div className="flex flex-col p-4 space-y-4 border-t border-gray-200">
          {section.map((sec) => (
            <div
              key={sec.name}
              onClick={() => scrollToSection(sec.id)}
              tabIndex={0}
              className="py-2 text-gray-700 hover:text-teal-600 border-b border-gray-100 cursor-pointer"
            >
              {sec.name}
            </div>
          ))}
          <button
            onClick={handleAuthClick}
            className="w-full text-teal-600 px-4 py-2 mt-2 rounded-md border border-teal-600 hover:bg-teal-500 hover:text-white transition-colors duration-300"
          >
            Login/Sign up
          </button>
        </div>
      </div>

      {/* Modals (No change needed here for responsiveness, but kept for completeness) */}
      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => {
          setIsLoginOpen(false);
          setIsSignUpOpen(true);
        }}
      />

      <SignUp
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToLogin={() => {
          setIsSignUpOpen(false);
          setIsLoginOpen(true);
        }}
        onOpenOtp={() => setIsOtpOpen(true)}
      />

      <OTP
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
}

export default Navbar;