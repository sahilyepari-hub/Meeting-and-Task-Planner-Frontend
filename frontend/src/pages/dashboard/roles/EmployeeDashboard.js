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
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    upcomingMeetings: 0,
    myTasks: [],
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    recentAttendance: [],
    upcomingDeadlines: []
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

      const now = new Date();
      const myTasks = tasks || [];
      
      setStats({
        upcomingMeetings: meetings.filter(m => new Date(m.date) > now && m.status === 'SCHEDULED').length,
        myTasks: myTasks,
        pendingTasks: myTasks.filter(t => t.status === 'PENDING').length,
        completedTasks: myTasks.filter(t => t.status === 'COMPLETED').length,
        overdueTasks: myTasks.filter(t => t.status === 'OVERDUE' || 
          (t.status !== 'COMPLETED' && new Date(t.dueDate) < now)).length,
        recentAttendance: attendance.slice(0, 5),
        upcomingDeadlines: myTasks
          .filter(t => t.status !== 'COMPLETED')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5)
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
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName}! Here's your task overview.</p>
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
              <p className="text-sm font-medium text-gray-600">Upcoming Meetings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.upcomingMeetings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overdueTasks}</p>
            </div>
          </div>
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

      {/* Tasks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Deadlines</h2>
          {stats.upcomingDeadlines.length > 0 ? (
            <div className="space-y-4">
              {stats.upcomingDeadlines.map((task) => {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <Link
                    key={task.id}
                    to={`/tasks/update/${task.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Due: {dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium
                          ${daysLeft < 0 ? 'text-red-600' : 
                            daysLeft <= 2 ? 'text-yellow-600' : 
                            'text-green-600'}`}>
                          {daysLeft < 0 ? 'Overdue' : 
                           daysLeft === 0 ? 'Due today' : 
                           `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming deadlines</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Attendance</h2>
          {stats.recentAttendance.length > 0 ? (
            <div className="space-y-4">
              {stats.recentAttendance.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Meeting on {new Date(record.date).toLocaleDateString()}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                        record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No attendance records</p>
          )}
        </div>
      </div>

      {/* Task Progress Summary */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Task Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span className="font-medium">
                {stats.myTasks.length > 0 
                  ? Math.round((stats.completedTasks / stats.myTasks.length) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2" 
                style={{ 
                  width: `${stats.myTasks.length > 0 
                    ? (stats.completedTasks / stats.myTasks.length) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mt-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.myTasks.filter(t => t.status === 'IN_PROGRESS').length}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;