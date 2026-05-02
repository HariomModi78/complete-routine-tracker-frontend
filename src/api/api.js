import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/routines';

export const getRoutines = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createRoutine = async (routineData) => {
  const response = await axios.post(API_URL, routineData);
  return response.data;
};

export const updateRoutine = async (id, routineData) => {
  const response = await axios.put(`${API_URL}/${id}`, routineData);
  return response.data;
};

export const deleteRoutine = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const toggleRoutineCompletion = async (id, date) => {
  const response = await axios.put(`${API_URL}/${id}`, { toggleDate: date });
  return response.data;
};
