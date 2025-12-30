import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold hover:text-blue-200" onClick={closeMobileMenu}>
              🏦 SecureBank
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${
                  isActive('/') || isActive('/home') ? 'bg-blue-700' : ''
                }`}
              >
                Home
              </Link>
              
              {!user ? (
                // Not logged in - only show Register
                <Link
                  to="/register"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${
                    isActive('/register') ? 'bg-blue-700' : ''
                  }`}
                >
                  Register
                </Link>
              ) : (
                // Logged in
                <>
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${
                        isActive('/admin') ? 'bg-blue-700' : ''
                      }`}
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${
                        isActive('/dashboard') ? 'bg-blue-700' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Desktop User Info & Logout */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-blue-200">Welcome, </span>
                <span className="font-medium">{user.username}</span>
                <span className="text-blue-200 ml-2">({user.role})</span>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-white hover:text-blue-200 focus:outline-none focus:text-blue-200"
            >
              {isMobileMenuOpen ? (
                // Close icon
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 ${
                  isActive('/') || isActive('/home') ? 'bg-blue-800' : ''
                }`}
              >
                Home
              </Link>
              
              {!user ? (
                // Not logged in - only show Register
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 ${
                    isActive('/register') ? 'bg-blue-800' : ''
                  }`}
                >
                  Register
                </Link>
              ) : (
                // Logged in
                <>
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 ${
                        isActive('/admin') ? 'bg-blue-800' : ''
                      }`}
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 ${
                        isActive('/dashboard') ? 'bg-blue-800' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  {/* Mobile User Info */}
                  <div className="px-3 py-2 text-sm border-t border-blue-600 mt-2">
                    <div className="text-blue-200">Welcome, <span className="font-medium text-white">{user.username}</span></div>
                    <div className="text-blue-200">Role: <span className="font-medium text-white">{user.role}</span></div>
                  </div>
                  
                  {/* Mobile Logout */}
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-500 hover:bg-red-600 mt-2"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
