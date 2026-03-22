import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import taskService from '../../services/taskService';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TaskUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    progress: 0,
    notes: '',
    completedAt: ''
  });

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTaskById(id);
      setTask(data);
      setFormData({
        status: data.status,
        progress: data.progress || 0,
        notes: data.notes || '',
        completedAt: data.completedAt || ''
      });
    } catch (err) {
      setError('Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await taskService.updateTaskStatus(id, formData.status, formData.notes);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!task) return <div>Task not found</div>;

  // Check if user is authorized to update this task
  if (task.assigneeId !== user?.id && user?.role !== 'ORGANIZER' && user?.role !== 'COLLECTOR') {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                You are not authorized to update this task.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Update Task Status</h1>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
        <p className="text-gray-600 mb-4">{task.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Assigned by:</span> {task.assignerName}
          </div>
          <div>
            <span className="font-medium">Due Date:</span> {new Date(task.dueDate).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Priority:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full
              ${task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'}`}>
              {task.priority}
            </span>
          </div>
          <div>
            <span className="font-medium">Current Status:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full
              ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'}`}>
              {task.status}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-6">
          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status *
            </label>
            <select
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Progress (if in progress) */}
          {formData.status === 'IN_PROGRESS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress ({formData.progress}%)
              </label>
              <input
                type="range"
                name="progress"
                min="0"
                max="100"
                step="5"
                value={formData.progress}
                onChange={handleChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Completion Date (if completed) */}
          {formData.status === 'COMPLETED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Date
              </label>
              <input
                type="datetime-local"
                name="completedAt"
                value={formData.completedAt}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Update Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Notes
            </label>
            <textarea
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide details about your progress, challenges, or completion notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskUpdate;