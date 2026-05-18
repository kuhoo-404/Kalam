import React from 'react';

import Navbar from '../components/Navbar';
import TemplateGallery from '../components/TemplateGallery';
import Footer from '../components/Footer';

const Template = () => {
  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(180deg, #F5F1E8 0%, #E8DCC4 100%)',
          paddingTop: '40px',
        }}
      >
        <TemplateGallery />
      </div>

      <Footer />
    </>
  );
};

export default Template;