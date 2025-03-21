import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className={`mt-2 absolute top-0 left-0 w-full z-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-extrabold text-white hover:text-gray-300">
              Gnome
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <Link
                to="/"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-md font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-md font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-md font-medium"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
