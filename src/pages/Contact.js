import React from 'react';
import '../styles/Contact.css';

function Contact() {
  return (
    <div className="contactlux-wrapper">
      <div className="contactlux-container">
        <h1 className="contactlux-title">Contact Us</h1>
        <p className="contactlux-subtitle">
          We'd love to hear from you! Please reach out with any questions, feedback, or partnership inquiries.
        </p>

        <div className="contactlux-info">
          <p><strong>Email:</strong> worklux@emailcom</p>
          <p><strong>Phone:</strong> 071 579 3995</p>
          <p><strong>Address:</strong> 123,Badulla</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
