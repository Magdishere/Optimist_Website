import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Locations from './pages/Locations';

// Initialize Stripe with your Publishable Key
const stripePromise = loadStripe('pk_test_51TAr8lA3sxz4RLimWJ7nwdTXPWaGxT19K4x6gIZcUi8RnpDpXMVbhGj7P8GJzxNeWlLqOJ3hfDLSvcLVi8K7pE4s00WAqlYJv2');

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route 
          path="/checkout" 
          element={
            <Elements stripe={stripePromise}>
              <Checkout />
            </Elements>
          } 
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/locations" element={<Locations />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
