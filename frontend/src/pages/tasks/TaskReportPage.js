import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import taskService from '../../services/taskService';
import userService from '../../services/userService'; // This should now work
import departmentService from '../../services/departmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  UserGroupIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

const TaskReportPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: '',
    assigneeId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [reportData, setReportData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    tasksByStatus: {},
    tasksByPriority: {},
    tasksByAssignee: [],
    tasksByDepartment: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    generateReport();
  }, [tasks, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, usersData, deptsData] = await Promise.all([
        taskService.getAllTasks(),
        userService.getAllUsers(),
        departmentService.getAllDepartments()
      ]);
      
      setTasks(tasksData);
      setUsers(usersData);
      setDepartments(deptsData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    // Filter tasks based on selected filters
    let filteredTasks = [...tasks];

    if (filters.departmentId) {
      filteredTasks = filteredTasks.filter(t => t.departmentId === parseInt(filters.departmentId));
    }
    if (filters.assigneeId) {
      filteredTasks = filteredTasks.filter(t => t.assigneeId === parseInt(filters.assigneeId));
    }
    if (filters.status) {
      filteredTasks = filteredTasks.filter(t => t.status === filters.status);
    }
    if (filters.dateFrom) {
      filteredTasks = filteredTasks.filter(t => new Date(t.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filteredTasks = filteredTasks.filter(t => new Date(t.createdAt) <= new Date(filters.dateTo));
    }

    // Calculate statistics
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = filteredTasks.filter(t => t.status === 'PENDING').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const overdueTasks = filteredTasks.filter(t => 
      t.status !== 'COMPLETED' && new Date(t.dueDate) < new Date()
    ).length;

    // Tasks by status
    const tasksByStatus = {
      PENDING: pendingTasks,
      IN_PROGRESS: inProgressTasks,
      COMPLETED: completedTasks,
      OVERDUE: overdueTasks
    };

    // Tasks by priority
    const tasksByPriority = {
      LOW: filteredTasks.filter(t => t.priority === 'LOW').length,
      MEDIUM: filteredTasks.filter(t => t.priority === 'MEDIUM').length,
      HIGH: filteredTasks.filter(t => t.priority === 'HIGH').length,
      URGENT: filteredTasks.filter(t => t.priority === 'URGENT').length
    };

    // Tasks by assignee
    const tasksByAssignee = users.map(u => ({
      name: u.fullName,
      total: filteredTasks.filter(t => t.assigneeId === u.id).length,
      completed: filteredTasks.filter(t => t.assigneeId === u.id && t.status === 'COMPLETED').length
    })).filter(u => u.total > 0);

    // Tasks by department
    const tasksByDepartment = departments.map(d => ({
      name: d.name,
      total: filteredTasks.filter(t => t.departmentId === d.id).length,
      completed: filteredTasks.filter(t => t.departmentId === d.id && t.status === 'COMPLETED').length
    })).filter(d => d.total > 0);

    setReportData({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByStatus,
      tasksByPriority,
      tasksByAssignee,
      tasksByDepartment
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Task Title', 'Status', 'Priority', 'Assignee', 'Department', 'Due Date', 'Created At'].join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        task.status,
        task.priority,
        `"${task.assigneeName}"`,
        `"${task.departmentName}"`,
        new Date(task.dueDate).toLocaleDateString(),
        new Date(task.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Task Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">View comprehensive reports and insights about tasks</p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="departmentId"
              value={filters.departmentId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <select
              name="assigneeId"
              value={filters.assigneeId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{reportData.completedTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{reportData.completionRate}% completion rate</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{reportData.inProgressTasks}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{reportData.overdueTasks}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks by Status</h2>
          <div className="space-y-4">
            {Object.entries(reportData.tasksByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{status.replace('_', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`rounded-full h-2 ${
                      status === 'COMPLETED' ? 'bg-green-600' :
                      status === 'IN_PROGRESS' ? 'bg-yellow-600' :
                      status === 'OVERDUE' ? 'bg-red-600' :
                      'bg-gray-600'
                    }`}
                    style={{ width: reportData.totalTasks > 0 ? (count / reportData.totalTasks) * 100 + '%' : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks by Priority</h2>
          <div className="space-y-4">
            {Object.entries(reportData.tasksByPriority).map(([priority, count]) => (
              <div key={priority}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{priority}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`rounded-full h-2 ${
                      priority === 'URGENT' ? 'bg-red-600' :
                      priority === 'HIGH' ? 'bg-orange-600' :
                      priority === 'MEDIUM' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: reportData.totalTasks > 0 ? (count / reportData.totalTasks) * 100 + '%' : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tasks by Assignee */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Tasks by Assignee
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Assignee</th>
                  <th className="text-center py-2">Total</th>
                  <th className="text-center py-2">Completed</th>
                  <th className="text-center py-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tasksByAssignee.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.total}</td>
                    <td className="text-center py-2">{item.completed}</td>
                    <td className="text-center py-2">
                      {item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks by Department */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Tasks by Department
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Department</th>
                  <th className="text-center py-2">Total</th>
                  <th className="text-center py-2">Completed</th>
                  <th className="text-center py-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tasksByDepartment.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.total}</td>
                    <td className="text-center py-2">{item.completed}</td>
                    <td className="text-center py-2">
                      {item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 flex items-center"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export Report (CSV)
        </button>
      </div>
    </div>
  );
};

export default TaskReportPage;