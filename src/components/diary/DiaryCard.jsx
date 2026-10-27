import { Heart, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOODS } from '../../services/mockData';

function MoodBadge({ moodId }) {
  const mood = MOODS.find(m => m.id === moodId);
  if (!mood) return null;
  return (
    <span className="mood-badge" style={{ background: mood.bg, color: mood.color }}>
      {mood.emoji} {mood.label}
    </span>
  );
}

export default function DiaryCard({ entry, onFavorite, onDelete, view = 'card' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const dateObj = new Date(entry.date + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayNum  = dateObj.getDate();
  const monthAb = dateObj.toLocaleDateString('en-US', { month: 'short' });

  if (view === 'list') {
    return (
      <div className="diary-list-item">
        <div className="diary-list-date">
          <span className="diary-list-day">{dayNum}</span>
          <span className="diary-list-month">{monthAb}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }} onClick={() => navigate(`/diary/${entry.id}`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="diary-card-title" style={{ marginBottom: 0 }}>{entry.title}</span>
            {entry.isFavorite && <Heart size={12} fill="var(--amber-500)" color="var(--amber-500)" />}
            {entry.isDraft && <span className="badge badge-warning">Draft</span>}
          </div>
          <p className="diary-card-preview">{entry.content.replace(/\n+/g, ' ')}</p>
          <div className="diary-card-meta">
            {entry.mood && <MoodBadge moodId={entry.mood} />}
            {entry.tags.slice(0, 3).map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
          <button
            className="btn btn-ghost btn-icon btn-icon-sm"
            onClick={() => onFavorite?.(entry.id)}
            id={`fav-${entry.id}`}
          >
            <Heart size={15} fill={entry.isFavorite ? 'var(--amber-500)' : 'none'} color={entry.isFavorite ? 'var(--amber-500)' : 'var(--text-muted)'} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-icon-sm"
            onClick={() => navigate(`/diary/${entry.id}/edit`)}
            id={`edit-${entry.id}`}
          >
            <Edit2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`diary-card card-hover ${entry.isFavorite ? 'favorited' : ''}`}>
      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.25rem' }}>
        <button
          className="btn btn-ghost btn-icon btn-icon-sm"
          onClick={e => { e.stopPropagation(); onFavorite?.(entry.id); }}
          id={`fav-${entry.id}`}
        >
          <Heart
            size={15}
            fill={entry.isFavorite ? 'var(--amber-500)' : 'none'}
            color={entry.isFavorite ? 'var(--amber-500)' : 'var(--text-muted)'}
          />
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-icon btn-icon-sm"
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
            id={`menu-${entry.id}`}
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 30,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                minWidth: 130,
                marginTop: 4,
                overflow: 'hidden',
              }}
              onMouseLeave={() => setMenuOpen(false)}
            >
              {[
                { label: 'View', action: () => navigate(`/diary/${entry.id}`) },
                { label: 'Edit', action: () => navigate(`/diary/${entry.id}/edit`) },
                { label: 'Delete', action: () => { onDelete?.(entry.id); setMenuOpen(false); }, danger: true },
              ].map(item => (
                <div
                  key={item.label}
                  onClick={() => { item.action(); setMenuOpen(false); }}
                  style={{
                    padding: '0.5rem 0.875rem',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    color: item.danger ? 'var(--terra-500)' : 'var(--text-primary)',
                    transition: 'background var(--transition)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {item.danger && <Trash2 size={13} />}
                  {!item.danger && <Edit2 size={13} />}
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div onClick={() => navigate(`/diary/${entry.id}`)}>
        <div className="diary-card-date">{dateStr}</div>
        <h3 className="diary-card-title">{entry.title}</h3>
        <p className="diary-card-preview">{entry.content.replace(/\n+/g, ' ')}</p>
        <div className="diary-card-meta">
          {entry.mood && <MoodBadge moodId={entry.mood} />}
          {entry.tags.slice(0, 2).map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
          {entry.isDraft && <span className="badge badge-warning">Draft</span>}
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {entry.wordCount} words
          </span>
        </div>
      </div>
    </div>
  );
}
