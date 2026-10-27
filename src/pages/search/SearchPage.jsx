import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen, X, Tag, Smile } from 'lucide-react';
import { entriesApi } from '../../services/api';
import { MOODS, ALL_TAGS } from '../../services/mockData';

const RECENT_KEY = 'chronicle_recent_searches';

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 120);
  const start = Math.max(0, idx - 30);
  const end   = Math.min(text.length, idx + query.length + 90);
  const snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
  const parts = snippet.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="search-highlight">{part}</mark>
      : part
  );
}

export default function SearchPage() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });
  const [moodFilter, setMoodFilter] = useState('');
  const [tagFilter,  setTagFilter]  = useState('');

  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const performSearch = useCallback(async (q, mood = moodFilter, tag = tagFilter) => {
    if (!q.trim() && !mood && !tag) { setResults([]); setHasSearched(false); return; }
    setLoading(true);
    setHasSearched(true);
    try {
      const { entries } = await entriesApi.getAll({
        search: q,
        mood,
        tags: tag ? [tag] : [],
        limit: 50,
      });
      setResults(entries);
    } finally {
      setLoading(false);
    }
  }, [moodFilter, tagFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1 || moodFilter || tagFilter) {
        performSearch(query, moodFilter, tagFilter);
      } else if (!query && !moodFilter && !tagFilter) {
        setResults([]);
        setHasSearched(false);
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [query, moodFilter, tagFilter, performSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(r => r !== query)].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      performSearch(query);
    }
  };

  const clearRecent = () => { setRecentSearches([]); localStorage.removeItem(RECENT_KEY); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 780, margin: '0 auto' }}>

      {/* Search Header */}
      <div>
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Find any entry in your journal</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <Search size={18} className="input-icon" style={{ left: '1rem' }} />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            className="form-input"
            placeholder="Search by title, content, or tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '3rem', paddingRight: '3rem', height: 52, fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          />
          {query && (
            <button
              type="button"
              className="input-icon input-icon-right"
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
              style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, right: '1rem' }}
              id="clear-search-btn"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>

        <select className="form-select" value={moodFilter} onChange={e => setMoodFilter(e.target.value)}
          id="search-mood-filter" style={{ width: 'auto', fontSize: '0.82rem', height: 34, padding: '0.25rem 2rem 0.25rem 0.625rem' }}>
          <option value="">All moods</option>
          {MOODS.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>)}
        </select>

        <select className="form-select" value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          id="search-tag-filter" style={{ width: 'auto', fontSize: '0.82rem', height: 34, padding: '0.25rem 2rem 0.25rem 0.625rem' }}>
          <option value="">All tags</option>
          {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {(moodFilter || tagFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setMoodFilter(''); setTagFilter(''); }} id="clear-filters-search-btn">
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* Recent Searches */}
      {!hasSearched && recentSearches.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Clock size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Recent searches
            </span>
            <button className="btn btn-ghost btn-sm" onClick={clearRecent} id="clear-recent-btn" style={{ fontSize: '0.72rem' }}>
              Clear all
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {recentSearches.map(r => (
              <button
                key={r}
                className="tag"
                onClick={() => { setQuery(r); performSearch(r); }}
                id={`recent-${r}`}
              >
                <Clock size={11} /> {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips (empty state) */}
      {!hasSearched && recentSearches.length === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { icon: BookOpen, label: 'Search by title',   hint: 'e.g. "morning reflections"' },
            { icon: Search,   label: 'Search by content', hint: 'Any words from your entry' },
            { icon: Tag,      label: 'Filter by tag',     hint: 'Use the tag dropdown above' },
            { icon: Smile,    label: 'Filter by mood',    hint: 'Use the mood dropdown above' },
          ].map(tip => (
            <div key={tip.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.1rem', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: 36, height: 36, background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.625rem' }}>
                <tip.icon size={16} color="var(--accent)" />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>{tip.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tip.hint}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 10 }} />)}
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.875rem', fontWeight: 500 }}>
            {results.length > 0 ? `Found ${results.length} result${results.length === 1 ? '' : 's'}` : 'No results found'}
          </div>

          {results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={28} /></div>
              <h3>No entries found</h3>
              <p>Try different keywords or adjust your filters.</p>
            </div>
          ) : (
            <div className="search-results">
              {results.map(entry => {
                const mood = MOODS.find(m => m.id === entry.mood);
                const dateStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <div
                    key={entry.id}
                    className="search-result-item"
                    onClick={() => navigate(`/diary/${entry.id}`)}
                    id={`result-${entry.id}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, flex: 1 }}>
                        {highlight(entry.title, query)}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {mood && <span className="mood-badge" style={{ background: mood.bg, color: mood.color }}>{mood.emoji}</span>}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{dateStr}</span>
                        <ArrowRight size={13} color="var(--text-muted)" />
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {highlight(entry.content.replace(/\n+/g, ' '), query)}
                    </p>
                    {entry.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {entry.tags.map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
