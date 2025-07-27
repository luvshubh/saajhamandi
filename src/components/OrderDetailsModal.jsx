import React from 'react';
import { X, Package, Calendar, MapPin, Phone, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const OrderDetailsModal = ({ order, onClose, onCancel, onReorder }) => {
  if (!order) return null;

  // Get status icon and color
  const getStatusDetails = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: 'text-green-600' };
      case 'in transit':
        return { icon: <Truck className="w-5 h-5 text-blue-500" />, color: 'text-blue-600' };
      case 'processing':
        return { icon: <Clock className="w-5 h-5 text-yellow-500" />, color: 'text-yellow-600' };
      case 'cancelled':
        return { icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: 'text-red-600' };
      default:
        return { icon: <Clock className="w-5 h-5 text-gray-500" />, color: 'text-gray-600' };
    }
  };

  const statusDetails = getStatusDetails(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                <div className="flex items-center mt-1">
                  {statusDetails.icon}
                  <span className={`ml-2 font-medium ${statusDetails.color}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Order Date</p>
                <p className="font-medium">{new Date(order.date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-800">{order.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="text-xl font-bold text-gray-800">{order.items.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-500" />
              Ordered Items
            </h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-700">{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Supplier Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-800">{order.supplier.name}</p>
              <div className="flex items-center mt-2 text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{order.supplier.phone}</span>
              </div>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{order.supplier.location}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Delivery Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Delivery Address</p>
                  <p className="text-gray-600 mt-1">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3">
          {order.status.toLowerCase() === 'processing' && (
            <button
              onClick={() => {
                onCancel(order.id);
                onClose();
              }}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={() => {
              onReorder(order);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reorder
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;