import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Check, ArrowRight, CreditCard, ShoppingBag, Loader } from 'lucide-react';

const VoiceOrderPage = () => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Record, 2: Review, 3: Payment, 4: Success
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState(null);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);

  // Enhanced product database with categories, units, and variants
  const availableProducts = [
    { id: 1, name: "tomato", variants: ["tomatoes"], category: "vegetables", price: 50, unit: "kg", packageSizes: ["250g", "500g", "1kg", "2kg"] },
    { id: 2, name: "milk", variants: [], category: "dairy", price: 60, unit: "liter", packageSizes: ["500ml", "1 liter", "2 liters"] },
    { id: 3, name: "banana", variants: ["bananas"], category: "fruits", price: 30, unit: "dozen", packageSizes: ["1 piece", "half dozen", "1 dozen"] },
    { id: 4, name: "bread", variants: [], category: "bakery", price: 40, unit: "loaf", packageSizes: ["1 loaf", "2 loaves"] },
    { id: 5, name: "apple", variants: ["apples"], category: "fruits", price: 120, unit: "kg", packageSizes: ["500g", "1kg", "2kg"] },
    { id: 6, name: "potato", variants: ["potatoes"], category: "vegetables", price: 35, unit: "kg", packageSizes: ["1kg", "2kg", "5kg"] },
    { id: 7, name: "onion", variants: ["onions"], category: "vegetables", price: 25, unit: "kg", packageSizes: ["500g", "1kg", "2kg"] },
    { id: 8, name: "rice", variants: [], category: "grains", price: 80, unit: "kg", packageSizes: ["1kg", "2kg", "5kg"] },
    { id: 9, name: "sugar", variants: [], category: "groceries", price: 55, unit: "kg", packageSizes: ["500g", "1kg", "2kg"] },
    { id: 10, name: "flour", variants: [], category: "groceries", price: 45, unit: "kg", packageSizes: ["500g", "1kg", "2kg"] },
    { id: 11, name: "egg", variants: ["eggs"], category: "dairy", price: 70, unit: "dozen", packageSizes: ["6 pieces", "12 pieces"] },
    { id: 12, name: "chicken", variants: [], category: "meat", price: 200, unit: "kg", packageSizes: ["500g", "1kg", "2kg"] },
    { id: 13, name: "fish", variants: [], category: "seafood", price: 180, unit: "kg", packageSizes: ["500g", "1kg"] },
    { id: 14, name: "paneer", variants: [], category: "dairy", price: 150, unit: "kg", packageSizes: ["200g", "500g", "1kg"] },
    { id: 15, name: "curd", variants: ["yogurt"], category: "dairy", price: 40, unit: "cup", packageSizes: ["200g", "500g", "1kg"] },
    { id: 16, name: "butter", variants: [], category: "dairy", price: 90, unit: "pack", packageSizes: ["100g", "200g", "500g"] },
    { id: 17, name: "cheese", variants: [], category: "dairy", price: 110, unit: "pack", packageSizes: ["200g", "500g"] },
  ];

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        processVoiceCommand(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setLoading(false);
      };
      
      setSpeechRecognition(recognition);
    }
    return () => {
      if (speechRecognition) {
        speechRecognition.abort();
      }
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      setOrderItems([]);
      setRecordingTime(0);

      if (speechRecognition) {
        speechRecognition.start();
        setIsRecording(true);
        
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 10) { // Auto-stop after 10 seconds
              stopRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      } else {
        // Fallback to audio recording if speech recognition not available
        audioChunksRef.current = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          await processVoiceCommand(null);
        };

        mediaRecorder.start(100);
        setIsRecording(true);

        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 10) { // Auto-stop after 10 seconds
              stopRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (speechRecognition) {
      speechRecognition.stop();
    } else if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(intervalRef.current);
    setIsRecording(false);
  };

  // Process voice command with enhanced parsing
  const processVoiceCommand = async (transcript) => {
    setLoading(true);
    setError(null);
    setOrderItems([]);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      let recognizedItems = [];
      
      if (transcript) {
        // Use actual transcript if available
        recognizedItems = parseTranscript(transcript);
      } else {
        // Fallback simulation if no speech recognition
        recognizedItems = simulateTranscript();
      }

      const finalOrderItems = recognizedItems.map(item => {
        const foundProduct = findProduct(item.name);
        if (!foundProduct) return null;

        return {
          id: Date.now() + Math.random(),
          name: foundProduct.name.charAt(0).toUpperCase() + foundProduct.name.slice(1),
          quantity: item.quantity || getDefaultQuantity(foundProduct),
          price: calculatePrice(foundProduct, item.quantity),
          confirmed: true
        };
      }).filter(Boolean);

      if (finalOrderItems.length === 0) {
        setError('No recognized grocery items found. Please try again.');
        setCurrentStep(1);
      } else {
        setOrderItems(finalOrderItems);
        setCurrentStep(2);
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Processing failed. Please try again.');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced transcript parsing
  const parseTranscript = (text) => {
    const items = [];
    const quantityRegex = /(\d+)\s*(kg|g|ml|liter|liters|loaf|loaves|piece|pieces|dozen|pack|cups?)/gi;
    const productNames = availableProducts.flatMap(p => [p.name, ...p.variants]);
    
    // First look for explicit quantity mentions
    const matches = [...text.matchAll(/(\d+)\s*(kg|g|ml|liter|liters|loaf|loaves|piece|pieces|dozen|pack|cups?)?\s*(of)?\s*([a-zA-Z]+)/gi)];
    
    matches.forEach(match => {
      const quantity = match[1];
      const unit = match[2] || '';
      const product = match[4].toLowerCase();
      
      if (productNames.includes(product)) {
        items.push({
          name: product,
          quantity: `${quantity}${unit ? ' ' + unit : ''}`
        });
      }
    });

    // Then look for standalone product mentions
    productNames.forEach(product => {
      if (text.toLowerCase().includes(product) && !items.some(i => i.name === product)) {
        items.push({
          name: product,
          quantity: null // Will be filled with default quantity
        });
      }
    });

    return items;
  };

  // Simulation for when speech recognition isn't available
  const simulateTranscript = () => {
    // Randomly select 2-4 items for the simulation
    const itemCount = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, itemCount).map(product => ({
      name: product.name,
      quantity: getRandomQuantity(product)
    }));
  };

  // Find product with variant matching
  const findProduct = (name) => {
    return availableProducts.find(p => 
      p.name.toLowerCase() === name.toLowerCase() || 
      p.variants.some(v => v.toLowerCase() === name.toLowerCase())
    );
  };

  // Get default quantity for a product
  const getDefaultQuantity = (product) => {
    if (product.unit === 'kg') return '1 kg';
    if (product.unit === 'liter') return '1 liter';
    if (product.unit === 'dozen') return '1 dozen';
    return '1 ' + product.unit;
  };

  // Get random quantity for simulation
  const getRandomQuantity = (product) => {
    const randomIndex = Math.floor(Math.random() * product.packageSizes.length);
    return product.packageSizes[randomIndex];
  };

  // Calculate price based on quantity
  const calculatePrice = (product, quantityStr) => {
    if (!quantityStr) return `₹${product.price}`;
    
    // Extract numeric value
    const quantityMatch = quantityStr.match(/(\d+\.?\d*)/);
    if (!quantityMatch) return `₹${product.price}`;
    
    const quantity = parseFloat(quantityMatch[1]);
    let price = product.price;
    
    // Handle different units
    if (quantityStr.includes('g') && product.unit === 'kg') {
      price = (product.price * quantity / 1000).toFixed(2);
    } else if (quantityStr.includes('ml') && product.unit === 'liter') {
      price = (product.price * quantity / 1000).toFixed(2);
    } else if (quantityStr.includes('piece') && product.unit === 'dozen') {
      price = (product.price * quantity / 12).toFixed(2);
    } else {
      price = (product.price * quantity).toFixed(2);
    }
    
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // Calculate total with proper decimal handling
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const priceValue = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      return total + priceValue;
    }, 0).toFixed(2);
  };

  // Complete payment
  const completePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(4);
    }, 1500);
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (speechRecognition) {
        speechRecognition.abort();
      }
      clearInterval(intervalRef.current);
    };
  }, [speechRecognition]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 h-1 bg-gray-200 w-full -z-10"></div>
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1
                ${currentStep >= step ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                {currentStep > step ? <Check size={16} /> : step}
              </div>
              <span className={`text-xs font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                {step === 1 ? 'Record' : step === 2 ? 'Review' : 'Pay'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Record */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Voice Order</h2>
              <p className="opacity-90">Speak naturally like you're talking to a shopkeeper</p>
            </div>
            <div className="p-6 text-center">
              <button
                onPointerDown={startRecording}
                onPointerUp={stopRecording}
                onPointerLeave={stopRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all
                  ${isRecording ? 'bg-red-500 animate-pulse transform scale-105' : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'} text-white`}
              >
                {isRecording ? <Square size={28} /> : <Mic size={28} />}
              </button>

              {isRecording ? (
                <p className="text-red-500 font-medium flex items-center justify-center">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  Recording ({recordingTime}s)
                </p>
              ) : (
                <p className="text-gray-600">Press and hold to record</p>
              )}

              {transcript && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                  <p className="text-sm text-blue-800 font-medium">You said:</p>
                  <p className="text-blue-900">"{transcript}"</p>
                </div>
              )}

              {loading && (
                <div className="mt-6 flex flex-col items-center">
                  <Loader className="animate-spin text-blue-500 mb-2" />
                  <p className="text-blue-500">Processing your order...</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mt-6 text-sm text-gray-500">
                <p className="font-medium">Try saying:</p>
                <p>"2kg tomatoes and 1 liter milk"</p>
                <p>"Half kg paneer and 6 eggs"</p>
                <p>"1 loaf bread, 500g butter, and 5 bananas"</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">Review Order</h2>
              <p className="opacity-90">{orderItems.length} items in your order</p>
            </div>
            <div className="p-6">
              {orderItems.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity}</p>
                        </div>
                        <p className="font-semibold text-blue-600">{item.price}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-xl font-bold text-purple-600">₹{calculateTotal()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-gray-600">
                  <p>No items were added to your order.</p>
                  <p className="mt-2">Please go back and try again.</p>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition flex items-center justify-center"
                  disabled={orderItems.length === 0}
                >
                  Continue <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">Payment</h2>
              <p className="opacity-90">Complete your purchase</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-medium mb-3">Select Payment Method</h3>
                <div className="space-y-3">
                  {[
                    { id: 'cash', name: 'Cash on Delivery', icon: '💵' },
                    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                    { id: 'upi', name: 'UPI Payment', icon: '📱' },
                    { id: 'wallet', name: 'Wallet', icon: '💰' }
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {paymentMethod === method.id && <Check size={12} className="text-white" />}
                        </div>
                        <span className="mr-2">{method.icon}</span>
                        <span>{method.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Order Total:</span>
                  <span className="font-bold">₹{calculateTotal()}</span>
                </div>
                {paymentMethod === 'cash' && (
                  <div className="text-sm text-gray-500 mt-2">
                    Pay in cash when your order is delivered
                  </div>
                )}
              </div>
              <div className="flex justify-between gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={completePayment}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now <CreditCard size={18} className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-center">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-8 text-white">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={36} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
              <p className="opacity-90">Thank you for your order</p>
            </div>
            <div className="p-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">#{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="capitalize">
                    {paymentMethod === 'cash' ? 'Cash on Delivery' : 
                     paymentMethod === 'card' ? 'Credit/Debit Card' : 
                     paymentMethod === 'upi' ? 'UPI Payment' : 'Wallet'}
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Your Items:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.quantity} {item.name}</span>
                      <span>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center text-gray-500 mb-6">
                <ShoppingBag size={18} className="mr-2" />
                <span>Your items will be delivered soon</span>
              </div>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setOrderItems([]);
                  setTranscript('');
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Place New Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceOrderPage;