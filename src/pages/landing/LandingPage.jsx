import { useNavigate } from 'react-router-dom';
import { Feather, BookOpen, Calendar, Heart, Search, Shield, Smartphone, ArrowRight, Star } from 'lucide-react';

const FEATURES = [
  {
    num: '01',
    title: 'Start Writing',
    desc: 'Create your account and begin your journaling journey immediately. No setup required.',
  },
  {
    num: '02',
    title: 'Capture Your Day',
    desc: 'Use our beautiful editor to write freely. Add mood, tags, and make entries your own.',
  },
  {
    num: '03',
    title: 'Browse & Reflect',
    desc: 'Navigate through your calendar, search entries, and rediscover your past moments.',
  },
  {
    num: '04',
    title: 'Plan the Future',
    desc: 'Create future notes and reminders to stay intentional about your life ahead.',
  },
  {
    num: '05',
    title: 'Export & Share',
    desc: 'Turn your diary into a beautiful PDF to preserve or share your story.',
  },
  {
    num: '06',
    title: 'Build a Habit',
    desc: 'Track your writing streak and mood patterns to understand yourself better.',
  },
];

const CAPABILITIES = [
  { icon: BookOpen,  label: 'Unlimited Entries',    desc: 'Write as much as you want, every day.' },
  { icon: Calendar,  label: 'Calendar View',         desc: 'Navigate your journal visually by date.' },
  { icon: Heart,     label: 'Favorites & Tags',      desc: 'Organize and rediscover cherished entries.' },
  { icon: Search,    label: 'Powerful Search',       desc: 'Find any entry instantly.' },
  { icon: Shield,    label: 'Private & Secure',      desc: 'Your entries are only yours.' },
  { icon: Smartphone,label: 'Works Everywhere',      desc: 'Desktop, tablet, and mobile.' },
];

const TESTIMONIALS = [
  { text: 'Chronicle helped me build a daily writing habit I\'ve kept for 8 months straight.', author: 'Sarah K.', role: 'Teacher' },
  { text: 'The mood tracking is brilliant. I finally understand my emotional patterns.', author: 'Marcus T.', role: 'Designer' },
  { text: 'Clean, fast, and beautifully designed. Best journal app I\'ve ever used.', author: 'Priya M.', role: 'Software Engineer' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--cream-100)', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, background: 'var(--terra-500)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Feather size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Chronicle</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['Features', 'How it Works', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')} id="nav-login-btn">Sign in</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')} id="nav-signup-btn">Start Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="hero-badge">
            <Star size={11} fill="currentColor" />
            Free Online Diary &amp; Private Journal
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 600, lineHeight: 1.25, color: 'var(--brown-800)', marginBottom: '1.25rem' }}>
            Your thoughts deserve a{' '}
            <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>beautiful home</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Chronicle is a modern personal journal that helps you write, reflect, and grow. Private, elegant, and completely free.
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')} id="hero-start-btn">
              Start Your Journal <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')} id="hero-login-btn">
              Sign In
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>No credit card required · Free forever</p>
        </div>

        {/* App Preview */}
        <div style={{ maxWidth: 900, margin: '3rem auto 0', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--brown-800)', height: 40, display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem' }}>
            {['#FF5F57','#FFBD2E','#28CA41'].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
            <span style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: 'var(--cream-400)' }}>chronicle.app/dashboard</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: 340 }}>
            {/* Mock Sidebar */}
            <div style={{ background: 'var(--brown-800)', padding: '1rem 0.75rem', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              {['Dashboard','My Diary','Calendar','Future Notes','Favorites','Search'].map((item, i) => (
                <div key={item} style={{
                  padding: '0.45rem 0.625rem',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  color: i === 1 ? 'var(--terra-300)' : 'var(--cream-400)',
                  background: i === 1 ? 'rgba(168,65,46,0.18)' : 'transparent',
                  marginBottom: 2,
                  fontWeight: i === 1 ? 600 : 400,
                }}>
                  {item}
                </div>
              ))}
            </div>
            {/* Mock Content */}
            <div style={{ padding: '1.25rem', background: 'var(--cream-100)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.875rem' }}>Recent Entries</div>
              {['A Day of Unexpected Beauty', 'Morning Light Ritual', 'On Starting Over'].map((title, i) => (
                <div key={title} style={{
                  padding: '0.625rem 0.875rem',
                  background: 'white',
                  borderRadius: 8,
                  marginBottom: 6,
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 1px 3px rgba(44,24,16,0.06)',
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brown-800)', marginBottom: '0.2rem' }}>{title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {['Oct 2, 2026','Oct 1, 2026','Sep 30, 2026'][i]} · {['😊 Happy','😌 Calm','🤔 Thoughtful'][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div id="how-it-works" style={{ background: 'var(--bg-surface)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '0.5rem' }}>How it works</p>
            <h2 style={{ fontFamily: 'var(--font-serif)' }}>How to Use the <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Online Diary</span></h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 500, margin: '0.75rem auto 0' }}>Everything you need to build a meaningful journaling habit, step by step.</p>
          </div>
          <div className="landing-feature-grid">
            {FEATURES.map(f => (
              <div key={f.num} className="landing-feature-card">
                <div className="feature-num">{f.num}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ padding: '5rem 2rem', background: 'var(--cream-100)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '0.5rem' }}>Everything you need</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
                Everything Your <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Diary</span> Can Do
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
                Chronicle is more than just a place to write. It's a thoughtful system for capturing and understanding your life.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {CAPABILITIES.map(cap => (
                  <div key={cap.label} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, background: 'var(--accent-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <cap.icon size={16} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{cap.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cap.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {[
                  { emoji: '📔', label: '147 Entries',   sub: 'Total written' },
                  { emoji: '🔥', label: '12 Day Streak', sub: 'Keep it up!' },
                  { emoji: '❤️', label: '23 Favorites',  sub: 'Cherished entries' },
                  { emoji: '📊', label: '48,320 Words',  sub: 'Total written' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{s.emoji}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--brown-800)', borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--cream-400)', marginBottom: '0.5rem', fontWeight: 500 }}>Today's Entry</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--cream-200)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                  "Today was one of those rare days where everything seemed to fall into place..."
                </div>
                <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.375rem' }}>
                  {['Family','Gratitude','Nature'].map(t => (
                    <span key={t} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: 100, color: 'var(--cream-300)' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ background: 'var(--cream-200)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '2.5rem' }}>
            What <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Writers</span> Say
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.author} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', textAlign: 'left' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '1rem' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 36, height: 36, background: 'var(--terra-200)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--terra-600)' }}>
                    {t.author[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{t.author}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={{ background: 'var(--bg-surface)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', textAlign: 'center', marginBottom: '2.5rem' }}>
            Frequently Asked <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Questions</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { q: 'Is Chronicle really free?', a: 'Yes, Chronicle is completely free. You can write unlimited entries with no hidden fees.' },
              { q: 'Are my diary entries private?', a: 'Absolutely. Your entries are private by default and only accessible to you.' },
              { q: 'Can I export my diary?', a: 'Yes, you can export your entries as a PDF or download your data at any time.' },
              { q: 'Does it work on mobile?', a: 'Chronicle is fully responsive and works beautifully on desktop, tablet, and mobile devices.' },
              { q: 'Can I search through all my entries?', a: 'Yes! Use the Search page to find any entry by title, content, tags, or mood — instantly.' },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border-light)', padding: '1.25rem 0' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{item.q}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'var(--brown-800)', padding: '5rem 2rem', textAlign: 'center', backgroundImage: 'radial-gradient(ellipse at 30% 60%, rgba(168,65,46,0.3) 0%, transparent 60%)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream-100)', marginBottom: '1rem', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
          Your <span style={{ color: 'var(--terra-300)', fontStyle: 'italic' }}>Free Private</span> Online Diary
        </h2>
        <p style={{ color: 'var(--cream-400)', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
          Start your journaling journey today. No credit card, no limits, just you and your words.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')} id="cta-start-btn">
          Create My Free Journal <ArrowRight size={16} />
        </button>
      </div>

      {/* Footer */}
      <footer style={{ background: '#120A05', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                <div style={{ width: 28, height: 28, background: 'var(--terra-500)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather size={14} color="white" />
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--cream-200)', fontWeight: 600 }}>Chronicle</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--brown-400)', lineHeight: 1.65 }}>Your personal diary for the modern age.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'How it Works', 'Pricing', 'Changelog'] },
              { title: 'Support', links: ['Help Center', 'Contact Us', 'Status', 'Community'] },
              { title: 'Legal',   links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brown-300)', marginBottom: '0.875rem' }}>{col.title}</div>
                {col.links.map(link => (
                  <div key={link} style={{ fontSize: '0.82rem', color: 'var(--brown-400)', marginBottom: '0.4rem', cursor: 'pointer' }}>{link}</div>
                ))}
              </div>
            ))}
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--brown-500)' }}>© {new Date().getFullYear()} Chronicle. All rights reserved.</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--brown-500)' }}>Made with ❤️ for writers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
