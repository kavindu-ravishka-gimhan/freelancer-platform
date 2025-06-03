import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiClock, FiBriefcase, FiTrendingUp, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import './styles/Projects.css';
import { Spinner } from 'react-bootstrap';

const Projects = () => {
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });

  const processTimelineData = () => {
    const monthlyData = {};

    ongoingProjects.forEach(project => {
      const month = new Date(project.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, ongoing: 0, completed: 0, revenue: 0 };
      }
      monthlyData[month].ongoing += 1;
    });

    completedProjects.forEach(project => {
      const month = new Date(project.payment_date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, ongoing: 0, completed: 0, revenue: 0 };
      }
      monthlyData[month].completed += 1;
      monthlyData[month].revenue += parseFloat(project.amount);
    });

    return Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const processRevenueData = () => {
    return completedProjects
      .map(project => ({
        date: new Date(project.payment_date).toLocaleDateString(),
        amount: parseFloat(project.amount)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateStats = (ongoing, completed) => {
    const inProgress = ongoing.filter(p => p.status === 'in_progress').length;
    setStats({
      total: ongoing.length + completed.length,
      inProgress,
      completed: completed.length
    });
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [ongoingRes, completedRes] = await Promise.all([
          axios.get('http://freelancer-platform-jmkm.onrender.com/api/admin/ongoing-projects'),
          axios.get('http://freelancer-platform-jmkm.onrender.com/completed-projects')
        ]);

        setOngoingProjects(ongoingRes.data);
        setCompletedProjects(completedRes.data);
        calculateStats(ongoingRes.data, completedRes.data);
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="projects-loading">
        <Spinner animation="border" variant="primary" />
        Loading projects...
      </div>
    );
  }

  return (
    <div className="projects-container">
      <h1 className="projects-header">
        <FiBriefcase className="projects-header-icon" /> Project Management
      </h1>

      <div className="projects-stats-grid">
        <div className="projects-stat-card total-projects">
          <div className="projects-stat-content">
            <FiBriefcase className="projects-stat-icon" />
            <div>
              <h3>Total Projects</h3>
              <p>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="projects-stat-card in-progress">
          <div className="projects-stat-content">
            <FiTrendingUp className="projects-stat-icon" />
            <div>
              <h3>In Progress</h3>
              <p>{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="projects-stat-card completed">
          <div className="projects-stat-content">
            <FiCheckCircle className="projects-stat-icon" />
            <div>
              <h3>Completed</h3>
              <p>{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="projects-charts-grid">
        <div className="projects-chart-container">
          <h3><FiTrendingUp /> Project Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processTimelineData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ongoing" stackId="a" fill="#F59E0B" name="Ongoing Projects" />
              <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed Projects" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="projects-chart-container">
          <h3><FiDollarSign /> Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} name="Revenue (USD)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="projects-table-section">
        <h2><FiClock className="projects-table-icon" /> Ongoing Projects</h2>
        <div className="projects-table-wrapper">
          <table className="projects-data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Freelancer</th>
                <th>Client</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {ongoingProjects.length > 0 ? (
                ongoingProjects.map(project => (
                  <tr key={project.job_id}>
                    <td>{project.job_title}</td>
                    <td>{project.client_name}</td>
                    <td>{project.freelancer_name}</td>
                    <td>
                      <span className={`projects-status-badge ${project.status}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{formatDate(project.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="projects-no-data">
                    No ongoing projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2><FiCheckCircle className="projects-table-icon" /> Completed Projects</h2>
        <div className="projects-table-wrapper">
          <table className="projects-data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Client</th>
                <th>Freelancer</th>
                <th>Amount</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {completedProjects.length > 0 ? (
                completedProjects.map(project => (
                  <tr key={project.job_id}>
                    <td>{project.job_title}</td>
                    <td>{project.client_name}</td>
                    <td>{project.freelancer_name}</td>
                    <td>${parseFloat(project.amount).toFixed(2)}</td>
                    <td>{formatDate(project.payment_date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="projects-no-data">
                    No completed projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Projects;
