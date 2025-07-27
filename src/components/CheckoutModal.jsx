import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, MapPin, User, Phone, X, Lock } from 'lucide-react';
import Loader from './Loader'; // Ensure this path is correct

// Initialize Stripe (use your publishable key)
// IMPORTANT: Replace 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE' with your actual Stripe Publishable Key!
// You can get this from your Stripe Dashboard (Developers -> API keys).
// Use a test key for development.
const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE'); 

const CheckoutModal = ({ isOpen, onClose, onSuccess, cartItems, total }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    // Card details (only relevant if paymentMethod is 'card')
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    // UPI details (only relevant if paymentMethod is 'upi')
    upiId: '' 
  });

  // Effect to log when the modal tries to render or closes
  useEffect(() => {
    if (isOpen) {
      console.log("CheckoutModal: Attempting to render. Current total:", total);
    } else {
      console.log("CheckoutModal: isOpen is false, hiding.");
    }
  }, [isOpen, total]);

  // If modal is not open, return null to not render anything
  if (!isOpen) {
    return null;
  }

  // Handle changes in form inputs
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Main function to handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Show loading spinner
    console.log("CheckoutModal: Attempting to process payment...");

    try {
      // --- Step 1: Validate Delivery Information ---
      if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
        alert("Please fill in all delivery information.");
        setLoading(false); // Hide loading
        return; // Stop execution
      }

      // --- Step 2: Validate Payment Method Specific Information ---
      if (paymentMethod === 'card') {
        if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
            alert("Please fill in all card details.");
            setLoading(false);
            return;
        }
      } else if (paymentMethod === 'upi') {
        if (!formData.upiId) {
            alert("Please enter your UPI ID.");
            setLoading(false);
            return;
        }
      }
      // COD has no extra fields to validate here

      // --- Step 3: Simulate Payment Processing ---
      // In a real application, you would send this data to your backend
      // for secure payment processing (e.g., with Stripe, Razorpay, etc.)
      console.log("CheckoutModal: Simulating payment processing delay (1.5 seconds)...");
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      if (paymentMethod === 'card') {
        console.log('CheckoutModal: Processing mock card payment...');
        const stripe = await stripePromise;
        if (!stripe) {
            // This error happens if loadStripe failed (e.g., bad API key, network issue)
            console.error("CheckoutModal: Stripe.js failed to load. Check your publishable key.");
            alert("Payment gateway not available. Please try again later.");
            setLoading(false);
            return;
        }
        // Mock Stripe payment details (in a real app, this would involve Stripe API calls)
        console.log('CheckoutModal: Mock Stripe payment details:', {
          amount: total * 100, // Stripe uses cents
          currency: 'inr',
          cardDetails: { number: formData.cardNumber, expiry: formData.expiryDate, cvv: formData.cvv, name: formData.cardName }
        });
      } else if (paymentMethod === 'upi') {
        console.log('CheckoutModal: Processing mock UPI payment...');
        console.log('CheckoutModal: Mock UPI payment details:', {
          amount: total,
          upiId: formData.upiId
        });
      } else if (paymentMethod === 'cod') {
        console.log('CheckoutModal: Cash on Delivery order placed');
      }

      // --- Step 4: Call Success Callback ---
      console.log("CheckoutModal: Payment mock successful, calling onSuccess().");
      onSuccess(); // This calls handleCheckoutSuccess in Cart.jsx
      
    } catch (error) {
      // Catch any unexpected errors during payment processing
      console.error('CheckoutModal: Payment failed:', error);
      alert('Payment failed. Please try again. Check console for details.');
    } finally {
      // This block always executes, whether success or failure
      setLoading(false); // Hide loading spinner
      console.log("CheckoutModal: Payment processing finished. Loading state set to false.");
    }
  };

  return (
    // Modal Overlay and Container
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
          <button
            onClick={onClose} // Closes the Checkout modal
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handlePayment} className="p-6 space-y-6">
          {/* Order Summary Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  {/* Robust price parsing: Ensures price is treated as a number */}
                  <span>₹{(parseFloat(String(item.price || '₹0').replace('₹', '').replace('/kg', '').trim()) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-green-600">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information Section */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Delivery Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phoneNum" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phoneNum"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Payment Method
            </h3>
            <div className="space-y-3">
              {/* Payment Method Selection Radios */}
              <div className="flex flex-wrap gap-4"> 
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Credit/Debit Card</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">UPI</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Cash on Delivery</span>
                </label>
              </div>

              {/* Card Payment Fields (conditionally rendered) */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required // Mark as required when card is selected
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required // Mark as required when card is selected
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required // Mark as required when card is selected
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required // Mark as required when card is selected
                    />
                  </div>
                </div>
              )}

              {/* UPI Payment Fields (conditionally rendered) */}
              {paymentMethod === 'upi' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    id="upiId"
                    name="upiId"
                    value={formData.upiId} // Access from formData
                    onChange={handleInputChange}
                    placeholder="yourname@paytm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required // Mark as required when UPI is selected
                  />
                </div>
              )}

              {/* Cash on Delivery Message (conditionally rendered) */}
              {paymentMethod === 'cod' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You will pay ₹{total.toFixed(2)} in cash when your order is delivered.
                    Please keep the exact amount ready.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Lock className="w-4 h-4 mr-2 text-blue-600" />
            Your payment information is secure and encrypted
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <Loader size="small" text="" /> // Show loader when processing
            ) : (
              `Place Order - ₹${total.toFixed(2)}` // Show total and "Place Order"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;