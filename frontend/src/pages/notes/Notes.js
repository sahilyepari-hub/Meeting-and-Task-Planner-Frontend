import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import notesService from '../../services/notesService'; // You'll need to create this
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    meetingId: '',
    taskId: ''
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await notesService.getUserNotes(user.id);
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await notesService.updateNote(editingNote.id, formData);
      } else {
        await notesService.createNote({ ...formData, userId: user.id });
      }
      setShowForm(false);
      setEditingNote(null);
      setFormData({ title: '', content: '', meetingId: '', taskId: '' });
      fetchNotes();
    } catch (err) {
      setError('Failed to save note');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      meetingId: note.meetingId || '',
      taskId: note.taskId || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesService.deleteNote(id);
        fetchNotes();
      } catch (err) {
        setError('Failed to delete note');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <button
          onClick={() => {
            setEditingNote(null);
            setFormData({ title: '', content: '', meetingId: '', taskId: '' });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Note
        </button>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {showForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  rows="5"
                  required
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your notes here..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingNote ? 'Update' : 'Save'} Note
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                <p className="text-gray-600 mb-4 whitespace-pre-line">{note.content}</p>
                <div className="text-xs text-gray-400">
                  Created: {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                <button
                  onClick={() => handleEdit(note)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;