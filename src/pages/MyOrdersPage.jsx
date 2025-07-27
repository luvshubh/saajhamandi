import React, { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, Phone, Eye, Search, Filter, RefreshCw } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import { ordersAPI } from '../services/api';
import Loader from '../components/Loader';
import OrderDetailsModal from '../components/OrderDetailsModal';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'processing', label: 'Processing' },
    { value: 'in transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data?.orders || []);
      setFilteredOrders(response.data?.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data if API fails
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Generate mock orders for fallback
  const generateMockOrders = () => {
    const statuses = ['processing', 'in transit', 'delivered', 'cancelled'];
    const suppliers = [
      { name: 'Ramesh Vegetables', phone: '+91 98765 43210', location: 'Azadpur Mandi, Delhi' },
      { name: 'Delhi Fresh Market', phone: '+91 98765 43211', location: 'Ghazipur Mandi, Delhi' },
      { name: 'Green Valley Wholesale', phone: '+91 98765 43212', location: 'Okhla Mandi, Delhi' }
    ];
    
    return Array.from({ length: 5 }, (_, i) => ({
      id: `ORD-${1000 + i}`,
      date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: statuses[i % statuses.length],
      total: `₹${Math.floor(Math.random() * 5000) + 1000}`,
      items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        name: ['Fresh Tomatoes', 'Onions', 'Potatoes', 'Basmati Rice', 'Wheat Flour'][j],
        quantity: `${Math.floor(Math.random() * 10) + 1}${j < 3 ? 'kg' : 'packets'}`,
        price: `₹${Math.floor(Math.random() * 500) + 100}`
      })),
      supplier: suppliers[i % suppliers.length],
      deliveryAddress: 'Shop 45, Connaught Place, New Delhi'
    }));
  };

  // Filter orders based on search and status
  const filterOrders = () => {
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.supplier.name.toLowerCase().includes(term) ||
        order.items.some(item => item.name.toLowerCase().includes(term))
    )}
    
    setFilteredOrders(result);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      await ordersAPI.cancelOrder(orderId);
      fetchOrders(); // Refresh orders after cancellation
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  // Handle reorder
  const handleReorder = (order) => {
    // Implement reorder logic
    console.log('Reorder:', order);
  };

  // Initialize
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters when search or status changes
  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'in transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loader text="Loading your orders..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with search and filter */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage your orders</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order.id}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(order.date)}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-lg font-bold text-gray-800 mt-2">
                    {order.total}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    Items ({order.items.length})
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          {item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supplier & Delivery Info */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Supplier & Delivery</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {order.supplier.name}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Phone className="w-4 h-4 mr-1" />
                        {order.supplier.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {order.supplier.location}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Delivery Address:</p>
                      <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetailsModal(true);
                  }}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </button>
                <div className="flex space-x-3">
                  {order.status.toLowerCase() === 'processing' && (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button 
                    onClick={() => handleReorder(order)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No matching orders' : 'No orders yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start shopping to see your orders here'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowDetailsModal(false)}
          onCancel={handleCancelOrder}
          onReorder={handleReorder}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;