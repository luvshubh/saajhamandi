import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal'; // Ensure this path is correct

const Cart = ({ isOpen, onClose }) => {
  // Destructure functions and state from your CartContext
  const { items, updateQuantity, removeItem, getCartTotal, getCartCount, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false); // State to control CheckoutModal visibility

  // If cart is not open, don't render anything (important for performance and preventing layout shifts)
  if (!isOpen) {
    return null;
  }

  // This function is triggered when "Proceed to Checkout" is clicked in the Cart
  const handleCheckout = () => {
    console.log("Cart: handleCheckout called. Current items length:", items.length);

    // Prevent checkout if the cart is empty
    if (items.length === 0) {
      console.log("Cart: Cart is empty, not proceeding to checkout.");
      alert("Your cart is empty. Please add items before checking out."); // User-friendly alert
      return;
    }
    
    // Set state to true to open the CheckoutModal
    console.log("Cart: Setting showCheckout to true, opening CheckoutModal.");
    setShowCheckout(true);
  };

  // This function is passed to CheckoutModal and called upon successful (mock) payment
  const handleCheckoutSuccess = () => {
    console.log("Cart: Checkout successful callback received. Clearing cart and closing modals.");
    clearCart(); // Clears all items from the cart context
    setShowCheckout(false); // Closes the CheckoutModal
    onClose(); // Calls the parent's onClose to close the CartModal itself
    alert('Order placed successfully! You will receive a confirmation shortly.'); // Confirmation message to the user
  };

  return (
    <>
      {/* Overlay and Cart Modal Container */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <ShoppingCart className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">
                Cart ({getCartCount()}) {/* Displays item count */}
              </h2>
            </div>
            <button
              onClick={onClose} // Closes the Cart modal
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Close cart" // Accessibility
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              // Display if cart is empty
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
              </div>
            ) : (
              // Display items if cart is not empty
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id} // Unique key for list rendering
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-200 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-green-600 font-semibold">{item.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                          aria-label={`Decrease quantity of ${item.name}`}
                          disabled={item.quantity <= 1} // Disable if quantity is 1 to prevent going below 1
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer (only visible if items are present) */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{getCartTotal().toFixed(2)} {/* Displays total price */}
                </span>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleCheckout} // Triggers checkout process
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart} // Clears the entire cart
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal (conditionally rendered) */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => {
            console.log("Cart: Closing Checkout Modal via its onClose.");
            setShowCheckout(false); // Closes the CheckoutModal
          }}
          onSuccess={handleCheckoutSuccess} // Passes the success callback
          cartItems={items}
          total={getCartTotal()}
        />
      )}
    </>
  );
};

export default Cart;