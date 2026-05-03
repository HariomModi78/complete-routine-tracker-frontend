import React, { useState } from 'react';
import { useRoutines } from '../context/RoutineContext';
import { format, endOfDay, isBefore, isEqual, startOfDay, subDays, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, XCircle, Clock, Activity, Target, TrendingUp } from 'lucide-react';

const History = () => {
  const { routines, loading, toggleRoutine, updateProgress } = useRoutines();
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [rangeMode, setRangeMode] = useState('1D'); // '1D', '7D', '30D', '1Y'

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading history...</div>;

  const handleToggle = async (id) => {
    await toggleRoutine(id, selectedDateStr || format(new Date(), 'yyyy-MM-dd'));
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const safeDateStr = selectedDateStr || todayStr;
  const selectedDate = new Date(safeDateStr);
  const safeSelectedDate = !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
  const endOfSelected = endOfDay(safeSelectedDate);

  // Filter routines that existed on the selected date
  const relevantRoutines = routines.filter(routine => {
    const createdDate = startOfDay(new Date(routine.createdAt));
    
    if (routine.frequency === 'Once') {
      return isEqual(createdDate, startOfDay(safeSelectedDate));
    }
    
    return isBefore(createdDate, endOfSelected) || isEqual(createdDate, startOfDay(safeSelectedDate));
  });

  const pOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
  const completedRoutines = relevantRoutines
    .filter(r => r.completedDates.includes(safeDateStr))
    .sort((a, b) => (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2));
    
  const pendingRoutines = relevantRoutines
    .filter(r => !r.completedDates.includes(safeDateStr))
    .sort((a, b) => (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2));

  // --- Range Calculation Logic ---
  const referenceDate = safeSelectedDate;
  let rangeStart, rangeEnd;
  let rangeDays = [];
  
  if (rangeMode === '1D') {
    rangeStart = referenceDate;
    rangeEnd = referenceDate;
    rangeDays = [format(referenceDate, 'yyyy-MM-dd')];
  } else if (rangeMode === '7D') {
    rangeStart = subDays(referenceDate, 6);
    rangeEnd = referenceDate;
    rangeDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map(d => format(d, 'yyyy-MM-dd'));
  } else if (rangeMode === '30D') {
    rangeStart = subDays(referenceDate, 29);
    rangeEnd = referenceDate;
    rangeDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map(d => format(d, 'yyyy-MM-dd'));
  } else if (rangeMode === '1Y') {
    rangeStart = subDays(referenceDate, 364);
    rangeEnd = referenceDate;
    rangeDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map(d => format(d, 'yyyy-MM-dd'));
  }

  let rangeTotalPossible = 0;
  let rangeTotalCompleted = 0;
  let rangeTotalProgress = 0;

  routines.forEach(r => {
    // Check which days in the range this routine was active
    const createdDate = startOfDay(new Date(r.createdAt));
    rangeDays.forEach(dayStr => {
      const dayDate = startOfDay(new Date(dayStr));
      if (r.frequency === 'Once' && !isEqual(createdDate, dayDate)) return;
      if (isBefore(createdDate, endOfDay(dayDate)) || isEqual(createdDate, dayDate)) {
        rangeTotalPossible++;
        if (r.completedDates.includes(dayStr)) {
          rangeTotalCompleted++;
          rangeTotalProgress += 100;
        } else {
          const log = r.progressLogs?.find(l => l.date === dayStr);
          if (log) rangeTotalProgress += log.progress;
        }
      }
    });
  });

  const completionRate = rangeTotalPossible > 0 ? Math.round((rangeTotalCompleted / rangeTotalPossible) * 100) : 0;
  const avgProgress = rangeTotalPossible > 0 ? Math.round(rangeTotalProgress / rangeTotalPossible) : 0;


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Daily History</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Review your past performance and consistency.</p>
        
        <div className="glass-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 24px' }}>
          <Calendar size={24} color="var(--accent-primary)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Select Date</label>
            <input 
              type="date" 
              value={selectedDateStr}
              max={todayStr}
              onChange={(e) => {
                setSelectedDateStr(e.target.value);
                setRangeMode('1D'); // Switch to 1 Day view when date changes
              }}
              style={{ 
                background: 'rgba(0,0,0,0.2)', 
                color: 'white', 
                border: '1px solid var(--card-border)', 
                padding: '8px 12px', 
                borderRadius: '8px', 
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </header>

      {/* Range Summary Section */}
      <div className="glass-card" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Activity size={20} color="var(--accent-primary)" /> Extended History
          </h3>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
            {['1D', '7D', '30D', '1Y'].map(range => (
              <button
                key={range}
                onClick={() => {
                  if (range === '1D' && safeDateStr !== todayStr) {
                    setSelectedDateStr(todayStr); // Jumping to 'Today' resets the date to today
                  }
                  setRangeMode(range);
                }}
                style={{
                  background: rangeMode === range ? 'var(--accent-primary)' : 'transparent',
                  color: rangeMode === range ? 'white' : 'var(--text-muted)',
                  border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s'
                }}
              >
                {range === '1Y' ? 'Last Year' : range === '30D' ? 'Last Month' : range === '7D' ? 'Last Week' : (safeDateStr === todayStr ? 'Today' : '1 Day')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3" style={{ gap: '16px' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Target size={24} color="#a78bfa" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tasks Scheduled</span>
            </div>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{rangeTotalPossible}</h3>
          </div>
          <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <CheckCircle2 size={24} color="#34d399" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fully Completed</span>
            </div>
            <h3 style={{ fontSize: '2rem', margin: 0, color: '#34d399' }}>{rangeTotalCompleted}</h3>
          </div>
          <div style={{ padding: '20px', background: 'rgba(236, 72, 153, 0.05)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <TrendingUp size={24} color="#f472b6" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Average Progress</span>
            </div>
            <h3 style={{ fontSize: '2rem', margin: 0, color: '#f472b6' }}>{avgProgress}%</h3>
          </div>
        </div>
      </div>

      {/* Daily Details Header */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Calendar size={24} color="var(--text-muted)" /> Date Details: {format(safeSelectedDate, 'MMMM do, yyyy')}
      </h2>

      <div className="grid grid-cols-2" style={{ marginBottom: '32px' }}>
         <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <CheckCircle2 size={32} color="#34d399" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{completedRoutines.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Tasks Completed</p>
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <XCircle size={32} color="#f87171" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{pendingRoutines.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Tasks Missed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Completed Tasks */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
            <CheckCircle2 size={20} /> Completed Tasks
          </h3>
          {completedRoutines.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No tasks completed on this date.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {completedRoutines.map(routine => {
                const log = routine.progressLogs?.find(l => l.date === safeDateStr);
                const currentProgress = log ? log.progress : 100;
                
                return (
                <div key={routine._id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button 
                        onClick={() => handleToggle(routine._id)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        <CheckCircle2 size={18} color="var(--success)" />
                      </button>
                      <span style={{ color: 'var(--text-main)', fontWeight: '500', textDecoration: 'line-through', opacity: 0.7 }}>{routine.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className={`badge badge-${routine.category.toLowerCase()}`}>{routine.category}</span>
                      {routine.priority && routine.priority !== 'Medium' && (
                        <span className="badge" style={{ 
                          background: routine.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                          color: routine.priority === 'High' ? '#ef4444' : '#10b981' 
                        }}>
                          {routine.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={currentProgress} 
                      onChange={(e) => updateProgress(routine._id, parseInt(e.target.value), safeDateStr)} 
                      style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--success)', height: '4px' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '35px', textAlign: 'right' }}>{currentProgress}%</span>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Missed Tasks */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger, #ef4444)' }}>
            <XCircle size={20} /> Missed Tasks
          </h3>
          {pendingRoutines.length === 0 ? (
             <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>All tasks were completed!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingRoutines.map(routine => {
                const log = routine.progressLogs?.find(l => l.date === safeDateStr);
                const currentProgress = log ? log.progress : 0;
                
                return (
                <div key={routine._id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button 
                        onClick={() => handleToggle(routine._id)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        <Clock size={18} color="#ef4444" />
                      </button>
                      <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{routine.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className={`badge badge-${routine.category.toLowerCase()}`}>{routine.category}</span>
                      {routine.priority && routine.priority !== 'Medium' && (
                        <span className="badge" style={{ 
                          background: routine.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                          color: routine.priority === 'High' ? '#ef4444' : '#10b981' 
                        }}>
                          {routine.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={currentProgress} 
                      onChange={(e) => updateProgress(routine._id, parseInt(e.target.value), safeDateStr)} 
                      style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--danger, #ef4444)', height: '4px' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '35px', textAlign: 'right' }}>{currentProgress}%</span>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default History;
