import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import meetingService from '../../../services/meetingService';
import taskService from '../../../services/taskService';
import attendanceService from '../../../services/attendanceService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const CollectorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    todayMeetings: 0,
    upcomingMeetings: 0,
    assignedTasks: 0,
    completedTasks: 0,
    pendingAttendance: 0,
    recentMeetings: [],
    myTasks: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [meetings, tasks, attendance] = await Promise.all([
        meetingService.getAllMeetings(),
        taskService.getTasksByAssignee(user.id),
        attendanceService.getAttendanceByUser(user.id)
      ]);

      const today = new Date().toDateString();
      const now = new Date();

      setStats({
        todayMeetings: meetings.filter(m => new Date(m.date).toDateString() === today).length,
        upcomingMeetings: meetings.filter(m => new Date(m.date) > now).length,
        assignedTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
        pendingAttendance: meetings.filter(m => 
          new Date(m.date).toDateString() === today && 
          !attendance.some(a => a.meetingId === m.id)
        ).length,
        recentMeetings: meetings.slice(0, 5),
        myTasks: tasks.slice(0, 5)
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
        <h1 className="text-3xl font-bold text-gray-900">Collector Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName}! Track your meetings and tasks.</p>
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
              <p className="text-sm font-medium text-gray-600">Today's Meetings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.todayMeetings}</p>
            </div>
          </div>
          {stats.pendingAttendance > 0 && (
            <div className="mt-2">
              <span className="text-xs text-yellow-600">
                {stats.pendingAttendance} pending attendance
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.upcomingMeetings}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Scheduled meetings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.assignedTasks}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.assignedTasks - stats.completedTasks} pending</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Tasks completed</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/meetings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Meetings</h3>
          <p className="text-gray-600 text-sm">Check your scheduled meetings and mark attendance</p>
        </Link>
        <Link
          to="/tasks"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Tasks</h3>
          <p className="text-gray-600 text-sm">View and update your assigned tasks</p>
        </Link>
      </div>

      {/* Today's Schedule and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
          {stats.recentMeetings.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length > 0 ? (
            <div className="space-y-4">
              {stats.recentMeetings
                .filter(m => new Date(m.date).toDateString() === new Date().toDateString())
                .map((meeting) => (
                  <Link
                    key={meeting.id}
                    to={`/meetings/${meeting.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                        <p className="text-sm text-gray-600">Time: {meeting.time}</p>
                        <p className="text-sm text-gray-600">Location: {meeting.location}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${meeting.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                          meeting.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {meeting.status}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No meetings scheduled for today</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">My Pending Tasks</h2>
          {stats.myTasks.filter(t => t.status !== 'COMPLETED').length > 0 ? (
            <div className="space-y-4">
              {stats.myTasks
                .filter(t => t.status !== 'COMPLETED')
                .map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/update/${task.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {task.status}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending tasks</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;