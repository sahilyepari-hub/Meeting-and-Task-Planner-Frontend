import api from './api';

const meetingService = {
  getAllMeetings: async () => {
    try {
      const response = await api.get('api/meetings');
      return response.data;
    } catch (error) {
      console.error('Error fetching all meetings:', error);
      return [];
    }
  },

  getMeetingById: async (id) => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('getMeetingById called with invalid ID:', id);
      return null;
    }
    
    try {
      console.log('Fetching meeting with ID:', id);
      const response = await api.get(`api/meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching meeting ${id}:`, error);
      return null;
    }
  },

  createMeeting: async (meetingData) => {
    try {
      const response = await api.post('api/meetings', meetingData);
      return response.data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },

  updateMeeting: async (id, meetingData) => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('updateMeeting called with invalid ID:', id);
      throw new Error('Invalid meeting ID');
    }
    
    try {
      const response = await api.put(`api/meetings/${id}`, meetingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating meeting ${id}:`, error);
      throw error;
    }
  },

  deleteMeeting: async (id) => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('deleteMeeting called with invalid ID:', id);
      throw new Error('Invalid meeting ID');
    }
    
    try {
      const response = await api.delete(`api/meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting meeting ${id}:`, error);
      throw error;
    }
  },

  getMeetingsByOrganizer: async (organizerId) => {
    if (!organizerId || organizerId === 'undefined' || organizerId === 'null') {
      console.error('getMeetingsByOrganizer called with invalid organizerId:', organizerId);
      return [];
    }
    
    try {
      const response = await api.get(`api/meetings/organizer/${organizerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching meetings for organizer ${organizerId}:`, error);
      return [];
    }
  },

  getUpcomingMeetings: async () => {
    try {
      console.log('Fetching upcoming meetings...');
      const response = await api.get('api/meetings/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      return [];
    }
  },

  addMinutes: async (meetingId, minutesData) => {
    if (!meetingId || meetingId === 'undefined' || meetingId === 'null') {
      console.error('addMinutes called with invalid meetingId:', meetingId);
      throw new Error('Invalid meeting ID');
    }
    
    try {
      const response = await api.post(`api/meetings/${meetingId}/minutes`, minutesData);
      return response.data;
    } catch (error) {
      console.error(`Error adding minutes for meeting ${meetingId}:`, error);
      throw error;
    }
  },

  getMinutes: async (meetingId) => {
    if (!meetingId || meetingId === 'undefined' || meetingId === 'null') {
      console.error('getMinutes called with invalid meetingId:', meetingId);
      return null;
    }
    
    try {
      const response = await api.get(`api/meetings/${meetingId}/minutes`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching minutes for meeting ${meetingId}:`, error);
      return null;
    }
  }
};

export default meetingService;