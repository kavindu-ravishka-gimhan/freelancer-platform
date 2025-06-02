import React from 'react';
import '../styles/About.css';

function About() {
  return (
    <div className="about-wrapper">
      <header className="about-hero">
        <h1 className="fade-in">Welcome to WorkLux</h1>
        <p className="slide-in">Empowering Freelancers. Elevating Clients.</p>
      </header>

      <section className="about-section fade-in-up">
        <h2>Our Mission</h2>
        <p>
          At <strong>WorkLux</strong>, we connect skilled freelancers with clients across the globe. Our mission is to build a reliable, user-friendly, and secure freelance platform where talent meets opportunity.
        </p>
      </section>

      <section className="about-section fade-in-up delay-1">
        <h2>How WorkLux Works</h2>
        <ul>
          <li>Clients post jobs with clear goals and budgets.</li>
          <li>Freelancers browse and apply to relevant jobs.</li>
          <li>Clients hire the best fit and track project progress.</li>
          <li>Payments are processed securely via Stripe or PayHere.</li>
        </ul>
      </section>

      <section className="about-section fade-in-up delay-2">
        <h2>Why Choose WorkLux?</h2>
        <ul>
          <li>Beautiful and intuitive user interface</li>
          <li>Secure, instant payments</li>
          <li>Progress tracking and file delivery</li>
          <li>Ratings, reviews & skill-based profiles</li>
        </ul>
      </section>

      <footer className="about-footer">
        <p>&copy; {new Date().getFullYear()} WorkLux. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default About;
