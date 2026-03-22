import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import meetingService from '../../services/meetingService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useAuth } from '../../context/AuthContext';

const MeetingsList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getAllMeetings();
      setMeetings(data);
    } catch (err) {
      setError('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await meetingService.deleteMeeting(id);
        setMeetings(meetings.filter(m => m.meetingId !== id));
      } catch (err) {
        setError('Failed to delete meeting');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meetings</h1>
        {(user?.role === 'ORGANIZER' || user?.role === 'COLLECTOR') && (
          <Link
            to="/meetings/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Meeting
          </Link>
        )}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No meetings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (

            
            <div key={meeting.meetingId} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{meeting.title}</h3>
                <p className="text-gray-600 mb-4">{meeting.description}</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Date:</span> {new Date(meeting.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {meeting.time}</p>
                  <p><span className="font-medium">Location:</span> {meeting.location}</p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium
                      ${meeting.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'ONGOING' ? 'bg-yellow-100 text-yellow-800' :
                        meeting.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {meeting.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                <Link
                  to={`/meetings/${meeting.meetingId}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details
                </Link>
                {(user?.role === 'ORGANIZER' || user?.role === 'COLLECTOR') && (
                  <>
                    <Link
                      to={`/meetings/edit/${meeting.meetingId}`}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(meeting.meetingId)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingsList;