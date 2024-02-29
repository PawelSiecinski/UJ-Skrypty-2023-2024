import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Home';
import { Orders } from './components/Orders';

function Routing() {
  return (
    <Router>
      <Routes>
        <Route path="/orders" element={<Orders />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default Routing;
