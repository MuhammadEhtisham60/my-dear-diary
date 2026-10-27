import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Grid, List, Search, Filter, ChevronDown, ChevronUp,
  X, Plus, SortAsc, Heart,
} from 'lucide-react';
import DiaryCard from '../../components/diary/DiaryCard';
import { entriesApi } from '../../services/api';
import { MOODS, ALL_TAGS } from '../../services/mockData';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'alpha',  label: 'Alphabetical' },
];

export default function MyDiaryPage() {
  const [entries, setEntries]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('card'); // 'card' | 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);

  const [filters, setFilters] = useState({
    search: '', mood: '', tags: [], favorites: false, sort: 'newest', page: 1,
  });

  const navigate = useNavigate();
  const toast    = useToast();

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await entriesApi.getAll({ ...filters, limit: 12 });
      setEntries(res.entries);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error('Failed to load entries.');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const setFilter = (key) => (val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ search: '', mood: '', tags: [], favorites: false, sort: 'newest', page: 1 });

  const handleFavorite = async (id) => {
    try {
      await entriesApi.toggleFavorite(id);
      setEntries(prev => prev.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));
    } catch (err) {
      toast.error('Failed to update favorite.');
    }
  };

  const handleDelete = async () => {
    try {
      await entriesApi.delete(deleteId);
      toast.success('Entry deleted.');
      setDeleteId(null);
      loadEntries();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const hasActiveFilters = filters.search || filters.mood || filters.tags.length || filters.favorites;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Diary</h1>
          <p className="page-subtitle">{total} entr{total === 1 ? 'y' : 'ies'} in your journal</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/diary/new')} id="new-entry-btn">
          <Plus size={15} /> New Entry
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="input-icon" />
          <input
            id="diary-search"
            type="text"
            className="form-input"
            placeholder="Search entries..."
            value={filters.search}
            onChange={e => setFilter('search')(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          {filters.search && (
            <button className="input-icon input-icon-right" onClick={() => setFilter('search')('')}
              style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select className="form-select" value={filters.sort} onChange={e => setFilter('sort')(e.target.value)}
          id="diary-sort" style={{ width: 'auto' }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Filters toggle */}
        <button
          className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setShowFilters(s => !s)}
          id="diary-filter-btn"
        >
          <Filter size={14} />
          Filters
          {hasActiveFilters && <span className="nav-badge" style={{ marginLeft: 0 }}>{[!!filters.mood, !!filters.tags.length, filters.favorites].filter(Boolean).length}</span>}
          {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Favorites */}
        <button
          className={`btn btn-sm ${filters.favorites ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('favorites')(!filters.favorites)}
          id="diary-favorites-btn"
        >
          <Heart size={14} fill={filters.favorites ? 'currentColor' : 'none'} />
          Favorites
        </button>

        {/* View toggle */}
        <div style={{ display: 'flex', border: '1.5px solid var(--border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <button
            className={`btn btn-icon btn-sm ${view === 'card' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('card')} id="view-card-btn"
            style={{ borderRadius: 0 }}
          >
            <Grid size={15} />
          </button>
          <button
            className={`btn btn-icon btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('list')} id="view-list-btn"
            style={{ borderRadius: 0 }}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Mood */}
            <div className="form-group">
              <label className="form-label">Mood</label>
              <select className="form-select" value={filters.mood} onChange={e => setFilter('mood')(e.target.value)} id="filter-mood">
                <option value="">All moods</option>
                {MOODS.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {ALL_TAGS.slice(0, 10).map(tag => (
                  <span
                    key={tag}
                    className={`tag ${filters.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => {
                      const next = filters.tags.includes(tag)
                        ? filters.tags.filter(t => t !== tag)
                        : [...filters.tags, tag];
                      setFilter('tags')(next);
                    }}
                    id={`filter-tag-${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn">
                <X size={13} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className={view === 'card' ? 'grid-auto' : 'flex flex-col gap-3'}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: view === 'card' ? 200 : 80, borderRadius: 12 }} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="empty-state" style={{ padding: '4rem 1.5rem' }}>
          <div className="empty-state-icon"><BookOpen size={32} /></div>
          <h3>{hasActiveFilters ? 'No entries match your filters' : 'Your diary is empty'}</h3>
          <p>{hasActiveFilters ? 'Try adjusting your search or filters.' : 'Start writing to build your personal journal.'}</p>
          {!hasActiveFilters && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/diary/new')} id="empty-new-entry-btn">
              <Plus size={14} /> Write First Entry
            </button>
          )}
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={clearFilters} id="empty-clear-btn">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={view === 'card' ? 'grid-auto' : 'flex flex-col gap-3'}>
            {entries.map(entry => (
              <DiaryCard
                key={entry.id}
                entry={entry}
                view={view}
                onFavorite={handleFavorite}
                onDelete={id => setDeleteId(id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={filters.page === 1}
                onClick={() => setFilter('page')(filters.page - 1)} id="prev-page-btn">‹</button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${filters.page === i + 1 ? 'active' : ''}`}
                  onClick={() => setFilter('page')(i + 1)}
                  id={`page-${i + 1}-btn`}
                >{i + 1}</button>
              ))}
              <button className="page-btn" disabled={filters.page === totalPages}
                onClick={() => setFilter('page')(filters.page + 1)} id="next-page-btn">›</button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete this entry?"
        message="This action cannot be undone. Your diary entry will be permanently deleted."
        confirmLabel="Delete Entry"
      />
    </div>
  );
}
