const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock orders for development (when database is not available)
let mockOrders = [
  {
    id: 'ORD-001',
    userId: 'mock-user-id',
    date: '2024-01-15',
    status: 'Delivered',
    total: 2450,
    items: [
      { name: 'Fresh Tomatoes', quantity: '10kg', price: '₹300' },
      { name: 'Green Chilies', quantity: '2kg', price: '₹160' },
      { name: 'Onions', quantity: '15kg', price: '₹375' },
      { name: 'Potatoes', quantity: '8kg', price: '₹200' }
    ],
    supplier: {
      name: 'Ramesh Vegetables',
      phone: '+91 98765 43210',
      location: 'Azadpur Mandi, Delhi'
    },
    deliveryAddress: 'Shop 45, Connaught Place, New Delhi',
    paymentMethod: 'upi',
    paymentStatus: 'Paid'
  },
  {
    id: 'ORD-002',
    userId: 'mock-user-id',
    date: '2024-01-18',
    status: 'In Transit',
    total: 1800,
    items: [
      { name: 'Basmati Rice', quantity: '25kg', price: '₹1,200' },
      { name: 'Wheat Flour', quantity: '10kg', price: '₹600' }
    ],
    supplier: {
      name: 'Delhi Fresh Market',
      phone: '+91 98765 43211',
      location: 'Ghazipur Mandi, Delhi'
    },
    deliveryAddress: 'Shop 45, Connaught Place, New Delhi',
    paymentMethod: 'card',
    paymentStatus: 'Paid'
  },
  {
    id: 'ORD-003',
    userId: 'mock-user-id',
    date: '2024-01-20',
    status: 'Processing',
    total: 950,
    items: [
      { name: 'Mixed Fruits', quantity: '5kg', price: '₹450' },
      { name: 'Green Vegetables', quantity: '8kg', price: '₹500' }
    ],
    supplier: {
      name: 'Green Valley Wholesale',
      phone: '+91 98765 43212',
      location: 'Okhla Mandi, Delhi'
    },
    deliveryAddress: 'Shop 45, Connaught Place, New Delhi',
    paymentMethod: 'cod',
    paymentStatus: 'Pending'
  }
];

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const userId = req.user._id;
    
    let orders;
    
    try {
      // Try to fetch from database
      let query = { userId };
      if (status) {
        query.status = status;
      }
      
      orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
        
      // Convert to expected format
      orders = orders.map(order => ({
        id: order.orderId,
        date: order.createdAt.toISOString().split('T')[0],
        status: order.status,
        total: `₹${order.total}`,
        items: order.items,
        supplier: order.supplier,
        deliveryAddress: order.deliveryAddress.address,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus
      }));
    } catch (dbError) {
      console.log('Database not available, using mock data');
      // Use mock data if database is not available
      orders = mockOrders.filter(order => {
        if (status && order.status.toLowerCase() !== status.toLowerCase()) {
          return false;
        }
        return true;
      });
      
      // Apply pagination to mock data
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      orders = orders.slice(startIndex, startIndex + parseInt(limit));
      
      // Format total as string for consistency
      orders = orders.map(order => ({
        ...order,
        total: typeof order.total === 'number' ? `₹${order.total}` : order.total
      }));
    }
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.length
      },
      metadata: {
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'An error occurred while fetching your orders'
    });
  }
});

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      items,
      total,
      deliveryAddress,
      paymentMethod,
      supplier,
      notes
    } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid items',
        message: 'Please provide at least one item'
      });
    }
    
    if (!total || total <= 0) {
      return res.status(400).json({
        error: 'Invalid total',
        message: 'Please provide a valid total amount'
      });
    }
    
    if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.address) {
      return res.status(400).json({
        error: 'Invalid delivery address',
        message: 'Please provide complete delivery address'
      });
    }
    
    if (!paymentMethod || !['card', 'upi', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({
        error: 'Invalid payment method',
        message: 'Please select a valid payment method'
      });
    }
    
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Assign a random supplier if not provided
    const defaultSuppliers = [
      { name: 'Ramesh Vegetables', phone: '+91 98765 43210', location: 'Azadpur Mandi, Delhi' },
      { name: 'Delhi Fresh Market', phone: '+91 98765 43211', location: 'Ghazipur Mandi, Delhi' },
      { name: 'Green Valley Wholesale', phone: '+91 98765 43212', location: 'Okhla Mandi, Delhi' }
    ];
    
    const orderSupplier = supplier || defaultSuppliers[Math.floor(Math.random() * defaultSuppliers.length)];
    
    const orderData = {
      orderId,
      userId: req.user._id,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity || '1kg',
        price: item.price || '₹0',
        category: item.category || 'general'
      })),
      total: parseFloat(total),
      status: 'Processing',
      supplier: orderSupplier,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      notes: notes || ''
    };
    
    let savedOrder;
    
    try {
      // Try to save to database
      const order = new Order(orderData);
      savedOrder = await order.save();
    } catch (dbError) {
      console.log('Database not available, using mock storage');
      // Add to mock orders if database is not available
      const mockOrder = {
        ...orderData,
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        deliveryAddress: deliveryAddress.address
      };
      mockOrders.unshift(mockOrder);
      savedOrder = mockOrder;
    }
    
    // Simulate payment processing for card/UPI
    if (paymentMethod !== 'cod') {
      // Mock payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: savedOrder.orderId || savedOrder.id,
        status: savedOrder.status,
        total: `₹${savedOrder.total}`,
        estimatedDelivery: savedOrder.estimatedDelivery,
        paymentStatus: savedOrder.paymentStatus,
        supplier: savedOrder.supplier
      },
      nextSteps: paymentMethod === 'cod' 
        ? ['Order confirmed', 'Supplier will contact you', 'Prepare cash for delivery']
        : ['Payment processed', 'Order confirmed', 'Supplier will contact you']
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: 'An error occurred while creating your order'
    });
  }
});

// Get order details
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    let order;
    
    try {
      // Try to fetch from database
      order = await Order.findOne({ orderId, userId });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      // Use mock data if database is not available
      order = mockOrders.find(o => o.id === orderId);
    }
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist or does not belong to you'
      });
    }
    
    // Format order for response
    const formattedOrder = {
      id: order.orderId || order.id,
      date: order.createdAt ? order.createdAt.toISOString().split('T')[0] : order.date,
      status: order.status,
      total: typeof order.total === 'number' ? `₹${order.total}` : order.total,
      items: order.items,
      supplier: order.supplier,
      deliveryAddress: order.deliveryAddress?.address || order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery,
      notes: order.notes,
      timeline: [
        { status: 'Order Placed', date: order.createdAt || order.date, completed: true },
        { status: 'Processing', date: null, completed: order.status !== 'Processing' },
        { status: 'In Transit', date: null, completed: ['In Transit', 'Delivered'].includes(order.status) },
        { status: 'Delivered', date: order.actualDelivery, completed: order.status === 'Delivered' }
      ]
    };
    
    res.json({
      order: formattedOrder
    });
  } catch (error) {
    console.error('Order details error:', error);
    res.status(500).json({
      error: 'Failed to fetch order details',
      message: 'An error occurred while fetching order details'
    });
  }
});

// Update order status (for suppliers/admin)
router.patch('/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['Processing', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Please provide a valid order status'
      });
    }
    
    let order;
    
    try {
      // Try to update in database
      order = await Order.findOneAndUpdate(
        { orderId },
        { 
          status, 
          notes: notes || '',
          ...(status === 'Delivered' && { actualDelivery: new Date() })
        },
        { new: true }
      );
    } catch (dbError) {
      console.log('Database not available, updating mock data');
      // Update mock data if database is not available
      const orderIndex = mockOrders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        mockOrders[orderIndex].status = status;
        if (notes) mockOrders[orderIndex].notes = notes;
        order = mockOrders[orderIndex];
      }
    }
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }
    
    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order.orderId || order.id,
        status: order.status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: 'An error occurred while updating order status'
    });
  }
});

// Cancel order
router.delete('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    let order;
    
    try {
      // Try to find and update in database
      order = await Order.findOne({ orderId, userId });
      
      if (order && ['Processing', 'Confirmed'].includes(order.status)) {
        order.status = 'Cancelled';
        await order.save();
      }
    } catch (dbError) {
      console.log('Database not available, updating mock data');
      // Update mock data if database is not available
      const orderIndex = mockOrders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1 && ['Processing', 'Confirmed'].includes(mockOrders[orderIndex].status)) {
        mockOrders[orderIndex].status = 'Cancelled';
        order = mockOrders[orderIndex];
      }
    }
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found or cannot be cancelled',
        message: 'The order does not exist or is not in a cancellable state'
      });
    }
    
    res.json({
      message: 'Order cancelled successfully',
      order: {
        id: order.orderId || order.id,
        status: 'Cancelled',
        refundInfo: order.paymentStatus === 'Paid' ? 'Refund will be processed within 3-5 business days' : null
      }
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: 'An error occurred while cancelling the order'
    });
  }
});

module.exports = router;