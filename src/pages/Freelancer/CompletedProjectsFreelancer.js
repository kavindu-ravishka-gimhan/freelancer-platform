import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Styles/CompletedProjectsFreelancer.css'; // Assuming you have a CSS file for styling

const freelancerId = localStorage.getItem('id');
console.log('Freelancer ID:', freelancerId);

const CompletedProjectsFreelancer = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const freelancerId = localStorage.getItem('id');

    axios.get(`http://freelancer-platform-jmkm.onrender.com/api/paymentsfl?freelancer_id=${freelancerId}`)
      .then(res => {
        setPayments(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load payments');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-text">Loading payments...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="intro-container">
      <h2 className="intro-text">Completed Projects</h2>
      
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header">Job Title</th>
              <th className="table-header">Client Name</th>
              <th className="table-header">Project Budget</th>
              <th className="table-header">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.job_id} className="table-data-row">
                <td className="table-data job-title">{payment.job_title}</td>
                <td className="table-data freelancer-name">{payment.client_name}</td>
                <td className="table-data project-budget">${payment.amount}</td>
                <td className="table-data payment-date">
                  {new Date(payment.payment_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompletedProjectsFreelancer;
