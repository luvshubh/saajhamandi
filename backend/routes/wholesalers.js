const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock wholesaler database
const mockWholesalers = [
  {
    id: 1,
    name: 'Ramesh Vegetables',
    phone: '+91 98765 43210',
    email: 'ramesh@vegetables.com',
    location: {
      address: 'Shop 45, Azadpur Mandi',
      city: 'Delhi',
      coordinates: { lat: 28.7041, lng: 77.1025 }
    },
    distance: 2.3,
    rating: 4.5,
    reviewCount: 127,
    specialties: ['Vegetables', 'Fruits', 'Leafy Greens'],
    categories: ['vegetables', 'fruits'],
    minOrder: 500,
    deliveryTime: '2-4 hours',
    paymentMethods: ['cash', 'upi', 'card'],
    businessHours: {
      open: '05:00',
      close: '20:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    products: [
      { name: 'Tomatoes', price: 28, unit: 'kg', availability: 'high' },
      { name: 'Onions', price: 23, unit: 'kg', availability: 'medium' },
      { name: 'Potatoes', price: 20, unit: 'kg', availability: 'high' }
    ]
  },
  {
    id: 2,
    name: 'Delhi Fresh Market',
    phone: '+91 98765 43211',
    email: 'info@delhifresh.com',
    location: {
      address: 'Block B, Ghazipur Mandi',
      city: 'Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    distance: 3.1,
    rating: 4.2,
    reviewCount: 89,
    specialties: ['Grains', 'Pulses', 'Spices'],
    categories: ['grains', 'pulses', 'spices'],
    minOrder: 1000,
    deliveryTime: '3-5 hours',
    paymentMethods: ['cash', 'upi'],
    businessHours: {
      open: '06:00',
      close: '19:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    products: [
      { name: 'Basmati Rice', price: 45, unit: 'kg', availability: 'high' },
      { name: 'Wheat Flour', price: 35, unit: 'kg', availability: 'high' },
      { name: 'Toor Dal', price: 85, unit: 'kg', availability: 'medium' }
    ]
  },
  {
    id: 3,
    name: 'Green Valley Wholesale',
    phone: '+91 98765 43212',
    email: 'orders@greenvalley.com',
    location: {
      address: 'Sector 12, Okhla Mandi',
      city: 'Delhi',
      coordinates: { lat: 28.5355, lng: 77.2503 }
    },
    distance: 4.5,
    rating: 4.7,
    reviewCount: 203,
    specialties: ['Organic Produce', 'Premium Vegetables'],
    categories: ['vegetables', 'organic'],
    minOrder: 750,
    deliveryTime: '4-6 hours',
    paymentMethods: ['cash', 'upi', 'card', 'credit'],
    businessHours: {
      open: '05:30',
      close: '21:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    products: [
      { name: 'Organic Tomatoes', price: 45, unit: 'kg', availability: 'medium' },
      { name: 'Organic Spinach', price: 40, unit: 'kg', availability: 'high' },
      { name: 'Bell Peppers', price: 60, unit: 'kg', availability: 'low' }
    ]
  },
  {
    id: 4,
    name: 'Mumbai Spice Hub',
    phone: '+91 98765 43213',
    email: 'contact@spicehub.com',
    location: {
      address: 'Crawford Market, Mumbai',
      city: 'Mumbai',
      coordinates: { lat: 18.9667, lng: 72.8333 }
    },
    distance: 1.8,
    rating: 4.4,
    reviewCount: 156,
    specialties: ['Spices', 'Dry Fruits', 'Condiments'],
    categories: ['spices', 'dry-fruits'],
    minOrder: 500,
    deliveryTime: '2-3 hours',
    paymentMethods: ['cash', 'upi', 'card'],
    businessHours: {
      open: '07:00',
      close: '20:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    products: [
      { name: 'Turmeric Powder', price: 120, unit: 'kg', availability: 'high' },
      { name: 'Red Chili Powder', price: 150, unit: 'kg', availability: 'high' },
      { name: 'Garam Masala', price: 200, unit: 'kg', availability: 'medium' }
    ]
  }
];

// Match wholesalers based on required items
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid items',
        message: 'Please provide an array of items to match'
      });
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Normalize items for matching
    const normalizedItems = items.map(item => item.toLowerCase().trim());
    
    // Find matching wholesalers
    let matchingWholesalers = mockWholesalers.filter(wholesaler => {
      // Check if wholesaler has products that match the requested items
      const hasMatchingProducts = wholesaler.products.some(product =>
        normalizedItems.some(item => 
          product.name.toLowerCase().includes(item) || 
          item.includes(product.name.toLowerCase())
        )
      );
      
      // Check if wholesaler specializes in categories related to items
      const hasMatchingCategories = wholesaler.categories.some(category =>
        normalizedItems.some(item => {
          // Simple category matching logic
          if (category === 'vegetables' && (item.includes('tomato') || item.includes('onion') || item.includes('potato'))) return true;
          if (category === 'grains' && (item.includes('rice') || item.includes('wheat'))) return true;
          if (category === 'spices' && (item.includes('spice') || item.includes('masala'))) return true;
          return false;
        })
      );
      
      return hasMatchingProducts || hasMatchingCategories;
    });
    
    // If no specific matches, return top-rated wholesalers
    if (matchingWholesalers.length === 0) {
      matchingWholesalers = mockWholesalers.slice(0, 3);
    }
    
    // Sort by rating and distance
    matchingWholesalers.sort((a, b) => {
      const scoreA = (a.rating * 0.7) + ((10 - a.distance) * 0.3);
      const scoreB = (b.rating * 0.7) + ((10 - b.distance) * 0.3);
      return scoreB - scoreA;
    });
    
    // Add matching score and relevant products
    const enrichedWholesalers = matchingWholesalers.map(wholesaler => {
      const relevantProducts = wholesaler.products.filter(product =>
        normalizedItems.some(item => 
          product.name.toLowerCase().includes(item) || 
          item.includes(product.name.toLowerCase())
        )
      );
      
      const matchScore = Math.min(95, 60 + (relevantProducts.length * 10) + (wholesaler.rating * 5));
      
      return {
        ...wholesaler,
        location: `${wholesaler.distance} km away`,
        minOrder: `₹${wholesaler.minOrder}`,
        matchScore,
        relevantProducts: relevantProducts.length > 0 ? relevantProducts : wholesaler.products.slice(0, 3),
        estimatedTotal: `₹${Math.floor(Math.random() * 2000) + 1000}`,
        isOpen: isBusinessOpen(wholesaler.businessHours)
      };
    });
    
    res.json({
      wholesalers: enrichedWholesalers.slice(0, 5), // Return top 5 matches
      searchQuery: items,
      totalFound: enrichedWholesalers.length,
      metadata: {
        searchRadius: '10km',
        generatedAt: new Date().toISOString(),
        algorithm: 'SaajhaMandi-Match-v1.0'
      }
    });
  } catch (error) {
    console.error('Wholesaler matching error:', error);
    res.status(500).json({
      error: 'Failed to match wholesalers',
      message: 'An error occurred while finding matching wholesalers'
    });
  }
});

// Get wholesaler details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const wholesaler = mockWholesalers.find(w => w.id === parseInt(id));
    
    if (!wholesaler) {
      return res.status(404).json({
        error: 'Wholesaler not found',
        message: 'The requested wholesaler does not exist'
      });
    }
    
    // Add additional details
    const detailedWholesaler = {
      ...wholesaler,
      location: `${wholesaler.distance} km away`,
      minOrder: `₹${wholesaler.minOrder}`,
      isOpen: isBusinessOpen(wholesaler.businessHours),
      reviews: generateMockReviews(wholesaler.reviewCount),
      certifications: ['FSSAI Licensed', 'ISO 9001:2015', 'Organic Certified'],
      facilities: ['Cold Storage', 'Quality Testing', '24/7 Support'],
      paymentTerms: {
        advance: '20%',
        credit: '7 days',
        discount: '2% on advance payment'
      }
    };
    
    res.json({
      wholesaler: detailedWholesaler
    });
  } catch (error) {
    console.error('Wholesaler details error:', error);
    res.status(500).json({
      error: 'Failed to fetch wholesaler details',
      message: 'An error occurred while fetching wholesaler details'
    });
  }
});

// Helper function to check if business is open
function isBusinessOpen(businessHours) {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  if (!businessHours.days.includes(currentDay)) {
    return false;
  }
  
  return currentTime >= businessHours.open && currentTime <= businessHours.close;
}

// Helper function to generate mock reviews
function generateMockReviews(count) {
  const sampleReviews = [
    { rating: 5, comment: 'Excellent quality products and timely delivery!', author: 'Raj Kumar', date: '2024-01-15' },
    { rating: 4, comment: 'Good prices and fresh vegetables. Recommended!', author: 'Priya Sharma', date: '2024-01-12' },
    { rating: 5, comment: 'Very professional service. Will order again.', author: 'Mohammed Ali', date: '2024-01-10' },
    { rating: 4, comment: 'Quality is good but delivery could be faster.', author: 'Sunita Devi', date: '2024-01-08' }
  ];
  
  return sampleReviews.slice(0, Math.min(count, 4));
}

module.exports = router;