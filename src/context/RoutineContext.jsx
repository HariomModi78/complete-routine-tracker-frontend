import React, { createContext, useState, useEffect, useContext } from 'react';
import { getRoutines, createRoutine, deleteRoutine, toggleRoutineCompletion, updateRoutineProgress } from '../api/api';
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

  const toggleRoutine = async (id, customDateStr) => {
    const dateStr = customDateStr || format(new Date(), 'yyyy-MM-dd');
    
    // Optimistic update
    setRoutines(prev => prev.map(r => {
      if (r._id === id) {
        const isCompleted = r.completedDates.includes(dateStr);
        let newLogs = [...(r.progressLogs || [])];
        const logIndex = newLogs.findIndex(log => log.date === dateStr);
        
        if (isCompleted) {
          if (logIndex >= 0) newLogs[logIndex].progress = 0;
        } else {
          if (logIndex >= 0) newLogs[logIndex].progress = 100;
          else newLogs.push({ date: dateStr, progress: 100 });
        }

        return {
          ...r,
          progressLogs: newLogs,
          completedDates: isCompleted 
            ? r.completedDates.filter(d => d !== dateStr) 
            : [...r.completedDates, dateStr]
        };
      }
      return r;
    }));
    
    try {
      await toggleRoutineCompletion(id, dateStr);
    } catch (err) {
      console.error(err);
      fetchRoutines(); // Revert to server state on error
    }
  };

  const updateProgress = async (id, progress, customDateStr) => {
    const dateStr = customDateStr || format(new Date(), 'yyyy-MM-dd');
    
    // Optimistic update
    setRoutines(prev => prev.map(r => {
      if (r._id === id) {
        let newLogs = [...(r.progressLogs || [])];
        const logIndex = newLogs.findIndex(log => log.date === dateStr);
        if (logIndex >= 0) {
          newLogs[logIndex].progress = progress;
        } else {
          newLogs.push({ date: dateStr, progress });
        }
        
        let newCompleted = [...r.completedDates];
        if (progress === 100 && !newCompleted.includes(dateStr)) {
          newCompleted.push(dateStr);
        } else if (progress < 100 && newCompleted.includes(dateStr)) {
          newCompleted = newCompleted.filter(d => d !== dateStr);
        }
        
        return {
          ...r,
          progressLogs: newLogs,
          completedDates: newCompleted
        };
      }
      return r;
    }));
    
    try {
      await updateRoutineProgress(id, dateStr, progress);
    } catch (err) {
      console.error(err);
      fetchRoutines(); // Revert
    }
  };

  return (
    <RoutineContext.Provider value={{ routines, loading, addRoutine, removeRoutine, toggleRoutine, updateProgress, fetchRoutines }}>
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutines = () => useContext(RoutineContext);
