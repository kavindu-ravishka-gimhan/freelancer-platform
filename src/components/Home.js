import React from 'react';
import './Home.css';
import girlImage from '../assets/girl.png.png';
import { Link } from 'react-router-dom';



function Home() {
  return (
    <main className="main-content">
      <div className="tagline-container">
        <h2 className="tagline">
          <p>Where talent finds</p>
          <p>opportunity and ideas</p>
          <p>turn into <span className="highlight">reality!</span></p>
        </h2>
        <img src={girlImage} alt="Girl" className="girl-image" />
      </div>
      <Link to="/signin">
        <button className="sign-in-button">SIGN IN</button>
      </Link>
    </main>
  );
}

export default Home;
