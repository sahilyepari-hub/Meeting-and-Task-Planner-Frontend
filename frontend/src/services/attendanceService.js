import api from './api';

const attendanceService = {
  markAttendance: async (attendanceData) => {
    if (!attendanceData) {
      console.error('markAttendance called with no data');
      throw new Error('Attendance data is required');
    }
    
    try {
      const response = await api.post('/attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  getAttendanceByMeeting: async (meetingId) => {
    if (!meetingId || meetingId === 'undefined' || meetingId === 'null') {
      console.error('getAttendanceByMeeting called with invalid meetingId:', meetingId);
      return [];
    }
    
    try {
      const response = await api.get(`/attendance/meeting/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for meeting ${meetingId}:`, error);
      return [];
    }
  },

  getAttendanceByUser: async (userId) => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('getAttendanceByUser called with invalid userId:', userId);
      return [];
    }
    
    try {
      const response = await api.get(`/attendance/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for user ${userId}:`, error);
      return [];
    }
  },

  updateAttendance: async (id, attendanceData) => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('updateAttendance called with invalid id:', id);
      throw new Error('Invalid attendance ID');
    }
    
    try {
      const response = await api.put(`/attendance/${id}`, attendanceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating attendance ${id}:`, error);
      throw error;
    }
  },

  getAttendanceSummary: async (meetingId) => {
    if (!meetingId || meetingId === 'undefined' || meetingId === 'null') {
      console.error('getAttendanceSummary called with invalid meetingId:', meetingId);
      return null;
    }
    
    try {
      const response = await api.get(`/attendance/meeting/${meetingId}/summary`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance summary for meeting ${meetingId}:`, error);
      return null;
    }
  }
};

export default attendanceService;