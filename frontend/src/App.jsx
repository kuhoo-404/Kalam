import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import About from './pages/About';
import Template from './pages/Template';
import Write from './pages/Write';
import SavedPoems from './pages/SavedPoems';

import './styles/paper-effects.css';
import './styles/animations.css';
import './App.css';
import './index.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/templates" element={<Template />} />
        <Route path="/write"     element={<Write />} />
        <Route path="/about"     element={<About />} />
        <Route path="/saved"     element={<SavedPoems />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;