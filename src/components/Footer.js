import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Worklux. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
