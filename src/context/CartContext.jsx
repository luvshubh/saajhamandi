import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create the Context object
const CartContext = createContext();

// Define the reducer function for cart state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      // Check if the item already exists in the cart
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        // If item exists, update its quantity
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 } // Increment quantity by 1
              : item
          )
        };
      }
      // If item does not exist, add it to the cart with quantity 1
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_ITEM':
      // Filter out the item with the specified ID
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      // Ensure quantity is not negative
      const newQuantity = Math.max(0, action.payload.quantity);

      // If new quantity is 0, remove the item
      if (newQuantity === 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        };
      }

      // Otherwise, update the quantity of the specific item
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      };

    case 'CLEAR_CART':
      // Reset items array to empty
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      // Load cart items from payload (e.g., from localStorage)
      // Ensure payload is an array, default to empty array if null/undefined
      return {
        ...state,
        items: Array.isArray(action.payload) ? action.payload : []
      };

    default:
      // Return current state for unknown actions (important for stability)
      return state;
  }
};

// CartProvider component to wrap your application or relevant parts
export const CartProvider = ({ children }) => {
  // Initialize state with an empty items array
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Effect to load cart from localStorage on initial component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Dispatch LOAD_CART action only if parsed data is an array
        if (Array.isArray(parsedCart)) {
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } else {
          console.warn("Cart data in localStorage is not an array. Clearing cart.");
          dispatch({ type: 'CLEAR_CART' }); // Clear corrupted data
        }
      }
    } catch (error) {
      // Handle potential JSON parsing errors from localStorage
      console.error("Failed to load cart from localStorage:", error);
      dispatch({ type: 'CLEAR_CART' }); // Clear corrupted data
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to save cart to localStorage whenever the cart items change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
      // Optionally, inform the user if saving fails
    }
  }, [state.items]); // Dependency array ensures this runs when state.items changes

  // Action creators (functions that dispatch actions to the reducer)
  const addItem = (item) => {
    // Ensure item has at least an 'id' and 'price' before adding
    if (!item || !item.id || item.price === undefined) {
      console.error("Attempted to add invalid item to cart:", item);
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Helper function to calculate total price of items in the cart
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      // Robust price parsing:
      // 1. Convert item.price to string to handle various types
      // 2. Remove '₹' and '/kg' and any leading/trailing whitespace
      // 3. Attempt to parse as float, default to 0 if NaN
      const priceString = String(item.price || '0').replace('₹', '').replace('/kg', '').trim();
      const price = parseFloat(priceString);
      
      // Ensure price is a valid number before multiplication
      if (isNaN(price)) {
        console.warn(`Invalid price for item ID ${item.id}: "${item.price}". Using 0 for calculation.`);
        return total; // Skip this item or handle as needed
      }
      return total + (price * item.quantity);
    }, 0);
  };

  // Helper function to get the total count of items (sum of quantities)
  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  // The value object that will be provided to consumers of the context
  const value = {
    items: state.items,          // Current cart items
    addItem,                     // Function to add an item
    removeItem,                  // Function to remove an item
    updateQuantity,              // Function to update an item's quantity
    clearCart,                   // Function to clear the cart
    getCartTotal,                // Function to get the total price
    getCartCount                 // Function to get the total item count
  };

  return (
    <CartContext.Provider value={value}>
      {children} {/* Renders child components */}
    </CartContext.Provider>
  );
};

// Custom hook to consume the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  // Throw an error if useCart is used outside of a CartProvider
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};