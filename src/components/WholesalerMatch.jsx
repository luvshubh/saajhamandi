import React, { useState } from 'react';
import { Users, MapPin, Phone, Star } from 'lucide-react';
import { wholesalerAPI } from '../services/api';
import Loader from './Loader';

const WholesalerMatch = () => {
  const [items, setItems] = useState('');
  const [wholesalers, setWholesalers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items) return;

    try {
      setLoading(true);
      const itemList = items.split(',').map(item => item.trim());
      const response = await wholesalerAPI.matchWholesalers(itemList);
      
      // Mock data if API is not available
      const mockWholesalers = [
        {
          id: 1,
          name: 'Ramesh Vegetables',
          location: '2.3 km away',
          phone: '+91 98765 43210',
          rating: 4.5,
          specialties: ['Vegetables', 'Fruits'],
          minOrder: '₹500'
        },
        {
          id: 2,
          name: 'Delhi Fresh Market',
          location: '3.1 km away',
          phone: '+91 98765 43211',
          rating: 4.2,
          specialties: ['Grains', 'Pulses'],
          minOrder: '₹1000'
        },
        {
          id: 3,
          name: 'Green Valley Wholesale',
          location: '4.5 km away',
          phone: '+91 98765 43212',
          rating: 4.7,
          specialties: ['Organic Produce'],
          minOrder: '₹750'
        }
      ];
      
      setWholesalers(response.data?.wholesalers || mockWholesalers);
    } catch (error) {
      console.error('Error fetching wholesalers:', error);
      // Use mock data on error
      setWholesalers([
        {
          id: 1,
          name: 'Ramesh Vegetables',
          location: '2.3 km away',
          phone: '+91 98765 43210',
          rating: 4.5,
          specialties: ['Vegetables', 'Fruits'],
          minOrder: '₹500'
        },
        {
          id: 2,
          name: 'Delhi Fresh Market',
          location: '3.1 km away',
          phone: '+91 98765 43211',
          rating: 4.2,
          specialties: ['Grains', 'Pulses'],
          minOrder: '₹1000'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Wholesaler Match
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Nearby
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Items (comma-separated)
          </label>
          <textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="e.g., Tomatoes, Onions, Rice, Wheat"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? <Loader size="small" text="" /> : 'Find Wholesalers'}
        </button>
      </form>

      {wholesalers.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">
            Found {wholesalers.length} matching wholesaler{wholesalers.length > 1 ? 's' : ''}
          </h4>
          
          {wholesalers.map((wholesaler) => (
            <div
              key={wholesaler.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-semibold text-gray-800">
                    {wholesaler.name}
                  </h5>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {wholesaler.location}
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{wholesaler.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Specialties</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {wholesaler.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Min Order</p>
                  <p className="text-sm font-medium text-gray-800">
                    {wholesaler.minOrder}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-1" />
                  {wholesaler.phone}
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WholesalerMatch;