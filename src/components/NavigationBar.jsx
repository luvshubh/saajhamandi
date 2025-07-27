import React from 'react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, LogOut, Mic, ShoppingCart } from 'lucide-react';
import { authAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import Cart from './Cart';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { getCartCount } = useCart();
  const [showCart, setShowCart] = useState(false);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                SaajhaMandi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Home className="inline-block w-4 h-4 mr-1" />
                Home
              </Link>
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/orders') 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <ShoppingBag className="inline-block w-4 h-4 mr-1" />
                Orders
              </Link>
              <Link
                to="/voice-order"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/voice-order') 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Mic className="inline-block w-4 h-4 mr-1" />
                Voice Order
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Cart
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </button>
            
            <span className="text-sm text-gray-600 hidden md:block">
              Welcome, {user.name || 'Vendor'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-50 border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/') 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <Home className="inline-block w-4 h-4 mr-2" />
            Home
          </Link>
          <Link
            to="/orders"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/orders') 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <ShoppingBag className="inline-block w-4 h-4 mr-2" />
            Orders
          </Link>
          <Link
            to="/voice-order"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/voice-order') 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <Mic className="inline-block w-4 h-4 mr-2" />
            Voice Order
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;