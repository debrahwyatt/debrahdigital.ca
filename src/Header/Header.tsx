// import React, { useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {

  return (
    <header>      
      <nav>
        <img className='banner' src="../assets/banner.webp" alt="Banner"></img>
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <img className='mag-glass' src="../assets/mag-glass.webp" alt="Search"></img>
      </nav>
    </header>
  );
};

export default Header;
