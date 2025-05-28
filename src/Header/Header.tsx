// import React, { useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {

  return (
    <header>      
      <nav>
        <Link className="banner-link" to="/">
          <img className="banner" src="../assets/banner.webp" alt="Banner" />
        </Link>        
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </header>
  );
};

export default Header;
