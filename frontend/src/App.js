import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import CollectorDashboard from './pages/dashboard/roles/CollectorDashboard';
import EmployeeDashboard from './pages/dashboard/roles/EmployeeDashboard';
import OrganizerDashboard from './pages/dashboard/roles/OrganizerDashboard';

// Meeting Pages
import MeetingsList from './pages/meetings/MeetingsList';
import CreateMeeting from './pages/meetings/CreateMeeting';
import EditMeeting from './pages/meetings/EditMeeting';
import MeetingDetailPage from './pages/meetings/MeetingDetailPage';

// Task Pages
import TasksList from './pages/tasks/TasksList';
import AssignTask from './pages/tasks/AssignTask';
import TaskUpdate from './pages/tasks/TaskUpdate';
import TaskReportPage from './pages/tasks/TaskReportPage';

// Notes Page
import Notes from './pages/notes/Notes';

// Home Page
import Home from './pages/Home';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/organizer"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/collector"
          element={
            <ProtectedRoute allowedRoles={['COLLECTOR']}>
              <CollectorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/employee"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Meeting Routes */}
        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <MeetingsList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/meetings/create"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'COLLECTOR']}>
              <CreateMeeting />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/meetings/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'COLLECTOR']}>
              <EditMeeting />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/meetings/:id"
          element={
            <ProtectedRoute>
              <MeetingDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Task Routes */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tasks/assign"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'COLLECTOR']}>
              <AssignTask />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tasks/update/:id"
          element={
            <ProtectedRoute>
              <TaskUpdate />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tasks/report"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'COLLECTOR']}>
              <TaskReportPage />
            </ProtectedRoute>
          }
        />

        {/* Notes Route */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;