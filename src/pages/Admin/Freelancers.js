import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FiBriefcase } from 'react-icons/fi';
import './styles/Freelancers.css';

const Freelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartData = useMemo(() => {
    if (!freelancers.length) return {};

    const countryData = freelancers.reduce((acc, freelancer) => {
      acc[freelancer.country] = (acc[freelancer.country] || 0) + 1;
      return acc;
    }, {});

    const monthlyData = freelancers.reduce((acc, freelancer) => {
      const date = new Date(freelancer.join_date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    return {
      countryData: Object.entries(countryData).map(([name, count]) => ({ name, count })),
      monthlyData: Object.entries(monthlyData).map(([name, count]) => ({ name, count })),
      totalFreelancers: freelancers.length
    };
  }, [freelancers]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await axios.get('http://freelancer-platform-jmkm.onrender.com/admin/freelancers');
        setFreelancers(response.data);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  const handleDeleteFreelancer = async (freelancerId) => {
    if (window.confirm('Are you sure you want to delete this freelancer?')) {
      try {
        await axios.delete(`http://freelancer-platform-jmkm.onrender.com/admin/freelancers/${freelancerId}`);
        setFreelancers(prev => prev.filter(f => f.id !== freelancerId));
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete freelancer');
      }
    }
  };

  const chartColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="freelancers-dashboard-container">
      <h1 className="freelancers-main-heading">
        <FiBriefcase className="Ftitle-icon" /> Freelancer Management Dashboard
      </h1>

      {loading ? (
        <div className="freelancers-loading-status">Loading dashboard...</div>
      ) : (
        <>
          <div className="freelancers-charts-grid">
            {/* Country Distribution */}
            <div className="freelancers-chart-card">
              <h3 className="freelancers-chart-title">Freelancers by Country</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.countryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6">
                    {chartData.countryData?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Signups */}
            <div className="freelancers-chart-card">
              <h3 className="freelancers-chart-title">Monthly Freelancer Signups</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Total Freelancers */}
            <div className="freelancers-chart-card total-freelancers-card">
              <h3 className="freelancers-chart-title">Total Freelancers</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[{ name: 'Freelancers', value: chartData.totalFreelancers }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    <Cell fill="#F59E0B" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="freelancers-total-badge">{chartData.totalFreelancers}</div>
            </div>
          </div>

          {/* Freelancer Table */}
          <div className="freelancers-table-wrapper">
            <h2 className="freelancers-table-heading"><FiBriefcase className="Fstat-icon" /> Freelancer Details</h2>
            <div className="admin-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {freelancers.map(freelancer => (
                    <tr key={freelancer.id}>
                      <td>
                        <img
                          src={`http://localhost:5000${freelancer.profile_pic}`}
                          alt={`${freelancer.name}'s profile`}
                          className="freelancer-profile-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                      </td>
                      <td>{freelancer.name}</td>
                      <td>{freelancer.email}</td>
                      <td>{freelancer.country}</td>
                      <td>{new Date(freelancer.join_date).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="Afreelancer-delete-action-btn"
                          onClick={() => handleDeleteFreelancer(freelancer.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Freelancers;
