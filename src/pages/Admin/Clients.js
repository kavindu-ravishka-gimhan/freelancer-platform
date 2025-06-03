import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './styles/Clients.css';
import { FiUsers} from 'react-icons/fi';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartData = useMemo(() => {
    if (!clients.length) return {};
    
    const countryData = clients.reduce((acc, client) => {
      acc[client.country] = (acc[client.country] || 0) + 1;
      return acc;
    }, {});

    const monthlyData = clients.reduce((acc, client) => {
      const date = new Date(client.join_date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    return {
      countryData: Object.entries(countryData).map(([name, count]) => ({ name, count })),
      monthlyData: Object.entries(monthlyData).map(([name, count]) => ({ name, count })),
      totalClients: clients.length
    };
  }, [clients]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://freelancer-platform-jmkm.onrender.com/admin/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`http://freelancer-platform-jmkm.onrender.com/admin/clients/${clientId}`);
        setClients(clients.filter(client => client.id !== clientId));
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete client');
      }
    }
  };

  const chartColors = ['#4e79a7', '#f28e2c', '#59a14f', '#e15759', '#edc948'];

  return (
    <div className="clients-dashboard-container">
      
      <h1 className="clients-main-heading">
        <FiUsers className="Ctitle-icon" /> Client Management Dashboard</h1>
      
      {loading ? (
        <div className="clients-loading-status">Loading dashboard...</div>
      ) : (
        <>
          <div className="clients-charts-grid">
            {/* Country Distribution Chart */}
            <div className="clients-chart-card">
              <h3 className="clients-chart-title">Client Distribution by Country</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.countryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d">
                    {chartData.countryData?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Signups Chart */}
            <div className="clients-chart-card">
              <h3 className="clients-chart-title">Monthly Client Signups</h3>
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
                    stroke="#4e79a7"
                    strokeWidth={2}
                    dot={{ fill: '#4e79a7', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Total Clients Card */}
            <div className="clients-chart-card total-clients-card">
              <h3 className="clients-chart-title">Total Clients</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[{ name: 'Clients', value: chartData.totalClients }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    <Cell fill={chartColors[0]} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="clients-total-badge">{chartData.totalClients}</div>
            </div>
          </div>

          {/* Client Table */}
          <div className="clients-table-wrapper">
            
            <h2 className="clients-table-heading"><FiUsers className="Cstat-icon" />Client Details</h2>
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
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td>
                        <img
                          src={`http://localhost:5000${client.profile_pic}`}
                          alt={`${client.name}'s profile`}
                          className="client-profile-image"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                      </td>
                      <td>{client.name}</td>
                      <td>{client.email}</td>
                      <td>{client.country}</td>
                      <td>
                        {new Date(client.join_date).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="Aclient-delete-action-btn"
                          onClick={() => handleDeleteClient(client.id)}
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

export default Clients;
