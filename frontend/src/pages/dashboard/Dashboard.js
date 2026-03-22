import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import meetingService from '../../services/meetingService';
import taskService from '../../services/taskService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    pendingTasks: 0,
    completedTasks: 0,
    recentMeetings: [],
    recentTasks: []
  });

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (user?.role === 'ORGANIZER') {
      navigate('/dashboard/organizer');
    } else if (user?.role === 'COLLECTOR') {
      navigate('/dashboard/collector');
    } else if (user?.role === 'EMPLOYEE') {
      navigate('/dashboard/employee');
    } else {
      // If no role-specific dashboard, fetch data for main dashboard
      fetchDashboardData();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      let meetings = [];
      let tasks = [];
      
      try {
        meetings = await meetingService.getUpcomingMeetings() || [];
        console.log('Upcoming meetings:', meetings);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        meetings = [];
      }
      
      if (user?.id) {
        try {
          tasks = await taskService.getTasksByAssignee(user.id) || [];
          console.log('Tasks:', tasks);
        } catch (err) {
          console.error('Error fetching tasks:', err);
          tasks = [];
        }
      }

      const now = new Date();
      
      setStats({
        totalMeetings: meetings.length || 0,
        upcomingMeetings: meetings.filter(m => m.date && new Date(m.date) > now).length || 0,
        pendingTasks: tasks.filter(t => t.status !== 'COMPLETED').length || 0,
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length || 0,
        recentMeetings: meetings.slice(0, 5) || [],
        recentTasks: tasks.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {user?.fullName || user?.username || 'User'}!</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Meetings</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalMeetings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Upcoming Meetings</h3>
          <p className="text-3xl font-bold text-green-600">{stats.upcomingMeetings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Completed Tasks</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Meetings</h2>
          {stats.recentMeetings.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {stats.recentMeetings.map((meeting) => (
                <li key={meeting.id || meeting.meetingId} className="py-3">
                  <p className="font-medium">{meeting.title}</p>
                  <p className="text-sm text-gray-500">
                    {meeting.date ? new Date(meeting.date).toLocaleDateString() : 'N/A'} at {meeting.time || 'N/A'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent meetings</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
          {stats.recentTasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {stats.recentTasks.map((task) => (
                <li key={task.id || task.taskId} className="py-3">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {task.status}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent tasks</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;