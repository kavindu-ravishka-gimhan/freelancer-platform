import React, { useEffect, useState } from 'react';
import './styles/AdminDashboard.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Spinner } from 'react-bootstrap';
import { FiUsers, FiBriefcase, FiUserCheck ,FiHome} from 'react-icons/fi';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://freelancer-platform-jmkm.onrender.com/admin/users');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
        setError('');
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const role = localStorage.getItem('role');
    if (role !== 'Admin') {
      setError('Access denied. Only admins can view this page.');
      setLoading(false);
    } else {
      fetchUsers();
    }
  }, []);

  // Count users by role
  const roleCounts = users.reduce(
    (counts, user) => {
      if (user.role === 'Freelancer') counts.freelancers += 1;
      if (user.role === 'Client') counts.clients += 1;
      return counts;
    },
    { freelancers: 0, clients: 0 }
  );

  const chartData = [
    { name: 'Freelancers', value: roleCounts.freelancers },
    { name: 'Clients', value: roleCounts.clients }
  ];

  const COLORS = ['#10B981', '#3B82F6'];

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-title">
        <FiHome className="title-icon" />
        Admin Dashboard
      </h1>

      <div className="admin-stats">
        <div className="admin-stat-card total-users">
          <div className="stat-content">
            <FiUsers className="stat-icon" />
            <div>
              <h3>Total Users</h3>
              <p>{users.length}</p>
            </div>
          </div>
        </div>
        <div className="admin-stat-card freelancers">
          <div className="stat-content">
            <FiBriefcase className="stat-icon" />
            <div>
              <h3>Freelancers</h3>
              <p>{roleCounts.freelancers}</p>
            </div>
          </div>
        </div>
        <div className="admin-stat-card clients">
          <div className="stat-content">
            <FiUserCheck className="stat-icon" />
            <div>
              <h3>Clients</h3>
              <p>{roleCounts.clients}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-chart-grid">
        <div className="chart-container">
          <h3>
            <FiBriefcase /> User Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>
            <FiUserCheck /> User Ratio
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ color: '#6B7280' }}>{value}</span>}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-users-section">
        <h2>
          <FiUsers /> User List
        </h2>

        {error && (
          <div className="admin-error">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="admin-loading">
            <Spinner animation="border" variant="primary" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            📭 No users found in the database
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Country</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.country || 'N/A'}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
