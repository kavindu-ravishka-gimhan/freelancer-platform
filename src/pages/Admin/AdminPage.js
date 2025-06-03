import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import {
  FaHome,
  FaUserTie,
  FaProjectDiagram,
  FaSignOutAlt
} from 'react-icons/fa';
import logo from '../../assets/logo.png.png';
import './styles/AdminPage.css';

const AdminPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'dashboard', icon: <FaHome />, label: 'Dashboard' },
    { name: 'clients', icon: <FaUserTie />, label: 'Clients' },
    { name: 'freelancers', icon: <FaUserTie />, label: 'Freelancers' },
    { name: 'projects', icon: <FaProjectDiagram />, label: 'Projects' },
    
  ];

  useEffect(() => {
    const verifyAdminAccess = async () => {
      const token = localStorage.getItem('adminToken');
      const role = localStorage.getItem('role');

      if (!token || role !== 'Admin') {
        localStorage.removeItem('adminToken');
        navigate('/signin');
        return;
      }

      try {
        await axios.get('http://freelancer-platform-jmkm.onrender.com/admin/data', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // You can log or use the response if needed
      } catch (error) {
        console.error('Admin access error:', error);
        localStorage.removeItem('adminToken');
        navigate('/signin');
      }
    };

    verifyAdminAccess();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('role');
    navigate('/signin');
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="ap-container">
      <div className={`ap-sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="ap-sidebar-header">
          <img
            src={logo}
            alt="Logo"
            className={`ap-sidebar-logo ${isSidebarExpanded ? 'expanded' : ''}`}
            onClick={toggleSidebar}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <nav className="ap-sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={`/admin/${item.name}`}
              className={({ isActive }) =>
                `ap-menu-item ${isActive ? 'active' : ''}`
              }
            >
              {item.icon}
              {isSidebarExpanded && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="ap-sidebar-footer">
          <button onClick={handleLogout} className="ap-logout-btn">
            <FaSignOutAlt />
            {isSidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div className={`ap-main-content ${isSidebarExpanded ? 'with-sidebar' : 'with-collapsed-sidebar'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPage;
