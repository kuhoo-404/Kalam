import React from 'react';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks'; 
import TemplateGallery from '../components/TemplateGallery';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(180deg, #F5F1E8 0%, #E8DCC4 100%)',
        }}
      >
        <Hero />

        <Features />


        <TemplateGallery />
      </div>

      <Footer />
    </>
  );
};

export default Home;