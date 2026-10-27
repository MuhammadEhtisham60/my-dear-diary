import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ALL_TAGS } from '../../services/mockData';

export default function TagSelector({ value = [], onChange }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = ALL_TAGS.filter(t =>
    !value.includes(t) &&
    t.toLowerCase().includes(input.toLowerCase())
  );

  const add = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const remove = (tag) => onChange(value.filter(t => t !== tag));

  const handleKey = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      add(input);
    }
    if (e.key === 'Backspace' && !input && value.length) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.375rem',
          padding: '0.5rem 0.75rem',
          border: '1.5px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface)',
          cursor: 'text',
          minHeight: 42,
          alignItems: 'center',
        }}
        onClick={() => document.getElementById('tag-input')?.focus()}
      >
        {value.map(tag => (
          <span key={tag} className="tag">
            {tag}
            <span className="tag-remove" onClick={e => { e.stopPropagation(); remove(tag); }}>
              <X size={10} />
            </span>
          </span>
        ))}
        <input
          id="tag-input"
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKey}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
          placeholder={value.length === 0 ? 'Add tags...' : ''}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            minWidth: 80,
            flex: 1,
          }}
        />
      </div>

      {showSuggestions && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          marginTop: 4,
          maxHeight: 200,
          overflowY: 'auto',
        }}>
          {filtered.slice(0, 8).map(tag => (
            <div
              key={tag}
              onMouseDown={() => add(tag)}
              style={{
                padding: '0.5rem 0.875rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Plus size={13} color="var(--text-muted)" />
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
