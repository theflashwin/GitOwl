import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import user_auth from '../auth';

export default function Navbar() {
  const { user, authLoading, isLoggedIn } = user_auth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="mt-2 absolute top-0 left-0 w-full z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-extrabold text-white hover:text-gray-300 flex items-center">
              Git Parrot
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full">BETA</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <Link
                to="/"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-md font-medium"
              >
                Home
              </Link>
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-md font-medium"
                >
                  Login
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-md font-medium"
                >
                  Account
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 rounded-md mt-2 mx-4">
          <Link
            to="/"
            className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          ) : (
            <Link
              to="/account"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Account
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}