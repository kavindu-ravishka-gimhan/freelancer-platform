import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Styles/AddPaymentDetails.css'; // Regular CSS import




const AddPaymentDetails = () => {
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [loading, setLoading] = useState(true);

  const freelancerId = localStorage.getItem('id');

  useEffect(() => {
    if (!freelancerId) {
      alert('No freelancer ID found.');
      return;
    }

    axios
      .get('http://freelancer-platform-jmkm.onrender.com/api/freelancer/stripe-status', {
        params: { freelancerId },
      })
      .then((res) => {
        if (res.data.stripe_account_id) {
          setStripeAccountId(res.data.stripe_account_id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error checking Stripe status:', err);
        setLoading(false);
      });
  }, [freelancerId]);

  const handleAddPayment = async () => {
    try {
      const res = await axios.get(
        'http://freelancer-platform-jmkm.onrender.com/api/freelancer/add-payment-details',
        {
          params: { freelancerId },
        }
      );
      window.open(res.data.url, '_blank');
    } catch (err) {
      console.error('Stripe setup failed:', err);
      alert('Stripe connection failed.');
    }
  };



  if (loading) return <p className="loading-apd">Loading...</p>;

  return (
    <div className="container-apd">
      <h2 className="title-apd">Payment Integration</h2>

      {stripeAccountId ? (
        <div className="connected-container">
          <div className="status-message-apd">
            <span className="checkmark">✓</span>
            <p>Stripe account successfully connected</p>
          </div>
          <div className="account-id-apd">
            <label>Stripe Account ID:</label>
            <div className="account-id-value">{stripeAccountId}</div>
          </div>
        </div>
      ) : (
        <div className="connect-section">
          <div className="stripe-logo">
            <div className="stripe-gradient">Stripe</div>
          </div>
          <button onClick={handleAddPayment} className="button-apd">
            Connect Stripe Account
          </button>
          <p className="security-message">
            <span>🔒</span> Secure 256-bit SSL encryption
          </p>
        </div>
      )}
    </div>
  );
};

export default AddPaymentDetails;
