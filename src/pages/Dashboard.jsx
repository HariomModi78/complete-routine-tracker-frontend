import React, { useState } from 'react';
import { useRoutines } from '../context/RoutineContext';
import { format, subDays, isWithinInterval, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, getDayOfYear } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, CheckCircle2, Activity, Filter } from 'lucide-react';

const Dashboard = () => {
  const { routines, loading, updateProgress } = useRoutines();

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

  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
  const activeRoutines = routines
    .filter(r => r.frequency !== 'Once' || format(new Date(r.createdAt), 'yyyy-MM-dd') === todayStr)
    .sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));
  const completedToday = activeRoutines.filter(r => r.completedDates.includes(todayStr)).length;
  const todayCompletionRate = activeRoutines.length ? Math.round((completedToday / activeRoutines.length) * 100) : 0;

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
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{activeRoutines.length}</h3>
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


      
      {/* Today's Tasks Summary */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="var(--accent-secondary)" /> Today's Snapshot
        </h3>
        {activeRoutines.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No routines added yet. Start by creating one!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {activeRoutines.map(routine => {
              const isCompleted = routine.completedDates.includes(todayStr);
              const log = routine.progressLogs?.find(l => l.date === todayStr);
              const currentProgress = log ? log.progress : (isCompleted ? 100 : 0);
              
              return (
                <div key={routine._id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                      onChange={(e) => updateProgress(routine._id, parseInt(e.target.value), todayStr)} 
                      style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--accent-primary)', height: '4px' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '35px', textAlign: 'right' }}>{currentProgress}%</span>
                  </div>
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
