import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 🔥 adjust path if needed
import { Link } from 'react-router-dom';
import { CalendarIcon, ClipboardDocumentListIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (user) {
    navigate('/dashboard');  // 🔥 redirect if logged in
  }
}, [user, navigate]);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="text-5xl font-bold mb-6">
            Meeting & Task Planner
          </h1>
          <p className="text-xl mb-8 max-w-3xl">
            Streamline your team's productivity with our comprehensive meeting and task management solution.
          </p>
          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 inline-block"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-blue-600 inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <CalendarIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Meeting Management</h3>
            <p className="text-gray-600">
              Schedule, track, and manage all your meetings in one place with ease.
            </p>
          </div>
          <div className="text-center">
            <ClipboardDocumentListIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Task Tracking</h3>
            <p className="text-gray-600">
              Assign and track tasks, set deadlines, and monitor progress efficiently.
            </p>
          </div>
          <div className="text-center">
            <UserGroupIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">
              Enhance team collaboration with role-based access and real-time updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;