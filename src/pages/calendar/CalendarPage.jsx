import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, BookOpen, StickyNote } from 'lucide-react';
import { entriesApi } from '../../services/api';
import { MOCK_NOTES } from '../../services/mockData';
import DiaryCard from '../../components/diary/DiaryCard';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();

  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate]   = useState(today.toISOString().split('T')[0]);
  const [entryDates, setEntryDates]       = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [selectedNotes, setSelectedNotes]     = useState([]);
  const [loadingEntries, setLoadingEntries]   = useState(false);

  // Load entry dates for current month
  useEffect(() => {
    entriesApi.getCalendarData(current.year, current.month + 1).then(dates => {
      setEntryDates(dates);
    });
  }, [current]);

  // Load entries for selected date
  useEffect(() => {
    setLoadingEntries(true);
    Promise.all([
      entriesApi.getByDate(selectedDate),
    ]).then(([entries]) => {
      setSelectedEntries(entries);
      setSelectedNotes(MOCK_NOTES.filter(n => n.date === selectedDate));
      setLoadingEntries(false);
    });
  }, [selectedDate]);

  // Calendar helpers
  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const daysInPrev  = new Date(current.year, current.month, 0).getDate();

  const prevMonth = () => setCurrent(c => {
    if (c.month === 0) return { year: c.year - 1, month: 11 };
    return { year: c.year, month: c.month - 1 };
  });
  const nextMonth = () => setCurrent(c => {
    if (c.month === 11) return { year: c.year + 1, month: 0 };
    return { year: c.year, month: c.month + 1 };
  });
  const goToday = () => { setCurrent({ year: today.getFullYear(), month: today.getMonth() }); setSelectedDate(today.toISOString().split('T')[0]); };

  const cells = [];
  // Prev month overflow
  for (let d = firstDay - 1; d >= 0; d--) {
    cells.push({ day: daysInPrev - d, current: false, month: current.month - 1 });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, month: current.month });
  }
  // Next month overflow
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, month: current.month + 1 });
  }

  const getDateStr = (day, m) => {
    const yr = m < 0 ? current.year - 1 : m > 11 ? current.year + 1 : current.year;
    const mo = ((m % 12) + 12) % 12;
    return `${yr}-${String(mo + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  };

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedDateLabel = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const isToday = selectedDate === today.toISOString().split('T')[0];
  const isFuture = selectedDate > today.toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Browse and navigate your journal by date</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={goToday} id="go-today-btn">Today</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>

        {/* Calendar */}
        <div className="card">
          <div className="card-header">
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={prevMonth} id="prev-month-btn">
              <ChevronLeft size={18} />
            </button>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, textAlign: 'center', flex: 1 }}>
              {MONTHS[current.month]} {current.year}
            </h2>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={nextMonth} id="next-month-btn">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="card-body">
            {/* Day headers */}
            <div className="calendar-grid" style={{ marginBottom: 4 }}>
              {DAYS.map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="calendar-grid">
              {cells.map((cell, i) => {
                const dateStr = getDateStr(cell.day, cell.month);
                const hasEntry = entryDates.includes(dateStr);
                const hasNote  = MOCK_NOTES.some(n => n.date === dateStr);
                const todayStr = today.toISOString().split('T')[0];

                return (
                  <button
                    key={i}
                    className={[
                      'calendar-day',
                      !cell.current ? 'other-month' : '',
                      dateStr === todayStr ? 'today' : '',
                      dateStr === selectedDate ? 'selected' : '',
                      hasEntry && hasNote ? 'has-both' : hasEntry ? 'has-entry' : hasNote ? 'has-note' : '',
                    ].join(' ')}
                    onClick={() => setSelectedDate(dateStr)}
                    id={`cal-day-${dateStr}`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { color: 'var(--accent)',    label: 'Diary entry' },
                { color: 'var(--teal-500)', label: 'Future note' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Date Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div className="card">
            <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {isToday ? '📅 Today' : isFuture ? '🔮 Future' : '📖 Past'}
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem' }}>{selectedDateLabel}</h3>
              </div>
              <button
                className="btn btn-primary btn-sm w-full"
                onClick={() => navigate(`/diary/new?date=${selectedDate}`)}
                id="cal-new-entry-btn"
              >
                <Plus size={14} /> {isFuture ? 'Add Future Note' : 'Write Entry'}
              </button>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loadingEntries ? (
                <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
              ) : selectedEntries.length === 0 && selectedNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📭</div>
                  No entries for this date.
                </div>
              ) : (
                <>
                  {selectedEntries.map(entry => (
                    <div
                      key={entry.id}
                      style={{
                        padding: '0.75rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        border: '1px solid var(--border-light)',
                        transition: 'all var(--transition)',
                      }}
                      onClick={() => navigate(`/diary/${entry.id}`)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <BookOpen size={12} color="var(--accent)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{entry.title}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {entry.content.replace(/\n+/g, ' ')}
                      </p>
                    </div>
                  ))}

                  {selectedNotes.map(note => (
                    <div
                      key={note.id}
                      style={{
                        padding: '0.75rem',
                        background: 'var(--teal-100)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--teal-300)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <StickyNote size={12} color="var(--teal-500)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brown-700)' }}>{note.title}</span>
                      </div>
                      {note.reminderTime && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--teal-500)' }}>⏰ {note.reminderTime}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsiveness */}
      <style>{`
        @media (max-width: 900px) {
          .cal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
