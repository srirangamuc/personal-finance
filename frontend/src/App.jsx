import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import Home from './pages/Home';
import AuthPage from './pages/Auth';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard' 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element = {<AuthPage/>}/>
        <Route path="*" element={<NotFound />} />
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </Router>
  );
};

export default App;