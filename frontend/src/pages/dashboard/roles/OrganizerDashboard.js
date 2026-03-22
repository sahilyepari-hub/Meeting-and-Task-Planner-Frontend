import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import meetingService from '../../../services/meetingService';
import taskService from '../../../services/taskService';
import userService from '../../../services/userService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  UserGroupIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalUsers: 0,
    recentMeetings: [],
    recentTasks: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [meetings, tasks, users] = await Promise.all([
        meetingService.getAllMeetings(),
        taskService.getAllTasks(),
        userService.getAllUsers()
      ]);

      const now = new Date();
      
      setStats({
        totalMeetings: meetings.length,
        upcomingMeetings: meetings.filter(m => new Date(m.date) > now && m.status === 'SCHEDULED').length,
        completedMeetings: meetings.filter(m => m.status === 'COMPLETED').length,
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status !== 'COMPLETED').length,
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
        totalUsers: users.length,
        recentMeetings: meetings.slice(0, 5),
        recentTasks: tasks.slice(0, 5)
      });
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName}! Here's your overview.</p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Meetings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMeetings}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-green-600">↑ {stats.upcomingMeetings} upcoming</span>
            <span className="text-gray-600">{stats.completedMeetings} completed</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-yellow-600">{stats.pendingTasks} pending</span>
            <span className="text-green-600">{stats.completedTasks} completed</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/users" className="text-sm text-purple-600 hover:text-purple-800">
              Manage Users →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalTasks > 0 
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/meetings/create"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Meeting</h3>
          <p className="text-gray-600 text-sm">Create a new meeting and invite participants</p>
        </Link>
        <Link
          to="/tasks/assign"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Task</h3>
          <p className="text-gray-600 text-sm">Create and assign tasks to team members</p>
        </Link>
        <Link
          to="/tasks/report"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Report</h3>
          <p className="text-gray-600 text-sm">View detailed reports and analytics</p>
        </Link>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Meetings</h2>
          {stats.recentMeetings.length > 0 ? (
            <div className="space-y-4">
              {stats.recentMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  to={`/meetings/${meeting.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${meeting.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'ONGOING' ? 'bg-yellow-100 text-yellow-800' :
                        meeting.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {meeting.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent meetings</p>
          )}
          <div className="mt-4">
            <Link to="/meetings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all meetings →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
          {stats.recentTasks.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/update/${task.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Assigned to: {task.assigneeName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {task.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent tasks</p>
          )}
          <div className="mt-4">
            <Link to="/tasks" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all tasks →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;