import React, { createContext, useState, useEffect, useContext } from 'react';
import { getRoutines, createRoutine, deleteRoutine, toggleRoutineCompletion } from '../api/api';
import { format } from 'date-fns';

const RoutineContext = createContext();

export const RoutineProvider = ({ children }) => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const data = await getRoutines();
      setRoutines(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const addRoutine = async (routineData) => {
    try {
      const newRoutine = await createRoutine(routineData);
      setRoutines(prev => [newRoutine, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeRoutine = async (id) => {
    try {
      await deleteRoutine(id);
      setRoutines(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRoutine = async (id) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Optimistic update
    setRoutines(prev => prev.map(r => {
      if (r._id === id) {
        const isCompleted = r.completedDates.includes(todayStr);
        return {
          ...r,
          completedDates: isCompleted 
            ? r.completedDates.filter(d => d !== todayStr) 
            : [...r.completedDates, todayStr]
        };
      }
      return r;
    }));
    
    try {
      await toggleRoutineCompletion(id, todayStr);
    } catch (err) {
      console.error(err);
      fetchRoutines(); // Revert to server state on error
    }
  };

  return (
    <RoutineContext.Provider value={{ routines, loading, addRoutine, removeRoutine, toggleRoutine, fetchRoutines }}>
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutines = () => useContext(RoutineContext);
