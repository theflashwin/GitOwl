import React from 'react';
import { Link } from 'react-router-dom';
import user_auth from '../auth';

export default function Navbar() {

  const {user, authLoading, isLoggedIn} = user_auth()

  return (
    <nav className={`mt-2 absolute top-0 left-0 w-full z-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-extrabold text-white hover:text-gray-300">
              GitOwl
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
              { !isLoggedIn ? <Link
                to="/login"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-md font-medium"
              >
                Login
              </Link> : <Link
                to="/account"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-md font-medium"
              >
                Account
              </Link> }
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
