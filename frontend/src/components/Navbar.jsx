import React, { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-sandLight/90 backdrop-blur-md border-b border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="font-script text-4xl text-woodDark font-bold tracking-wider">
              Cozy
            </span>
            <span className="font-sans text-xl text-woodDark tracking-widest mt-2 uppercase font-medium">
              Cafe
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#home" className="text-wood hover:text-green transition-colors duration-300 font-medium">Home</a>
            <a href="#menu" className="text-wood hover:text-green transition-colors duration-300 font-medium">Menu</a>
            <a href="#atmosphere" className="text-wood hover:text-green transition-colors duration-300 font-medium">Atmosphere</a>
            <a href="#visit" className="text-wood hover:text-green transition-colors duration-300 font-medium">Visit Us</a>
            <button className="bg-green text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-all duration-300 shadow-md">
              Order Now
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-wood focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-sand border-t border-sandLight">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" className="block px-3 py-2 text-wood hover:text-green hover:bg-sandLight rounded-md font-medium">Home</a>
            <a href="#menu" className="block px-3 py-2 text-wood hover:text-green hover:bg-sandLight rounded-md font-medium">Menu</a>
            <a href="#atmosphere" className="block px-3 py-2 text-wood hover:text-green hover:bg-sandLight rounded-md font-medium">Atmosphere</a>
            <a href="#visit" className="block px-3 py-2 text-wood hover:text-green hover:bg-sandLight rounded-md font-medium">Visit Us</a>
            <button className="w-full text-left mt-4 bg-green text-white px-3 py-2 rounded-md hover:bg-opacity-90 font-medium">
              Order Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import { Link } from 'react-router-dom';

// Use this instead of regular <div> or <button> for your menu items:
<Link to="/dashboard">Overview</Link>
<Link to="/vulnerabilities">Vulnerabilities</Link>
<Link to="/notifications">Notifications</Link>

