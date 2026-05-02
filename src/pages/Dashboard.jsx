import React, { useState } from 'react';
import { useRoutines } from '../context/RoutineContext';
import { format, subDays, isWithinInterval, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, getDayOfYear } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, CheckCircle2, Activity, Filter } from 'lucide-react';

const Dashboard = () => {
  const { routines, loading } = useRoutines();
  const [timeRange, setTimeRange] = useState('7D'); // 7D, 30D, 1Y, CUSTOM
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 14), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading your progress...</div>;

  const MOTIVATIONAL_QUOTES = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "Your future is created by what you do today, not tomorrow.",
    "The secret of your future is hidden in your daily routine.",
    "Discipline is choosing between what you want now and what you want most.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "Little by little, a little becomes a lot.",
    "Don't count the days, make the days count.",
    "Every action you take is a vote for the type of person you wish to become.",
    "The only bad workout is the one that didn't happen."
  ];

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const dayOfYear = getDayOfYear(new Date());
  const dailyQuote = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];

  const completedToday = routines.filter(r => r.completedDates.includes(todayStr)).length;
  const todayCompletionRate = routines.length ? Math.round((completedToday / routines.length) * 100) : 0;

  // Compute chart data based on timeRange
  let chartData = [];
  let startDate, endDate;
  const today = new Date();

  if (timeRange === '7D') {
    startDate = subDays(today, 6);
    endDate = today;
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    chartData = days.map(date => {
      const dStr = format(date, 'yyyy-MM-dd');
      return { label: format(date, 'EEE'), count: routines.filter(r => r.completedDates.includes(dStr)).length };
    });
  } else if (timeRange === '30D') {
    startDate = subDays(today, 29);
    endDate = today;
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    chartData = days.map(date => {
      const dStr = format(date, 'yyyy-MM-dd');
      return { label: format(date, 'dd'), count: routines.filter(r => r.completedDates.includes(dStr)).length };
    });
  } else if (timeRange === '1Y') {
    startDate = startOfYear(today);
    endDate = endOfYear(today);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    chartData = months.map(month => {
      const mStart = startOfMonth(month);
      const mEnd = endOfMonth(month);
      const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd }).map(d => format(d, 'yyyy-MM-dd'));
      let count = 0;
      routines.forEach(r => {
        count += r.completedDates.filter(d => daysInMonth.includes(d)).length;
      });
      return { label: format(month, 'MMM'), count };
    });
  } else if (timeRange === 'CUSTOM') {
    if (customStart && customEnd && new Date(customStart) <= new Date(customEnd)) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Group by month if more than 60 days to prevent chart crowding
      if (days.length > 60) {
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        chartData = months.map(month => {
          const mStart = startOfMonth(month) < startDate ? startDate : startOfMonth(month);
          const mEnd = endOfMonth(month) > endDate ? endDate : endOfMonth(month);
          const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd }).map(d => format(d, 'yyyy-MM-dd'));
          let count = 0;
          routines.forEach(r => {
            count += r.completedDates.filter(d => daysInMonth.includes(d)).length;
          });
          return { label: format(month, 'MMM yy'), count };
        });
      } else {
        chartData = days.map(date => {
          const dStr = format(date, 'yyyy-MM-dd');
          return { label: format(date, 'dd MMM'), count: routines.filter(r => r.completedDates.includes(dStr)).length };
        });
      }
    }
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  const totalCompletionsInRange = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Track your daily progress and maintain your streak.</p>
        
        <div style={{ background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05))', padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)', display: 'inline-block' }}>
          <p style={{ fontStyle: 'italic', margin: 0, color: 'var(--text-main)', fontSize: '1.05rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', lineHeight: 1 }}>"</span>
            {dailyQuote}
            <span style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', lineHeight: 1, alignSelf: 'flex-end' }}>"</span>
          </p>
        </div>
      </header>

      {/* Today Stats */}
      <div className="grid grid-cols-3" style={{ marginBottom: '40px' }}>
        <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <Target size={32} color="#34d399" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{routines.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Active Routines</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <CheckCircle2 size={32} color="#a78bfa" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{completedToday}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Completed Today</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <TrendingUp size={32} color="#f472b6" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{todayCompletionRate}%</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Today's Success Rate</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1" style={{ marginBottom: '24px' }}>
        {/* Analytics Section with Tabs */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Activity size={20} color="var(--accent-primary)" /> Progress Analytics
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', overflowX: 'auto' }}>
              {['7D', '30D', '1Y', 'CUSTOM'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    background: timeRange === range ? 'var(--accent-primary)' : 'transparent',
                    color: timeRange === range ? 'white' : 'var(--text-muted)',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {range === '1Y' ? 'This Year' : range === '7D' ? 'Last 7 Days' : range === '30D' ? 'Last 30 Days' : 'Custom'}
                </button>
              ))}
            </div>
          </div>

          {timeRange === 'CUSTOM' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Filter size={16} color="var(--text-muted)" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>From:</span>
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={e => setCustomStart(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>To:</span>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={e => setCustomEnd(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                />
              </div>
            </motion.div>
          )}

          {/* Range Stats */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px dashed var(--card-border)' }}>
             <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Total Routines Completed</p>
                <h4 style={{ fontSize: '2rem', margin: 0, color: 'var(--accent-primary)' }}>{totalCompletionsInRange}</h4>
             </div>
          </div>

          {/* Chart */}
          <div style={{ position: 'relative', height: '280px', display: 'flex', alignItems: 'flex-end', gap: chartData.length > 20 ? '2px' : '12px', overflowX: 'auto', paddingBottom: '24px' }}>
            {chartData.length > 0 ? chartData.map((dataPoint, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: chartData.length > 20 ? '16px' : '40px' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-main)', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  opacity: dataPoint.count > 0 ? 1 : 0.3
                }}>
                  {dataPoint.count}
                </span>
                <div style={{ height: '200px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(dataPoint.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    style={{ 
                      width: '100%', 
                      maxWidth: '50px',
                      background: dataPoint.count > 0 
                        ? 'linear-gradient(to top, var(--accent-primary), var(--accent-secondary))'
                        : 'rgba(255,255,255,0.05)',
                      borderRadius: '6px 6px 0 0',
                      minHeight: dataPoint.count === 0 ? '4px' : '0'
                    }} 
                  />
                </div>
                {/* Labels: Show all if few, otherwise thin them out */}
                {(chartData.length <= 15 || i % Math.ceil(chartData.length / 10) === 0 || i === chartData.length - 1) ? (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '12px', whiteSpace: 'nowrap' }}>
                    {dataPoint.label}
                  </span>
                ) : (
                  <span style={{ height: '16px', marginTop: '12px' }}></span>
                )}
              </div>
            )) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Please select a valid date range.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Today's Tasks Summary */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="var(--accent-secondary)" /> Today's Snapshot
        </h3>
        {routines.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No routines added yet. Start by creating one!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {routines.map(routine => {
              const isCompleted = routine.completedDates.includes(todayStr);
              return (
                <div key={routine._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '20px', height: '20px', borderRadius: '50%', 
                      border: `2px solid ${isCompleted ? 'var(--success)' : 'var(--text-muted)'}`,
                      background: isCompleted ? 'var(--success)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isCompleted && <CheckCircle2 size={14} color="white" />}
                    </div>
                    <span style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: '500' }}>{routine.title}</span>
                  </div>
                  <span className={`badge badge-${routine.category.toLowerCase()}`}>{routine.category}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default Dashboard;
