import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, TrendingUp } from 'lucide-react';
import { recommendationsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import Loader from './Loader';

const SmartCart = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationsAPI.getRecommendations();
      // Mock data if API is not available
      const mockData = [
        { id: 1, name: 'Fresh Tomatoes', price: '₹30/kg', confidence: 95, trend: 'up' },
        { id: 2, name: 'Green Chilies', price: '₹80/kg', confidence: 88, trend: 'up' },
        { id: 3, name: 'Onions', price: '₹25/kg', confidence: 82, trend: 'stable' }
      ];
      setRecommendations(response.data?.recommendations || mockData);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Use mock data on error
      setRecommendations([
        { id: 1, name: 'Fresh Tomatoes', price: '₹30/kg', confidence: 95, trend: 'up' },
        { id: 2, name: 'Green Chilies', price: '₹80/kg', confidence: 88, trend: 'up' },
        { id: 3, name: 'Onions', price: '₹25/kg', confidence: 82, trend: 'stable' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addItem(item);
    alert(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
          Smart Recommendations
        </h3>
        <Loader text="Loading recommendations..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
          Smart Recommendations
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          AI Powered
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-green-200 hover:bg-green-50 transition-all duration-200"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-800">{item.name}</h4>
                <TrendingUp className={`w-4 h-4 ${
                  item.trend === 'up' ? 'text-green-500' : 
                  item.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                }`} />
              </div>
              <p className="text-green-600 font-semibold">{item.price}</p>
              <p className="text-xs text-gray-500">
                {item.confidence}% confidence
              </p>
            </div>
            <button
              onClick={() => handleAddToCart(item)}
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartCart;