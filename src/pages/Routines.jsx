import React, { useState } from 'react';
import { useRoutines } from '../context/RoutineContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, Clock, Tag } from 'lucide-react';

const Routines = () => {
  const { routines, loading, addRoutine, removeRoutine, toggleRoutine } = useRoutines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [frequency, setFrequency] = useState('Daily');
  const [timeOfDay, setTimeOfDay] = useState('Anytime');

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addRoutine({ title, description, category, frequency, timeOfDay });
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      await removeRoutine(id);
    }
  };

  const handleToggle = async (id) => {
    await toggleRoutine(id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mobile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>My Routines</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your habits and daily tasks.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Routine
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading routines...</div>
      ) : (
        <div className="grid grid-cols-2">
          <AnimatePresence>
            {routines.map(routine => {
              const isCompleted = routine.completedDates.includes(todayStr);
              return (
                <motion.div 
                  key={routine._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card"
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {isCompleted && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--success)' }} />
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <button 
                        onClick={() => handleToggle(routine._id)}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', 
                          color: isCompleted ? 'var(--success)' : 'var(--text-muted)',
                          padding: 0, marginTop: '2px', transition: 'transform 0.2s'
                        }}
                      >
                        {isCompleted ? <CheckCircle size={28} /> : <Circle size={28} />}
                      </button>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)' }}>
                          {routine.title}
                        </h3>
                        {routine.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{routine.description}</p>}
                        
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${routine.category.toLowerCase()}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag size={12} /> {routine.category}
                          </span>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {routine.timeOfDay}
                          </span>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {routine.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(routine._id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Progress</span>
                      <span>{routine.completedDates.length} total completions</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {routines.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--card-border)' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Plus size={30} color="var(--accent-primary)" />
              </div>
              <h3 style={{ marginBottom: '8px' }}>No Routines Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Create your first routine to start tracking your habits.</p>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Create Routine</button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass" style={{ width: '100%', maxWidth: '500px', padding: '30px' }}
            >
              <h2 style={{ marginBottom: '24px' }}>Add New Routine</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Morning Jog" required />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={3} />
                </div>
                
                <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                      {['Work', 'Health', 'Learning', 'Leisure', 'Other'].map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Time of Day</label>
                    <select className="form-control" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)}>
                      {['Morning', 'Afternoon', 'Evening', 'Anytime'].map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Frequency</label>
                  <select className="form-control" value={frequency} onChange={e => setFrequency(e.target.value)}>
                    {['Daily', 'Weekly', 'Monthly'].map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
                  <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Routine</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Routines;
