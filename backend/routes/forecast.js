const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock weather and market data for price forecasting
const mockMarketData = {
  'tomatoes': {
    basePrice: 30,
    volatility: 0.15,
    seasonalFactor: 1.1,
    demandFactor: 1.05
  },
  'onions': {
    basePrice: 25,
    volatility: 0.20,
    seasonalFactor: 0.95,
    demandFactor: 1.02
  },
  'rice': {
    basePrice: 48,
    volatility: 0.08,
    seasonalFactor: 1.15,
    demandFactor: 1.08
  },
  'wheat': {
    basePrice: 22,
    volatility: 0.10,
    seasonalFactor: 1.05,
    demandFactor: 1.03
  }
};

const cityFactors = {
  'delhi': 1.1,
  'mumbai': 1.15,
  'bangalore': 1.08,
  'chennai': 1.05,
  'kolkata': 1.02,
  'hyderabad': 1.06,
  'pune': 1.09,
  'ahmedabad': 1.04
};

// Generate price forecast
const generateForecast = (item, city) => {
  const itemKey = item.toLowerCase().replace(/\s+/g, '');
  const cityKey = city.toLowerCase();
  
  const marketData = mockMarketData[itemKey] || mockMarketData['tomatoes'];
  const cityFactor = cityFactors[cityKey] || 1.0;
  
  const currentPrice = Math.round(marketData.basePrice * cityFactor);
  
  // Generate 7-day forecast
  const forecast = [];
  let price = currentPrice;
  
  for (let i = 0; i < 7; i++) {
    // Add some randomness and trends
    const dailyChange = (Math.random() - 0.5) * marketData.volatility * 2;
    const seasonalEffect = marketData.seasonalFactor * (1 + Math.sin(i / 7 * Math.PI) * 0.1);
    const demandEffect = marketData.demandFactor * (1 + Math.cos(i / 7 * Math.PI) * 0.05);
    
    price = Math.round(price * (1 + dailyChange) * seasonalEffect * demandEffect / marketData.seasonalFactor / marketData.demandFactor);
    
    forecast.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: Math.max(price, Math.round(currentPrice * 0.7)), // Minimum 70% of current price
      confidence: Math.max(95 - i * 5, 60) // Decreasing confidence over time
    });
  }
  
  return {
    currentPrice,
    forecast,
    trend: forecast[6].price > currentPrice ? 'increasing' : 
           forecast[6].price < currentPrice ? 'decreasing' : 'stable'
  };
};

// Get price forecast
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { item, city } = req.body;
    
    if (!item || !city) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both item and city are required'
      });
    }
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const forecastData = generateForecast(item, city);
    
    // Generate factors affecting price
    const factors = [
      'Seasonal demand patterns',
      'Weather conditions',
      'Transportation costs',
      'Market supply levels',
      'Festival season impact',
      'Regional demand variations'
    ];
    
    // Randomly select 3-4 factors
    const selectedFactors = factors
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 3);
    
    const response = {
      item: item,
      city: city,
      currentPrice: `₹${forecastData.currentPrice}/kg`,
      forecastPrice: `₹${forecastData.forecast[6].price}/kg`,
      trend: forecastData.trend,
      confidence: Math.round(forecastData.forecast.reduce((sum, day) => sum + day.confidence, 0) / 7),
      factors: selectedFactors,
      forecast: forecastData.forecast.map(day => ({
        ...day,
        price: `₹${day.price}/kg`
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'SaajhaMandi-Forecast-AI-v1.0',
        dataPoints: 1247,
        lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({
      error: 'Failed to generate forecast',
      message: 'An error occurred while generating price forecast'
    });
  }
});

// Get historical price data
router.get('/history/:item/:city', authenticateToken, async (req, res) => {
  try {
    const { item, city } = req.params;
    const { days = 30 } = req.query;
    
    const forecastData = generateForecast(item, city);
    const history = [];
    
    // Generate historical data (going backwards)
    let price = forecastData.currentPrice;
    for (let i = parseInt(days); i > 0; i--) {
      const dailyChange = (Math.random() - 0.5) * 0.1;
      price = Math.round(price * (1 + dailyChange));
      
      history.unshift({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: `₹${Math.max(price, Math.round(forecastData.currentPrice * 0.5))}/kg`,
        volume: Math.floor(Math.random() * 1000) + 500 // kg traded
      });
    }
    
    res.json({
      item,
      city,
      period: `${days} days`,
      history,
      statistics: {
        avgPrice: `₹${Math.round(history.reduce((sum, day) => sum + parseInt(day.price.replace('₹', '').replace('/kg', '')), 0) / history.length)}/kg`,
        minPrice: `₹${Math.min(...history.map(day => parseInt(day.price.replace('₹', '').replace('/kg', ''))))}/kg`,
        maxPrice: `₹${Math.max(...history.map(day => parseInt(day.price.replace('₹', '').replace('/kg', ''))))}/kg`,
        totalVolume: `${history.reduce((sum, day) => sum + day.volume, 0)}kg`
      }
    });
  } catch (error) {
    console.error('Price history error:', error);
    res.status(500).json({
      error: 'Failed to fetch price history',
      message: 'An error occurred while fetching price history'
    });
  }
});

module.exports = router;