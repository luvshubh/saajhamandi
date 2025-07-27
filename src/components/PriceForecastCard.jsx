import React, { useState } from 'react';
import { TrendingUp, MapPin, Calendar } from 'lucide-react';
import { forecastAPI } from '../services/api';
import Loader from './Loader';

const PriceForecastCard = () => {
  const [item, setItem] = useState('');
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || !city) return;

    try {
      setLoading(true);
      const response = await forecastAPI.getPriceForecast(item, city);
      // Mock data if API is not available
      const mockForecast = {
        item,
        city,
        currentPrice: '₹30/kg',
        forecastPrice: '₹35/kg',
        trend: 'increasing',
        confidence: 87,
        factors: ['Seasonal demand', 'Transportation costs', 'Market supply']
      };
      setForecast(response.data || mockForecast);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      // Use mock data on error
      setForecast({
        item,
        city,
        currentPrice: '₹30/kg',
        forecastPrice: '₹35/kg',
        trend: 'increasing',
        confidence: 87,
        factors: ['Seasonal demand', 'Transportation costs', 'Market supply']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Price Forecast
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Next 7 Days
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="e.g., Tomatoes, Onions, Rice"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline-block w-4 h-4 mr-1" />
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Delhi, Mumbai, Bangalore"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? <Loader size="small" text="" /> : 'Get Price Forecast'}
        </button>
      </form>

      {forecast && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-800">
              {forecast.item} in {forecast.city}
            </h4>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="text-lg font-semibold text-gray-800">
                {forecast.currentPrice}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Predicted Price</p>
              <p className={`text-lg font-semibold ${
                forecast.trend === 'increasing' ? 'text-red-600' : 
                forecast.trend === 'decreasing' ? 'text-green-600' : 'text-gray-800'
              }`}>
                {forecast.forecastPrice}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Confidence: {forecast.confidence}%
            </span>
            <span className={`font-medium ${
              forecast.trend === 'increasing' ? 'text-red-600' : 
              forecast.trend === 'decreasing' ? 'text-green-600' : 'text-gray-600'
            }`}>
              {forecast.trend === 'increasing' ? '↗ Rising' : 
               forecast.trend === 'decreasing' ? '↘ Falling' : '→ Stable'}
            </span>
          </div>

          {forecast.factors && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Key Factors:</p>
              <div className="flex flex-wrap gap-1">
                {forecast.factors.map((factor, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceForecastCard;