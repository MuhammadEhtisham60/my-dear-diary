import { useState, useEffect } from 'react';
import { Heart, Search, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { entriesApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import DiaryCard from '../../components/diary/DiaryCard';

export default function FavoritesPage() {
  const [entries, setEntries] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast    = useToast();

  useEffect(() => {
    entriesApi.getAll({ favorites: true, limit: 100 }).then(res => {
      setEntries(res.entries);
      setLoading(false);
    });
  }, []);

  const filtered = entries.filter(e =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleFavorite = async (id) => {
    await entriesApi.toggleFavorite(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success('Removed from favorites.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">Favorites</h1>
          <p className="page-subtitle">{entries.length} cherished entr{entries.length === 1 ? 'y' : 'ies'}</p>
        </div>
        <Heart size={24} fill="var(--amber-500)" color="var(--amber-500)" />
      </div>

      {/* Search */}
      <div className="input-group" style={{ maxWidth: 440 }}>
        <Search size={15} className="input-icon" />
        <input
          id="favorites-search"
          type="text"
          className="form-input"
          placeholder="Search favorites..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {loading ? (
        <div className="grid-auto">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '4rem 1.5rem' }}>
          <div className="empty-state-icon">
            <Heart size={32} />
          </div>
          <h3>{search ? 'No favorites match your search' : 'No favorites yet'}</h3>
          <p>{search ? 'Try a different search term.' : 'Mark diary entries as favorites to find them here quickly.'}</p>
          {!search && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/diary')} id="favorites-go-diary-btn">
              <BookOpen size={14} /> Browse My Diary
            </button>
          )}
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map(entry => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              view="card"
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
