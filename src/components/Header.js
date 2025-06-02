import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logo.png.png';

function Header() {
  const location = useLocation();

  let navLinks;
  if (location.pathname.startsWith("/client")) {
    navLinks = (
      <>
        <Link to="/Freelancer/myjobs">MY JOBS</Link>
        <Link to="/Freelancer/newjobs">NEW JOBS</Link>
        <Link to="/Freelancer/profile">PROFILE</Link>
        <Link to="/logout">LOGOUT</Link>
      </>
    );
  } else if (location.pathname.startsWith("/admin")) {
    navLinks = (
      <>
        <Link to="/admin/dashboard">DASHBOARD</Link>
        <Link to="/admin/users">USERS</Link>
        <Link to="/admin/settings">SETTINGS</Link>
        <Link to="/logout">LOGOUT</Link>
      </>
    );
  } else {
    navLinks = (
      <>
        <Link to="/">HOME</Link>
        <Link to="/about">ABOUT US</Link>
        <Link to="/contact">CONTACT US</Link>
      </>
    );
  }

  return (
    <header className="header">
      <img src={logo} alt="Worklux Logo" className="logo" />
      <nav className="nav-links">{navLinks}</nav>
    </header>
  );
}

export default Header;
