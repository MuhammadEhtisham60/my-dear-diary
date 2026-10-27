import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Heart, Calendar, Tag, Smile } from 'lucide-react';
import { entriesApi } from '../../services/api';
import { MOODS } from '../../services/mockData';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function DiaryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    entriesApi.getById(id).then(e => { setEntry(e); setLoading(false); }).catch(() => {
      toast.error('Entry not found.'); navigate('/diary');
    });
  }, [id, navigate, toast]);

  const handleFavorite = async () => {
    const updated = await entriesApi.toggleFavorite(id);
    setEntry(updated);
    toast.success(updated.isFavorite ? 'Added to favorites!' : 'Removed from favorites.');
  };

  const handleDelete = async () => {
    await entriesApi.delete(id);
    toast.success('Entry deleted.');
    navigate('/diary');
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="skeleton" style={{ height: 40, width: 200, borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
    </div>
  );

  if (!entry) return null;

  const mood = MOODS.find(m => m.id === entry.mood);
  const dateStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      {/* Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/diary')} id="detail-back-btn">
          <ArrowLeft size={16} /> Back to Diary
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn btn-sm ${entry.isFavorite ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleFavorite} id="detail-fav-btn">
            <Heart size={14} fill={entry.isFavorite ? 'currentColor' : 'none'} />
            {entry.isFavorite ? 'Favorited' : 'Favorite'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/diary/${id}/edit`)} id="detail-edit-btn">
            <Edit2 size={14} /> Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)} id="detail-delete-btn">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Entry Card */}
      <div className="card" style={{ overflow: 'visible' }}>
        {/* Header */}
        <div style={{ padding: '2rem 2rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              <Calendar size={13} /> {dateStr}
            </span>
            {mood && (
              <span className="mood-badge" style={{ background: mood.bg, color: mood.color }}>
                {mood.emoji} {mood.label}
              </span>
            )}
            {entry.isDraft && <span className="badge badge-warning">Draft</span>}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
          }}>
            {entry.title}
          </h1>
        </div>

        <hr className="divider" style={{ margin: '0 2rem' }} />

        {/* Content */}
        <div style={{ padding: '1.75rem 2rem', lineHeight: 1.85, fontSize: '1rem', color: 'var(--text-secondary)' }}>
          {entry.content.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p>
          ))}
        </div>

        {/* Footer Meta */}
        {(entry.tags.length > 0) && (
          <div style={{ padding: '0 2rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
            <Tag size={13} color="var(--text-muted)" style={{ marginRight: '0.25rem' }} />
            {entry.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {entry.wordCount} words
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Last updated {new Date(entry.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
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
    </div>
  );
}
