import React, { useState, useEffect } from 'react';
import { Tag, Clock, Users, MapPin } from 'lucide-react';
import { dealsAPI } from '../services/api';
import Loader from './Loader';

const ActiveDealsList = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveDeals();
  }, []);

  const fetchActiveDeals = async () => {
    try {
      setLoading(true);
      const response = await dealsAPI.getActiveDeals();
      
      // Mock data if API is not available
      const mockDeals = [
        {
          id: 1,
          title: 'Group Buy: Premium Basmati Rice',
          description: '25kg bags at wholesale prices',
          price: '₹1,200/bag',
          originalPrice: '₹1,500/bag',
          discount: '20%',
          participants: 8,
          maxParticipants: 10,
          timeLeft: '2 days',
          location: 'Delhi NCR'
        },
        {
          id: 2,
          title: 'Flash Sale: Fresh Vegetables',
          description: 'Mixed vegetables combo pack',
          price: '₹300/pack',
          originalPrice: '₹400/pack',
          discount: '25%',
          participants: 15,
          maxParticipants: 20,
          timeLeft: '6 hours',
          location: 'Mumbai'
        },
        {
          id: 3,
          title: 'Seasonal Offer: Winter Fruits',
          description: 'Apple, Orange, Pomegranate combo',
          price: '₹450/box',
          originalPrice: '₹600/box',
          discount: '25%',
          participants: 12,
          maxParticipants: 15,
          timeLeft: '1 day',
          location: 'Bangalore'
        }
      ];
      
      setDeals(response.data?.deals || mockDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      // Use mock data on error
      setDeals([
        {
          id: 1,
          title: 'Group Buy: Premium Basmati Rice',
          description: '25kg bags at wholesale prices',
          price: '₹1,200/bag',
          originalPrice: '₹1,500/bag',
          discount: '20%',
          participants: 8,
          maxParticipants: 10,
          timeLeft: '2 days',
          location: 'Delhi NCR'
        },
        {
          id: 2,
          title: 'Flash Sale: Fresh Vegetables',
          description: 'Mixed vegetables combo pack',
          price: '₹300/pack',
          originalPrice: '₹400/pack',
          discount: '25%',
          participants: 15,
          maxParticipants: 20,
          timeLeft: '6 hours',
          location: 'Mumbai'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const joinDeal = (dealId) => {
    alert(`Joined deal ${dealId}! You'll be notified when the deal is confirmed.`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Tag className="w-5 h-5 mr-2 text-orange-600" />
          Active Deals
        </h3>
        <Loader text="Loading deals..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Tag className="w-5 h-5 mr-2 text-orange-600" />
          Active Deals
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {deals.length} Available
        </span>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">
                  {deal.title}
                </h4>
                <p className="text-sm text-gray-600">{deal.description}</p>
              </div>
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded">
                {deal.discount} OFF
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Deal Price</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    {deal.price}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {deal.originalPrice}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Participants</p>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-sm font-medium">
                    {deal.participants}/{deal.maxParticipants}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {deal.timeLeft} left
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {deal.location}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(deal.participants / deal.maxParticipants) * 100}%`
                  }}
                ></div>
              </div>
              <button
                onClick={() => joinDeal(deal.id)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
              >
                Join Deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveDealsList;