import DiaryEditor from '../../components/diary/DiaryEditor';

export default function CreateEntryPage() {
  return (
    <div>
      <div style={{ marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>New Entry</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Write freely. This is your private space.</p>
      </div>
      <DiaryEditor isEdit={false} />
    </div>
  );
}
