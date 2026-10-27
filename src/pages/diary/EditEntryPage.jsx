import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DiaryEditor from '../../components/diary/DiaryEditor';
import { entriesApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export default function EditEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    entriesApi.getById(id).then(e => { setEntry(e); setLoading(false); })
      .catch(() => { toast.error('Entry not found.'); navigate('/diary'); });
  }, [id, navigate, toast]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="skeleton" style={{ height: 40, width: 200, borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Edit Entry</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Update your diary entry.</p>
      </div>
      <DiaryEditor initialData={entry} isEdit={true} />
    </div>
  );
}
