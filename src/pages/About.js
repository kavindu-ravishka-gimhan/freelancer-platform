import React from 'react';
import '../styles/About.css';

function About() {
  return (
    <div className="aboutlux-wrapper">
      <header className="aboutlux-hero">
        <div className="aboutlux-overlay">
          <h1 className="aboutlux-title">Welcome to WorkLux</h1>
          <p className="aboutlux-subtitle">Empowering Freelancers. Elevating Clients.</p>
        </div>
      </header>

      <section className="aboutlux-section">
        <h2 className="aboutlux-heading">Our Mission</h2>
        <p className="aboutlux-text">
          At <strong>WorkLux</strong>, we connect skilled freelancers with clients across the globe. Our mission is to build a reliable, user-friendly, and secure freelance platform where talent meets opportunity.
        </p>
      </section>

      <section className="aboutlux-section">
        <h2 className="aboutlux-heading">How WorkLux Works</h2>
        <ul className="aboutlux-list">
          <li>Clients post jobs with clear goals and budgets.</li>
          <li>Freelancers browse and apply to relevant jobs.</li>
          <li>Clients hire the best fit and track project progress.</li>
          <li>Payments are processed securely via Stripe or PayHere.</li>
        </ul>
      </section>

      <section className="aboutlux-section">
        <h2 className="aboutlux-heading">Why Choose WorkLux?</h2>
        <ul className="aboutlux-list">
          <li>Beautiful and intuitive user interface</li>
          <li>Secure, instant payments</li>
          <li>Progress tracking and file delivery</li>
          <li>Ratings, reviews & skill-based profiles</li>
        </ul>
      </section>
    </div>
  );
}

export default About;
