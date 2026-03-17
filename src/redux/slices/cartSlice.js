import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
  totalAmount: 0,
};

// Calculate total amount from items
const calculateTotal = (items) => items.reduce((sum, item) => sum + (item.totalItemPrice || 0), 0);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      
      // We create a unique ID based on product ID + variant ID + sorted add-on IDs
      const optionsId = [
        newItem.variant?._id || 'no-variant',
        ...(newItem.selectedAddOns || []).map(a => a._id).sort()
      ].join('-');
      
      const uniqueId = `${newItem._id}-${optionsId}`;
      
      const existingItem = state.items.find(item => item.uniqueId === uniqueId);
      
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
        existingItem.totalItemPrice = existingItem.pricePerUnit * existingItem.quantity;
      } else {
        state.items.push({
          ...newItem,
          uniqueId,
          totalItemPrice: newItem.pricePerUnit * newItem.quantity
        });
      }
      
      state.totalAmount = calculateTotal(state.items);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const uniqueId = action.payload;
      state.items = state.items.filter(item => item.uniqueId !== uniqueId);
      state.totalAmount = calculateTotal(state.items);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { uniqueId, quantity } = action.payload;
      const item = state.items.find(i => i.uniqueId === uniqueId);
      if (item && quantity > 0) {
        item.quantity = quantity;
        item.totalItemPrice = item.pricePerUnit * quantity;
      }
      state.totalAmount = calculateTotal(state.items);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      localStorage.removeItem('cartItems');
    },
  },
});

// Re-calculate total on load if items exist
if (initialState.items.length > 0) {
  initialState.totalAmount = calculateTotal(initialState.items);
}

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
