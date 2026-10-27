import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, Send, ArrowLeft, Trash2, Heart, Bold, Italic, Underline,
  List, AlignLeft, Quote, Minus, Calendar,
} from 'lucide-react';
import MoodSelector from '../ui/MoodSelector';
import TagSelector from '../ui/TagSelector';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { entriesApi } from '../../services/api';

const EMPTY_FORM = {
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  mood: '',
  tags: [],
  isFavorite: false,
  isDraft: false,
};

export default function DiaryEditor({ initialData = null, isEdit = false }) {
  const [form, setForm]         = useState(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [wordCount, setWordCount]   = useState(0);

  const navigate = useNavigate();
  const toast    = useToast();
  const { id }   = useParams();

  useEffect(() => {
    const words = form.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [form.content]);

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async (isDraft = false) => {
    if (!form.title.trim()) { toast.error('Please add a title before saving.'); return; }
    if (!form.content.trim()) { toast.error('Please write some content before saving.'); return; }

    setSaving(true);
    try {
      const data = { ...form, isDraft };
      if (isEdit && id) {
        await entriesApi.update(id, data);
        toast.success('Entry updated successfully!');
      } else {
        await entriesApi.create(data);
        toast.success(isDraft ? 'Draft saved.' : 'Entry saved!');
      }
      navigate('/diary');
    } catch (err) {
      toast.error(err.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await entriesApi.delete(id);
      toast.success('Entry deleted.');
      navigate('/diary');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const insertText = (prefix, suffix = '') => {
    const ta = document.getElementById('editor-textarea');
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const selected = form.content.slice(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = form.content.slice(0, start) + replacement + form.content.slice(end);
    set('content')(newContent);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'text').length); }, 0);
  };

  const TOOLBAR = [
    { icon: Bold,      label: 'Bold',        action: () => insertText('**', '**') },
    { icon: Italic,    label: 'Italic',      action: () => insertText('_', '_') },
    { icon: Underline, label: 'Underline',   action: () => insertText('<u>', '</u>') },
    null, // separator
    { icon: List,      label: 'List',        action: () => insertText('\n- ') },
    { icon: Quote,     label: 'Quote',       action: () => insertText('\n> ') },
    { icon: Minus,     label: 'Divider',     action: () => insertText('\n---\n') },
    { icon: AlignLeft, label: 'Paragraph',   action: () => insertText('\n\n') },
  ];

  return (
    <div>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} id="editor-back-btn">
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isEdit && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)} id="editor-delete-btn">
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleSave(true)}
            disabled={saving}
            id="editor-draft-btn"
          >
            <Save size={14} /> Save Draft
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleSave(false)}
            disabled={saving}
            id="editor-save-btn"
          >
            <Send size={14} /> {isEdit ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Main Editor */}
        <div>
          {/* Title Input */}
          <input
            type="text"
            value={form.title}
            onChange={e => set('title')(e.target.value)}
            placeholder="Give your entry a title..."
            id="editor-title"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '1.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              color: 'var(--text-primary)',
              background: 'transparent',
              marginBottom: '1rem',
              lineHeight: 1.3,
              padding: '0.5rem 0',
              borderBottom: '2px solid var(--border-light)',
            }}
          />

          {/* Editor */}
          <div className="editor-container">
            <div className="editor-toolbar">
              {TOOLBAR.map((item, i) =>
                item === null
                  ? <div key={`sep-${i}`} className="editor-tool-separator" />
                  : (
                    <button
                      key={item.label}
                      className="editor-tool-btn"
                      onClick={item.action}
                      title={item.label}
                      type="button"
                    >
                      <item.icon size={14} />
                    </button>
                  )
              )}
            </div>
            <div className="editor-body">
              <textarea
                id="editor-textarea"
                className="editor-textarea"
                value={form.content}
                onChange={e => set('content')(e.target.value)}
                placeholder="What's on your mind today? Write freely — this is your private space..."
              />
            </div>
            <div className="editor-footer">
              <span>{wordCount} words · {form.content.length} characters</span>
              <span>{form.date}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Date */}
          <div className="card">
            <div className="card-header" style={{ padding: '0.875rem 1rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Entry Details</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <div className="input-group">
                  <Calendar size={15} className="input-icon" />
                  <input
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={e => set('date')(e.target.value)}
                    id="editor-date"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Favorite */}
              <div>
                <label className="form-label">Favorite</label>
                <div className="toggle-wrapper" onClick={() => set('isFavorite')(!form.isFavorite)} id="editor-favorite-toggle">
                  <div className={`toggle ${form.isFavorite ? 'on' : ''}`} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Heart size={14} fill={form.isFavorite ? 'var(--amber-500)' : 'none'} color={form.isFavorite ? 'var(--amber-500)' : 'currentColor'} />
                    Mark as favorite
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood */}
          <div className="card">
            <div className="card-header" style={{ padding: '0.875rem 1rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>How are you feeling?</span>
            </div>
            <div className="card-body">
              <MoodSelector value={form.mood} onChange={set('mood')} />
            </div>
          </div>

          {/* Tags */}
          <div className="card">
            <div className="card-header" style={{ padding: '0.875rem 1rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Tags</span>
            </div>
            <div className="card-body">
              <TagSelector value={form.tags} onChange={set('tags')} />
              <p className="form-hint" style={{ marginTop: '0.5rem' }}>Press Enter or pick from suggestions</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete this entry?"
        message="This action cannot be undone. Your diary entry will be permanently deleted."
        confirmLabel="Delete Entry"
      />

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .editor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
