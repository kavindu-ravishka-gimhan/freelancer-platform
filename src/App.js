import React from 'react';
import { Routes, Route, useLocation, Navigate, matchPath } from 'react-router-dom';
import './styles/App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import FreelancerHeader from './components/FreelancerHeader';
import ClientHeader from './components/ClientHeader';

// Pages
import Home from './components/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import Signup from './pages/Ka';

// Admin Pages
import AdminPage from './pages/Admin/AdminPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Clients from './pages/Admin/Clients';
import Freelancers from './pages/Admin/Freelancers';
import Projects from './pages/Admin/Projects';


// Client Pages
import ClientPage from './pages/Client/ClientPage';
import CreateNewJobs from './pages/Client/CreateNewJobs';
import OngoingProjects from './pages/Client/OngProject';
import UpdateJob from './pages/Client/UpdateJob';
import SeeApplicantsPage from './pages/Client/SeeApplicantsPage';
import ManageAccountPageClient from './pages/Client/ManageAccountPageClient';
import MakePayment from './pages/Client/MakePayment';
import ApplicantDetailsPage from './pages/Client/ApplicantDetailsPage';
import CompletedProjects from './pages/Client/CompletedProjects';

// Freelancer Pages
import FreelancerPage from './pages/Freelancer/FreelancerPage';
import OngoingProjectClient from './pages/Freelancer/OngoingProject';
import ManageAccountPage from './pages/Freelancer/ManageAccountPage';
import MyProfilePage from './pages/Freelancer/MyProfilePage';
import AddPaymentDetails from './pages/Freelancer/AddPaymentDetails';
import CompletedProjectsFreelancer from './pages/Freelancer/CompletedProjectsFreelancer';

function App() {
  const location = useLocation();

  // Client routes
  const clientRoutes = [
    '/ClientPage',
    '/createNewJobs',
    '/ongoingProjects',
    '/update-job/:id',
    '/see-applicants/:jobId',
    '/ManageAccountPageClient',
    '/MakePayment',
    '/ApplicantDetailsPage/:clientId',
    '/CompletedProjects',
  ];

  // Freelancer routes
  const freelancerRoutes = [
    '/FreelancerPage',
    '/ongoingProjectClient',
    '/ManageAccountPage',
    '/MyProfilePage',
    '/AddPaymentDetails',
    '/CompletedProjectsFreelancer'
  ];

  // Hide header/footer on these routes
  const hideHeaderAndFooterRoutes = ['/admin'];
  const hideHeaderAndFooter = hideHeaderAndFooterRoutes.some(route =>
    matchPath({ path: route, end: false }, location.pathname)
  );

  const showFreelancerHeader = freelancerRoutes.some(route =>
    matchPath({ path: route, end: false }, location.pathname)
  );

  const showClientHeader = clientRoutes.some(route =>
    matchPath({ path: route, end: false }, location.pathname)
  );

  return (
    <div className="app-container">
      {!hideHeaderAndFooter && (
        <>
          {showClientHeader && <ClientHeader />}
          {showFreelancerHeader && <FreelancerHeader />}
          {!showClientHeader && !showFreelancerHeader && <Header />}
        </>
      )}

      <div className="content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Nested Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="freelancers" element={<Freelancers />} />
            <Route path="projects" element={<Projects />} />
           
          </Route>

          {/* Redirect old AdminPage to dashboard */}
          <Route path="/AdminPage" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Client Routes */}
          <Route path="/ClientPage" element={<ProtectedRoute allowedRoles={['Client']}><ClientPage /></ProtectedRoute>} />
          <Route path="/createNewJobs" element={<ProtectedRoute allowedRoles={['Client']}><CreateNewJobs /></ProtectedRoute>} />
          <Route path="/ongoingProjects" element={<ProtectedRoute allowedRoles={['Client']}><OngoingProjects /></ProtectedRoute>} />
          <Route path="/update-job/:id" element={<ProtectedRoute allowedRoles={['Client']}><UpdateJob /></ProtectedRoute>} />
          <Route path="/see-applicants/:jobId" element={<ProtectedRoute allowedRoles={['Client']}><SeeApplicantsPage /></ProtectedRoute>} />
          <Route path="/ManageAccountPageClient" element={<ProtectedRoute allowedRoles={['Client']}><ManageAccountPageClient /></ProtectedRoute>} />
          <Route path="/MakePayment" element={<ProtectedRoute allowedRoles={['Client']}><MakePayment /></ProtectedRoute>} />
          <Route path="/ApplicantDetailsPage/:clientId" element={<ApplicantDetailsPage />} />
          <Route path="/CompletedProjects" element={<CompletedProjects/>} />

          {/* Freelancer Routes */}
          <Route path="/FreelancerPage" element={<ProtectedRoute allowedRoles={['Freelancer']}><FreelancerPage /></ProtectedRoute>} />
          <Route path="/ongoingProjectClient" element={<ProtectedRoute allowedRoles={['Freelancer']}><OngoingProjectClient /></ProtectedRoute>} />
          <Route path="/ManageAccountPage" element={<ProtectedRoute allowedRoles={['Freelancer']}><ManageAccountPage /></ProtectedRoute>} />
          <Route path="/MyProfilePage" element={<ProtectedRoute allowedRoles={['Freelancer']}><MyProfilePage /></ProtectedRoute>} />
          <Route path="/AddPaymentDetails" element={<ProtectedRoute allowedRoles={['Freelancer']}><AddPaymentDetails /></ProtectedRoute>} />
          <Route path="/CompletedProjectsFreelancer" element={<ProtectedRoute allowedRoles={['Freelancer']}><CompletedProjectsFreelancer /></ProtectedRoute>} />
        </Routes>
      </div>

      {!hideHeaderAndFooter && <Footer />}
    </div>
  );
}

export default App;