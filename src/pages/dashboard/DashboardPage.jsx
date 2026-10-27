import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Feather, TrendingUp, BookOpen, Heart, StickyNote,
  Flame, Plus, ArrowRight, BarChart2, Calendar,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { entriesApi, userApi, notesApi } from '../../services/api';
import { MOODS } from '../../services/mockData';
import DiaryCard from '../../components/diary/DiaryCard';

function StatCard({ icon: Icon, iconBg, iconColor, label, value, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: iconBg }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {trend && <div className="stat-card-trend trend-up">{trend}</div>}
    </div>
  );
}

function ActivityGrid({ data }) {
  return (
    <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(26, 1fr)', gap: 4, minWidth: 400 }}>
        {data.map((d, i) => (
          <div
            key={i}
            title={`${d.date}: ${d.count} entr${d.count === 1 ? 'y' : 'ies'}`}
            className={`activity-cell level-${Math.min(d.count, 4)}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        <span>2 weeks ago</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Less
          {[0,1,2,3,4].map(l => (
            <span key={l} className={`activity-cell level-${l}`} style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2 }} />
          ))}
          More
        </span>
        <span>Today</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [entries, setEntries] = useState([]);
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.getStats(),
      entriesApi.getAll({ limit: 6 }),
      notesApi.getAll(),
    ]).then(([s, e, n]) => {
      setStats(s);
      setEntries(e.entries);
      setNotes(n.filter(n => !n.completed).slice(0, 4));
      setLoading(false);
    });
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
      ))}
    </div>
  );

  const activityData = Array.from({ length: 26 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (25 - i));
    return {
      date: d.toISOString().split('T')[0],
      count: Math.random() > 0.35 ? Math.floor(Math.random() * 3) + 1 : 0,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brown-800) 0%, var(--brown-700) 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(168,65,46,0.15)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(74,158,142,0.08)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--cream-400)', marginBottom: '0.4rem', fontWeight: 500 }}>{today}</div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--cream-100)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
            {greeting}, {user?.name?.split(' ')[0]} ✨
          </h1>
          <p style={{ color: 'var(--cream-400)', fontSize: '0.9rem', maxWidth: 420 }}>
            Ready to capture today&apos;s moments? Your journal awaits.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, position: 'relative' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/diary')} id="dash-view-diary-btn">
            <BookOpen size={15} /> My Diary
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/diary/new')} id="dash-write-btn">
            <Feather size={15} /> Write Today
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4">
        <StatCard icon={BookOpen}    iconBg="var(--cream-200)"   iconColor="var(--accent)"    label="Total Entries"    value={stats?.totalEntries || 0} />
        <StatCard icon={Calendar}    iconBg="var(--teal-100)"    iconColor="var(--teal-500)"  label="This Month"       value={stats?.thisMonth || 0}   trend="↑ 3 from last month" />
        <StatCard icon={Heart}       iconBg="var(--amber-100)"   iconColor="var(--amber-500)" label="Favorites"        value={stats?.favorites || 0} />
        <StatCard icon={Flame}       iconBg="var(--terra-100)"   iconColor="var(--terra-500)" label="Day Streak"       value={`${stats?.currentStreak || 0}🔥`} trend={`Best: ${stats?.longestStreak || 0} days`} />
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left: Recent Entries + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Recent Entries */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="section-title">Recent Entries</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Your latest journal entries</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/diary')} id="dash-view-all-btn">
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {entries.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state-icon"><BookOpen size={28} /></div>
                  <h3>No entries yet</h3>
                  <p>Start writing your first diary entry today.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/diary/new')} id="dash-first-entry-btn">
                    <Plus size={14} /> Write First Entry
                  </button>
                </div>
              ) : (
                entries.map(entry => (
                  <DiaryCard key={entry.id} entry={entry} view="list" />
                ))
              )}
            </div>
          </div>

          {/* Writing Activity */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="section-title">Writing Activity</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Past 26 days</div>
              </div>
              <BarChart2 size={16} color="var(--text-muted)" />
            </div>
            <div className="card-body">
              <ActivityGrid data={activityData} />
            </div>
          </div>
        </div>

        {/* Right: Quick Actions + Notes + Mood */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><div className="section-title">Quick Actions</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Write Today\'s Entry', icon: Feather, action: () => navigate('/diary/new'), accent: true },
                { label: 'Browse Calendar',      icon: Calendar, action: () => navigate('/calendar') },
                { label: 'Add a Future Note',    icon: StickyNote, action: () => navigate('/notes') },
                { label: 'View Favorites',       icon: Heart, action: () => navigate('/favorites') },
              ].map(item => (
                <button
                  key={item.label}
                  className={`btn ${item.accent ? 'btn-primary' : 'btn-secondary'} w-full`}
                  onClick={item.action}
                  id={`quick-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                  style={{ justifyContent: 'flex-start', gap: '0.625rem' }}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Notes */}
          <div className="card">
            <div className="card-header">
              <div className="section-title">Upcoming Notes</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notes')} id="dash-notes-btn">
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {notes.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No upcoming notes.
                </p>
              ) : notes.map(note => (
                <div key={note.id} className="note-card">
                  <div className="note-title">{note.title}</div>
                  <div className="note-time">
                    <Calendar size={11} />
                    {new Date(note.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {note.reminderTime && ` · ${note.reminderTime}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Writing Stats */}
          <div className="card">
            <div className="card-header"><div className="section-title">Writing Stats</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Total Words Written', value: stats?.totalWords?.toLocaleString() || '0' },
                { label: 'Avg. Words / Entry',  value: stats?.avgWordsPerEntry || 0 },
                { label: 'Longest Streak',      value: `${stats?.longestStreak || 0} days` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
              <hr className="divider" style={{ margin: '0.25rem 0' }} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Top Mood</div>
                {(() => {
                  const m = MOODS.find(m => m.id === stats?.mostUsedMood);
                  return m ? (
                    <span className="mood-badge" style={{ background: m.bg, color: m.color }}>
                      {m.emoji} {m.label}
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive grid tweak */}
      <style>{`
        @media (max-width: 900px) {
          .dash-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
