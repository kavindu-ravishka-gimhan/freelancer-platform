import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './Styles/MakePayment.css';

const stripePromise = loadStripe('pk_test_51RNoPi2fplS0i26AazF0kmVYOBKqy3CKy54yMLPIs2TYI3bPxKJES5lC63BhuHBs6bjM1vle2NBii1rQAzsWhsV7004Php5B5M');

const CheckoutForm = ({ project, stripeAccountId, freelancerId, clientId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const formatBudget = (budget) => 
    typeof budget === 'number' ? `$${budget.toFixed(2)}` : `$${Number(budget).toFixed(2)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const rawAmount = project.budget.toString().replace(/[^0-9.]/g, '');
      const amountCents = Math.round(parseFloat(rawAmount) * 100);

      if (isNaN(amountCents)) {
        throw new Error('Invalid project budget format');
      }

      const { data } = await axios.post('http://localhost:5000/create-payment-intent', {
        amount: amountCents,
        freelancerStripeId: stripeAccountId
      });

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: 'Client Name' },
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        alert('Payment successful!');
        console.log('PaymentIntent:', result.paymentIntent);

        // Save payment info
          await axios.post('http://localhost:5000/api/save-payment-details', {
          job_id: project.job_id,
          freelancer_id: freelancerId,
          client_id: clientId,
          amount: project.budget
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Payment error:', errorMessage);
      alert(`Payment failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <CardElement />
      <button type="submit" disabled={!stripe || loading} className="pay-button">
        {loading ? 'Processing...' : `Pay ${formatBudget(project.budget)}`}
      </button>
    </form>
  );
};

const MakePayment = () => {
  const location = useLocation();
  const project = location.state?.project;

  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatBudget = (budget) => {
    try {
      return typeof budget === 'number' 
        ? `$${budget.toFixed(2)}` 
        : `$${Number(budget).toFixed(2)}`;
    } catch {
      return '$0.00';
    }
  };

  const freelancerId = project?.client_id; 
  const clientId = localStorage.getItem('id');

  useEffect(() => {
    if (!freelancerId) {
      setError('No freelancer ID found');
      setLoading(false);
      return;
    }

    axios.get('http://localhost:5000/api/freelancer/stripe-account', {
      params: { freelancerId }
    })
    .then((res) => {
      if (res.data.stripe_account_id) {
        setStripeAccountId(res.data.stripe_account_id);
      } else {
        setError('Freelancer not connected to Stripe');
      }
    })
    .catch((err) => {
      setError('Error fetching Stripe account');
      console.error('Stripe account fetch error:', err);
    })
    .finally(() => setLoading(false));
  }, [freelancerId]);

  return (
    <div className="payment-container">
      <h2 className="payment-header">Make Payment</h2>

      {project ? (
        <div>
          <div className="detail-item">
            <span className="detail-label">Project Title:</span>
            <span className="detail-value">{project.title}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Project ID:</span>
            <span className="detail-value">{project.job_id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span
              className="detail-value"
              style={{
                color: project.status === 'completed' ? '#27ae60' : '#f39c12',
                fontWeight: '500',
              }}
            >
              {project.status}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Freelancer ID:</span>
            <span className="detail-value">{freelancerId}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Budget:</span>
            <span className="detail-value budget-highlight">
              {formatBudget(project.budget)}
            </span>
          </div>

          <div className="payment-integration">
            <h3>Stripe Payment Gateway</h3>
            {loading ? (
              <p>Loading Stripe account...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : stripeAccountId ? (
              <>
                <p>Stripe Account ID: <strong>{stripeAccountId}</strong></p>
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    project={project} 
                    stripeAccountId={stripeAccountId} 
                    freelancerId={freelancerId} 
                    clientId={clientId}
                  />
                </Elements>
              </>
            ) : (
              <p style={{ color: 'red' }}>Freelancer Stripe account not found.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="error-message">
          No project data found. Please return to the Ongoing Projects page.
        </p>
      )}
    </div>
  );
};

export default MakePayment;
