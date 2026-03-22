import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import meetingService from '../../services/meetingService';
import attendanceService from '../../services/attendanceService';
import taskService from '../../services/taskService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meeting, setMeeting] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // Check if ID is valid
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid meeting ID:', id);
      setError('Invalid meeting ID. Redirecting to meetings list...');
      setLoading(false);
      setTimeout(() => navigate('/meetings'), 2000);
      return;
    }
    
    fetchMeetingDetails();
  }, [id, navigate]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching meeting details for ID:', id);
      
      const [meetingData, attendanceData, tasksData] = await Promise.all([
        meetingService.getMeetingById(id).catch(err => {
          console.error('Error fetching meeting:', err);
          return null;
        }),
        attendanceService.getAttendanceByMeeting(id).catch(err => {
          console.error('Error fetching attendance:', err);
          return [];
        }),
        taskService.getTasksByMeeting(id).catch(err => {
          console.error('Error fetching tasks:', err);
          return [];
        })
      ]);
      
      if (!meetingData) {
        setError('Meeting not found');
        return;
      }
      
      setMeeting(meetingData);
      setAttendance(attendanceData || []);
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Failed to fetch meeting details:', err);
      setError('Failed to fetch meeting details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'undefined') {
      setError('Invalid meeting ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await meetingService.deleteMeeting(id);
        navigate('/meetings');
      } catch (err) {
        setError('Failed to delete meeting');
      }
    }
  };

  const handleMarkAttendance = async (status) => {
    if (!id || !user?.id) {
      setError('Invalid meeting or user ID');
      return;
    }
    
    try {
      await attendanceService.markAttendance({
        meetingId: parseInt(id),
        userId: user.id,
        status: status,
        checkInTime: new Date().toISOString()
      });
      const updatedAttendance = await attendanceService.getAttendanceByMeeting(id);
      setAttendance(updatedAttendance || []);
    } catch (err) {
      setError('Failed to mark attendance');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/meetings')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  
  if (!meeting) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Meeting not found</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/meetings')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  const canEdit = user?.role === 'ORGANIZER' || user?.role === 'COLLECTOR';
  const userAttendance = attendance.find(a => a.userId === user?.id);

  return (
    <div className="container mx-auto p-6">
      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{meeting.title}</h1>
            <p className="text-gray-600">{meeting.description}</p>
          </div>
          <div className="flex space-x-2">
            {canEdit && (
              <>
                <Link
                  to={`/meetings/edit/${id}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>{meeting.date ? new Date(meeting.date).toLocaleDateString() : 'N/A'} at {meeting.time || 'N/A'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-5 w-5 mr-2" />
            <span>{meeting.location || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${meeting.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                meeting.status === 'ONGOING' ? 'bg-yellow-100 text-yellow-800' :
                meeting.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'}`}>
              {meeting.status || 'SCHEDULED'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details & Agenda
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'attendance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Attendance ({attendance.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tasks ({tasks.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'details' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Agenda</h2>
            {meeting.agenda ? (
              <div className="whitespace-pre-line">{meeting.agenda}</div>
            ) : (
              <p className="text-gray-500">No agenda provided</p>
            )}

            <h2 className="text-xl font-bold mt-6 mb-4">Additional Information</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900">{meeting.duration || 'N/A'} minutes</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{meeting.departmentName || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Organizer</dt>
                <dd className="mt-1 text-sm text-gray-900">{meeting.organizerName || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Attendance List</h2>
              {!userAttendance && meeting.status === 'ONGOING' && (
                <div className="space-x-2">
                  <button
                    onClick={() => handleMarkAttendance('PRESENT')}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark Present
                  </button>
                  <button
                    onClick={() => handleMarkAttendance('LATE')}
                    className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Mark Late
                  </button>
                </div>
              )}
            </div>

            {attendance.length === 0 ? (
              <p className="text-gray-500">No attendance records yet</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.userName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {record.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Meeting Tasks</h2>
              {canEdit && (
                <Link
                  to={`/tasks/assign?meetingId=${id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Assign New Task
                </Link>
              )}
            </div>

            {tasks.length === 0 ? (
              <p className="text-gray-500">No tasks assigned for this meeting</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id || task.taskId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          task.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Assigned to: {task.assigneeName}</span>
                      <span className="mx-2">•</span>
                      <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {task.assigneeId === user?.id && task.status !== 'COMPLETED' && (
                      <div className="mt-3">
                        <Link
                          to={`/tasks/update/${task.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Update Status
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetailPage;