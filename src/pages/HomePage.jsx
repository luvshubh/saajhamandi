import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import SmartCart from '../components/SmartCart';
import PriceForecastCard from '../components/PriceForecastCard';
import WholesalerMatch from '../components/WholesalerMatch';
import ActiveDealsList from '../components/ActiveDealsList';
import { fetchDashboardData } from '../services/api';
import Loader from '../components/Loader';

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({});

  // Fetch dashboard data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Get user from localStorage
       const storedUser = localStorage.getItem('user');
       const userData = storedUser ? JSON.parse(storedUser) : {};
       setUser(userData);

        
        // Fetch dashboard data
        const data = await fetchDashboardData();
        setDashboardData(data);
        
        // Fallback to mock data if API returns empty
        if (!data) {
          setDashboardData(generateMockData());
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load dashboard data');
        setDashboardData(generateMockData()); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate mock data for fallback
  const generateMockData = () => {
    return {
      savings: Math.floor(Math.random() * 5000) + 1000,
      inventoryTurnover: Math.floor(Math.random() * 10) + 5,
      customerSatisfaction: Math.floor(Math.random() * 20) + 80,
      smartCartItems: [
        { id: 1, name: 'Tomatoes', quantity: '10kg', price: '₹300', predictedPrice: '₹280' },
        { id: 2, name: 'Onions', quantity: '15kg', price: '₹450', predictedPrice: '₹420' },
        { id: 3, name: 'Potatoes', quantity: '20kg', price: '₹600', predictedPrice: '₹550' }
      ],
      priceForecasts: [
        { product: 'Tomatoes', current: '₹30/kg', predicted: '₹28/kg', trend: 'down' },
        { product: 'Onions', current: '₹30/kg', predicted: '₹32/kg', trend: 'up' },
        { product: 'Potatoes', current: '₹30/kg', predicted: '₹27.5/kg', trend: 'down' }
      ],
      wholesalers: [
        { id: 1, name: 'Fresh Farms Co.', rating: 4.8, distance: '2km', bestFor: 'Vegetables' },
        { id: 2, name: 'Grain Masters', rating: 4.6, distance: '5km', bestFor: 'Grains & Pulses' }
      ],
      activeDeals: [
        { id: 1, product: 'Tomatoes', supplier: 'Veggie King', discount: '15%', expiry: '2h' },
        { id: 2, product: 'Onions', supplier: 'Farm Fresh', discount: '10%', expiry: '5h' }
      ]
    };
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loader text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error} (Showing sample data)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name || 'Vendor'}! 👋
            </h1>
            <p className="text-green-100 text-lg">
              Your AI market partner is ready to help you make smarter business decisions today.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">₹{dashboardData?.savings?.toLocaleString() || '3,450'}</div>
                <div className="text-sm text-green-100">Potential Savings</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">{dashboardData?.inventoryTurnover || '8'}x</div>
                <div className="text-sm text-green-100">Inventory Turnover</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">{dashboardData?.customerSatisfaction || '92'}%</div>
                <div className="text-sm text-green-100">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <SmartCart items={dashboardData?.smartCartItems || []} />
            <WholesalerMatch wholesalers={dashboardData?.wholesalers || []} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <PriceForecastCard forecasts={dashboardData?.priceForecasts || []} />
            <ActiveDealsList deals={dashboardData?.activeDeals || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;