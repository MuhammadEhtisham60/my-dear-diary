import { MOODS } from '../../services/mockData';

export default function MoodSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {MOODS.map(mood => {
        const active = value === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            id={`mood-${mood.id}`}
            onClick={() => onChange(active ? '' : mood.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${active ? mood.color : 'var(--border-default)'}`,
              background: active ? mood.bg : 'var(--bg-surface)',
              color: active ? mood.color : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              transition: 'all var(--transition)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span>{mood.emoji}</span>
            <span>{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
