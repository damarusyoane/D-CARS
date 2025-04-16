import React from "react";
import Index from "./pages/Index";
import MessagingPage from "./pages/MessagingPage";
import SavedCars from "./pages/SavedCars";
import MyListings from "./pages/MyListings";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import TransactionHistory from "./pages/TransactionHistory";
import MessagingInterface from "./components/messaging/MessagingInterface";

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div className="min-h-screen">
      <Router>
     <Routes>
      <Route path="/" element={<Index />} /> 
      <Route path="/messages" element = {< MessagingPage />} />
      <Route path= "/saved-cars" element= {<SavedCars />} />
      <Route path="/my-listings" element= {<MyListings />} />
      <Route path="/searchcars" element= {<HomePage />} />
      <Route path="/dashboard" element= {<Dashboard />} />
      <Route path="/transactions" element={<TransactionHistory />} />
      <Route path="/messaginginterface" element={<MessagingInterface />} />
     </Routes>
     </Router>

    </div>
  );
}

export default App;
