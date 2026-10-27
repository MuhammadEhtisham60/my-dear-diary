import { useState, useEffect } from 'react';
import {
  Plus, Calendar, Clock, CheckCircle, Trash2, Edit2,
  Check, ChevronDown, ChevronUp,
} from 'lucide-react';
import { notesApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const PRIORITY_COLORS = {
  high:   { color: '#A8412E', bg: '#F2D5CC' },
  medium: { color: '#D4A017', bg: '#F5E4A8' },
  low:    { color: '#4A9E8E', bg: '#C8EDE8' },
};

const today    = new Date().toISOString().split('T')[0];
const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })();
const weekEnd  = (() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().split('T')[0]; })();

function NoteCard({ note, onToggle, onEdit, onDelete }) {
  const p = PRIORITY_COLORS[note.priority] || PRIORITY_COLORS.low;
  const dateObj = new Date(note.date + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`note-card ${note.completed ? 'completed' : ''}`}
      style={{ borderLeft: `3px solid ${note.completed ? 'var(--border-light)' : p.color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button
          className="btn btn-ghost btn-icon btn-icon-sm"
          onClick={() => onToggle(note.id)}
          id={`note-check-${note.id}`}
          style={{ flexShrink: 0, marginTop: 1 }}
        >
          {note.completed
            ? <CheckCircle size={18} color="var(--sage-500)" />
            : <div style={{ width: 18, height: 18, border: '2px solid var(--border-strong)', borderRadius: 4 }} />
          }
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="note-title">{note.title}</div>
          {note.description && <div className="note-desc">{note.description}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
            <span className="note-time"><Calendar size={11} /> {dateStr}</span>
            {note.reminderTime && <span className="note-time"><Clock size={11} /> {note.reminderTime}</span>}
            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)', background: p.bg, color: p.color }}>
              {note.priority}
            </span>
            {note.tags?.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => onEdit(note)} id={`note-edit-${note.id}`}>
            <Edit2 size={14} />
          </button>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => onDelete(note.id)} id={`note-delete-${note.id}`}
            style={{ color: 'var(--terra-400)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { title: '', description: '', date: today, reminderTime: '09:00', priority: 'medium', tags: [] };

export default function FutureNotesPage() {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const toast = useToast();

  useEffect(() => {
    notesApi.getAll().then(n => { setNotes(n); setLoading(false); });
  }, []);

  const set = f => v => setForm(p => ({ ...p, [f]: v }));

  const openCreate = () => { setEditNote(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (note) => { setEditNote(note); setForm({ ...EMPTY_FORM, ...note }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      if (editNote) {
        const updated = await notesApi.update(editNote.id, form);
        setNotes(prev => prev.map(n => n.id === editNote.id ? updated : n));
        toast.success('Note updated!');
      } else {
        const created = await notesApi.create(form);
        setNotes(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
        toast.success('Note added!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    const updated = await notesApi.toggleComplete(id);
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
  };

  const handleDelete = async () => {
    await notesApi.delete(deleteId);
    setNotes(prev => prev.filter(n => n.id !== deleteId));
    toast.success('Note deleted.');
    setDeleteId(null);
  };

  const active    = notes.filter(n => !n.completed);
  const completed = notes.filter(n => n.completed);

  const sections = [
    { label: 'Today',     notes: active.filter(n => n.date === today),                         emoji: '📅' },
    { label: 'Tomorrow',  notes: active.filter(n => n.date === tomorrow),                      emoji: '🌅' },
    { label: 'This Week', notes: active.filter(n => n.date > tomorrow && n.date <= weekEnd),   emoji: '📆' },
    { label: 'Upcoming',  notes: active.filter(n => n.date > weekEnd),                        emoji: '🔭' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">Future Notes</h1>
          <p className="page-subtitle">{active.length} active · {completed.length} completed</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-note-btn">
          <Plus size={15} /> Add Note
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />)}
        </div>
      ) : (
        <>
          {sections.map(section => (
            section.notes.length > 0 && (
              <div key={section.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1rem' }}>{section.emoji}</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{section.label}</h3>
                  <span style={{ fontSize: '0.75rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-full)', padding: '0 6px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {section.notes.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {section.notes.map(note => (
                    <NoteCard key={note.id} note={note} onToggle={handleToggle} onEdit={openEdit} onDelete={setDeleteId} />
                  ))}
                </div>
              </div>
            )
          ))}

          {active.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🗒️</div>
              <h3>No upcoming notes</h3>
              <p>Plan your future activities, reminders, and goals.</p>
              <button className="btn btn-primary btn-sm" onClick={openCreate} id="empty-add-note-btn">
                <Plus size={14} /> Add First Note
              </button>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowCompleted(s => !s)}
                id="toggle-completed-btn"
                style={{ color: 'var(--text-muted)' }}
              >
                {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showCompleted ? 'Hide' : 'Show'} completed ({completed.length})
              </button>
              {showCompleted && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.75rem' }}>
                  {completed.map(note => (
                    <NoteCard key={note.id} note={note} onToggle={handleToggle} onEdit={openEdit} onDelete={setDeleteId} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editNote ? 'Edit Note' : 'Add Future Note'}
        id="note-modal"
        footer={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} id="note-modal-cancel">Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} id="note-modal-save">
              {saving ? 'Saving...' : editNote ? 'Update Note' : 'Add Note'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input type="text" className="form-input" placeholder="What do you need to do?" value={form.title} onChange={e => set('title')(e.target.value)} id="note-title-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} placeholder="Add more details..." value={form.description} onChange={e => set('description')(e.target.value)} id="note-desc-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={e => set('date')(e.target.value)} id="note-date-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Reminder Time</label>
              <input type="time" className="form-input" value={form.reminderTime} onChange={e => set('reminderTime')(e.target.value)} id="note-time-input" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['high', 'medium', 'low'].map(p => {
                const c = PRIORITY_COLORS[p];
                return (
                  <button key={p} type="button"
                    onClick={() => set('priority')(p)}
                    id={`priority-${p}`}
                    style={{
                      flex: 1, padding: '0.4rem', borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${form.priority === p ? c.color : 'var(--border-default)'}`,
                      background: form.priority === p ? c.bg : 'var(--bg-surface)',
                      color: form.priority === p ? c.color : 'var(--text-muted)',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >{p}</button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete this note?"
        message="This note will be permanently deleted."
        confirmLabel="Delete"
      />
    </div>
  );
}
