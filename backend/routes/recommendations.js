const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock AI recommendations data
const mockRecommendations = [
  {
    id: 1,
    name: 'Fresh Tomatoes',
    price: '₹30/kg',
    confidence: 95,
    trend: 'up',
    reason: 'High demand in your area',
    category: 'vegetables',
    supplier: 'Ramesh Vegetables',
    estimatedProfit: '25%'
  },
  {
    id: 2,
    name: 'Green Chilies',
    price: '₹80/kg',
    confidence: 88,
    trend: 'up',
    reason: 'Seasonal price increase',
    category: 'vegetables',
    supplier: 'Delhi Fresh Market',
    estimatedProfit: '30%'
  },
  {
    id: 3,
    name: 'Onions',
    price: '₹25/kg',
    confidence: 82,
    trend: 'stable',
    reason: 'Consistent demand',
    category: 'vegetables',
    supplier: 'Green Valley Wholesale',
    estimatedProfit: '20%'
  },
  {
    id: 4,
    name: 'Basmati Rice',
    price: '₹48/kg',
    confidence: 90,
    trend: 'up',
    reason: 'Festival season approaching',
    category: 'grains',
    supplier: 'Rice Traders Co.',
    estimatedProfit: '15%'
  },
  {
    id: 5,
    name: 'Mixed Fruits',
    price: '₹90/kg',
    confidence: 85,
    trend: 'up',
    reason: 'Summer season demand',
    category: 'fruits',
    supplier: 'Fruit Paradise',
    estimatedProfit: '35%'
  }
];

// Get AI-powered recommendations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, limit = 5 } = req.query;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let recommendations = [...mockRecommendations];

    // Filter by category if provided
    if (category) {
      recommendations = recommendations.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Limit results
    recommendations = recommendations.slice(0, parseInt(limit));

    // Add user-specific data (mock personalization)
    recommendations = recommendations.map(item => ({
      ...item,
      personalizedScore: Math.floor(Math.random() * 20) + 80, // 80-100
      lastOrderedDays: Math.floor(Math.random() * 30) + 1, // 1-30 days ago
      avgSalesPerWeek: Math.floor(Math.random() * 50) + 10 // 10-60 kg per week
    }));

    res.json({
      recommendations,
      metadata: {
        total: recommendations.length,
        generatedAt: new Date().toISOString(),
        aiModel: 'SaajhaMandi-AI-v1.0',
        confidence: 'high'
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      error: 'Failed to fetch recommendations',
      message: 'An error occurred while generating recommendations'
    });
  }
});

// Get recommendation details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = mockRecommendations.find(item => item.id === parseInt(id));

    if (!recommendation) {
      return res.status(404).json({
        error: 'Recommendation not found',
        message: 'The requested recommendation does not exist'
      });
    }

    // Add detailed information
    const detailedRecommendation = {
      ...recommendation,
      details: {
        marketTrends: [
          'Prices increased by 12% in last week',
          'High demand from restaurants',
          'Limited supply due to weather conditions'
        ],
        competitorPrices: [
          { vendor: 'Local Market', price: '₹32/kg' },
          { vendor: 'Wholesale Hub', price: '₹28/kg' },
          { vendor: 'Direct Farmer', price: '₹26/kg' }
        ],
        qualityMetrics: {
          freshness: '95%',
          grade: 'A+',
          shelfLife: '5-7 days'
        },
        salesHistory: {
          lastWeek: '45kg',
          lastMonth: '180kg',
          avgProfit: '₹8/kg'
        }
      }
    };

    res.json({
      recommendation: detailedRecommendation
    });
  } catch (error) {
    console.error('Recommendation details error:', error);
    res.status(500).json({
      error: 'Failed to fetch recommendation details',
      message: 'An error occurred while fetching recommendation details'
    });
  }
});

module.exports = router;