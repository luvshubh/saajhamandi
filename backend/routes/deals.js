const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock deals database
const mockDeals = [
  {
    id: 1,
    title: 'Group Buy: Premium Basmati Rice',
    description: '25kg bags at wholesale prices. Perfect for restaurants and bulk buyers.',
    type: 'group_buy',
    category: 'grains',
    product: {
      name: 'Premium Basmati Rice',
      brand: 'Golden Harvest',
      unit: '25kg bag',
      quality: 'Grade A+'
    },
    pricing: {
      originalPrice: 1500,
      dealPrice: 1200,
      discount: 20,
      currency: 'INR'
    },
    participants: {
      current: 8,
      required: 10,
      maximum: 15
    },
    timeline: {
      startDate: '2024-01-20T00:00:00Z',
      endDate: '2024-01-25T23:59:59Z',
      deliveryDate: '2024-01-28T00:00:00Z'
    },
    location: {
      city: 'Delhi',
      area: 'NCR',
      deliveryRadius: 25
    },
    supplier: {
      name: 'Rice Traders Co.',
      rating: 4.6,
      phone: '+91 98765 43220'
    },
    terms: {
      minQuantity: 1,
      maxQuantity: 5,
      paymentAdvance: 50,
      cancellationPolicy: '24 hours before delivery'
    },
    status: 'active',
    tags: ['bulk', 'premium', 'restaurant-grade']
  },
  {
    id: 2,
    title: 'Flash Sale: Fresh Vegetables',
    description: 'Mixed vegetables combo pack with seasonal produce at discounted rates.',
    type: 'flash_sale',
    category: 'vegetables',
    product: {
      name: 'Mixed Vegetables Combo',
      contents: ['Tomatoes 5kg', 'Onions 3kg', 'Potatoes 5kg', 'Green Chilies 1kg'],
      unit: 'combo pack',
      quality: 'Farm Fresh'
    },
    pricing: {
      originalPrice: 400,
      dealPrice: 300,
      discount: 25,
      currency: 'INR'
    },
    participants: {
      current: 15,
      required: 20,
      maximum: 50
    },
    timeline: {
      startDate: '2024-01-22T06:00:00Z',
      endDate: '2024-01-22T18:00:00Z',
      deliveryDate: '2024-01-23T00:00:00Z'
    },
    location: {
      city: 'Mumbai',
      area: 'Western Suburbs',
      deliveryRadius: 15
    },
    supplier: {
      name: 'Fresh Farm Direct',
      rating: 4.3,
      phone: '+91 98765 43221'
    },
    terms: {
      minQuantity: 1,
      maxQuantity: 10,
      paymentAdvance: 100,
      cancellationPolicy: 'No cancellation after booking'
    },
    status: 'active',
    tags: ['flash-sale', 'combo', 'farm-fresh']
  },
  {
    id: 3,
    title: 'Seasonal Offer: Winter Fruits',
    description: 'Premium winter fruits combo including apples, oranges, and pomegranates.',
    type: 'seasonal',
    category: 'fruits',
    product: {
      name: 'Winter Fruits Premium Box',
      contents: ['Apples 3kg', 'Oranges 3kg', 'Pomegranates 2kg'],
      unit: 'gift box',
      quality: 'Export Quality'
    },
    pricing: {
      originalPrice: 600,
      dealPrice: 450,
      discount: 25,
      currency: 'INR'
    },
    participants: {
      current: 12,
      required: 15,
      maximum: 30
    },
    timeline: {
      startDate: '2024-01-21T00:00:00Z',
      endDate: '2024-01-26T23:59:59Z',
      deliveryDate: '2024-01-29T00:00:00Z'
    },
    location: {
      city: 'Bangalore',
      area: 'All Areas',
      deliveryRadius: 30
    },
    supplier: {
      name: 'Himalayan Fruits Co.',
      rating: 4.8,
      phone: '+91 98765 43222'
    },
    terms: {
      minQuantity: 1,
      maxQuantity: 5,
      paymentAdvance: 30,
      cancellationPolicy: '48 hours before delivery'
    },
    status: 'active',
    tags: ['seasonal', 'premium', 'gift-box']
  },
  {
    id: 4,
    title: 'Bulk Deal: Cooking Oil',
    description: 'Refined sunflower oil in 15L containers at wholesale rates.',
    type: 'bulk_deal',
    category: 'oils',
    product: {
      name: 'Refined Sunflower Oil',
      brand: 'Golden Drop',
      unit: '15L container',
      quality: 'Refined'
    },
    pricing: {
      originalPrice: 1800,
      dealPrice: 1500,
      discount: 17,
      currency: 'INR'
    },
    participants: {
      current: 6,
      required: 8,
      maximum: 12
    },
    timeline: {
      startDate: '2024-01-19T00:00:00Z',
      endDate: '2024-01-24T23:59:59Z',
      deliveryDate: '2024-01-27T00:00:00Z'
    },
    location: {
      city: 'Chennai',
      area: 'All Areas',
      deliveryRadius: 20
    },
    supplier: {
      name: 'Oil Mills Direct',
      rating: 4.4,
      phone: '+91 98765 43223'
    },
    terms: {
      minQuantity: 1,
      maxQuantity: 3,
      paymentAdvance: 40,
      cancellationPolicy: '72 hours before delivery'
    },
    status: 'active',
    tags: ['bulk', 'cooking-oil', 'wholesale']
  }
];

// Get all active deals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, city, type, limit = 10 } = req.query;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filteredDeals = mockDeals.filter(deal => deal.status === 'active');
    
    // Apply filters
    if (category) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (city) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.location.city.toLowerCase() === city.toLowerCase()
      );
    }
    
    if (type) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    // Limit results
    filteredDeals = filteredDeals.slice(0, parseInt(limit));
    
    // Add computed fields
    const enrichedDeals = filteredDeals.map(deal => {
      const now = new Date();
      const endDate = new Date(deal.timeline.endDate);
      const timeLeft = Math.max(0, endDate - now);
      
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      let timeLeftString;
      if (days > 0) {
        timeLeftString = `${days} day${days > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        timeLeftString = `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        timeLeftString = 'Less than 1 hour';
      }
      
      return {
        id: deal.id,
        title: deal.title,
        description: deal.description,
        price: `₹${deal.pricing.dealPrice}/${deal.product.unit}`,
        originalPrice: `₹${deal.pricing.originalPrice}/${deal.product.unit}`,
        discount: `${deal.pricing.discount}%`,
        participants: deal.participants.current,
        maxParticipants: deal.participants.maximum,
        timeLeft: timeLeftString,
        location: deal.location.city,
        category: deal.category,
        type: deal.type,
        supplier: deal.supplier.name,
        rating: deal.supplier.rating,
        progress: Math.round((deal.participants.current / deal.participants.required) * 100),
        canJoin: deal.participants.current < deal.participants.maximum && timeLeft > 0,
        tags: deal.tags
      };
    });
    
    res.json({
      deals: enrichedDeals,
      metadata: {
        total: enrichedDeals.length,
        filters: { category, city, type },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Deals fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch deals',
      message: 'An error occurred while fetching active deals'
    });
  }
});

// Get deal details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deal = mockDeals.find(d => d.id === parseInt(id));
    
    if (!deal) {
      return res.status(404).json({
        error: 'Deal not found',
        message: 'The requested deal does not exist'
      });
    }
    
    // Add computed fields and detailed information
    const now = new Date();
    const endDate = new Date(deal.timeline.endDate);
    const timeLeft = Math.max(0, endDate - now);
    
    const detailedDeal = {
      ...deal,
      pricing: {
        ...deal.pricing,
        originalPrice: `₹${deal.pricing.originalPrice}`,
        dealPrice: `₹${deal.pricing.dealPrice}`,
        savings: `₹${deal.pricing.originalPrice - deal.pricing.dealPrice}`,
        discount: `${deal.pricing.discount}%`
      },
      timeline: {
        ...deal.timeline,
        timeLeft: timeLeft,
        isExpired: timeLeft <= 0,
        daysLeft: Math.floor(timeLeft / (1000 * 60 * 60 * 24))
      },
      progress: {
        percentage: Math.round((deal.participants.current / deal.participants.required) * 100),
        needed: Math.max(0, deal.participants.required - deal.participants.current),
        canJoin: deal.participants.current < deal.participants.maximum && timeLeft > 0
      },
      estimatedSavings: `₹${(deal.pricing.originalPrice - deal.pricing.dealPrice) * deal.participants.current}`,
      deliveryInfo: {
        estimatedDate: deal.timeline.deliveryDate,
        area: deal.location.area,
        radius: `${deal.location.deliveryRadius}km`
      }
    };
    
    res.json({
      deal: detailedDeal
    });
  } catch (error) {
    console.error('Deal details error:', error);
    res.status(500).json({
      error: 'Failed to fetch deal details',
      message: 'An error occurred while fetching deal details'
    });
  }
});

// Join a deal
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    
    const deal = mockDeals.find(d => d.id === parseInt(id));
    
    if (!deal) {
      return res.status(404).json({
        error: 'Deal not found',
        message: 'The requested deal does not exist'
      });
    }
    
    // Check if deal is still active
    const now = new Date();
    const endDate = new Date(deal.timeline.endDate);
    
    if (now > endDate) {
      return res.status(400).json({
        error: 'Deal expired',
        message: 'This deal has already expired'
      });
    }
    
    // Check if deal has space
    if (deal.participants.current >= deal.participants.maximum) {
      return res.status(400).json({
        error: 'Deal full',
        message: 'This deal has reached maximum participants'
      });
    }
    
    // Validate quantity
    if (quantity < deal.terms.minQuantity || quantity > deal.terms.maxQuantity) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: `Quantity must be between ${deal.terms.minQuantity} and ${deal.terms.maxQuantity}`
      });
    }
    
    // Simulate joining the deal
    deal.participants.current += 1;
    
    const totalAmount = deal.pricing.dealPrice * quantity;
    const advanceAmount = Math.round(totalAmount * deal.terms.paymentAdvance / 100);
    
    res.json({
      message: 'Successfully joined the deal!',
      dealId: deal.id,
      quantity,
      pricing: {
        unitPrice: `₹${deal.pricing.dealPrice}`,
        totalAmount: `₹${totalAmount}`,
        advanceRequired: `₹${advanceAmount}`,
        balanceAmount: `₹${totalAmount - advanceAmount}`
      },
      deliveryDate: deal.timeline.deliveryDate,
      supplier: deal.supplier,
      orderReference: `DEAL-${deal.id}-${Date.now()}`
    });
  } catch (error) {
    console.error('Join deal error:', error);
    res.status(500).json({
      error: 'Failed to join deal',
      message: 'An error occurred while joining the deal'
    });
  }
});

module.exports = router;