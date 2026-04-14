import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../library/api.js';
import taskApi from '../library/taskApi.js';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Bell, Camera, CheckCircle2, Clock3, KeyRound,
  LayoutGrid, LoaderCircle, Mail, Moon, Save, Shield,
  Sparkles, SunMedium, Trash2, User,
} from 'lucide-react';

const TABS = ['Profile', 'Activity', 'Settings'];

const emptyPreferences = {
  darkMode: false,
  emailNotifications: true,
  deadlineReminders: true,
  assignmentNotifications: true,
  productUpdates: false,
};

/* ─── Style helpers ─── */
const card  = (dm) => ({
  background: dm ? 'var(--tf-surface-mid)' : '#fff',
  border: `1px solid ${dm ? 'var(--tf-border)' : 'rgba(99,102,241,0.1)'}`,
  borderRadius: 20, padding: 20,
  boxShadow: dm ? 'var(--tf-shadow-card)' : '0 4px 20px rgba(99,102,241,0.06)',
});
const input = (dm) => ({
  width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14,
  background: dm ? 'var(--tf-bg)' : '#f5f5ff',
  border: `1px solid ${dm ? 'var(--tf-border)' : 'rgba(99,102,241,0.15)'}`,
  color: dm ? 'var(--tf-text)' : '#1a1a2e', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
});
const label = (dm) => ({
  fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block',
  color: dm ? 'var(--tf-text-muted)' : '#6060a0',
});
const softCard = (dm) => ({
  background: dm ? 'rgba(99,102,241,0.06)' : '#f5f5ff',
  border: `1px solid ${dm ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)'}`,
  borderRadius: 14, padding: 14,
});

const Profile = () => {
  const { user, logout, refreshUser, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading,       setLoading]        = useState(true);
  const [tasksLoading,  setTasksLoading]   = useState(true);
  const [submitting,    setSubmitting]      = useState(false);
  const [activeTab,     setActiveTab]       = useState('Profile');
  const [tasks,         setTasks]           = useState([]);
  const [profileForm,   setProfileForm]     = useState({ name: '', email: '', username: '' });
  const [passwordForm,  setPasswordForm]    = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [preferences,   setPreferences]     = useState(emptyPreferences);
  const [imageUrl,      setImageUrl]        = useState(null);
  const [publicId,      setPublicId]        = useState(null);
  const [avatar,        setAvatar]          = useState(null);
  const [isCompact,     setIsCompact]       = useState(() => window.innerWidth < 640);

  const darkMode     = preferences.darkMode;
  const displayImage = imageUrl || avatar || '/image/user.png';

  /* ─── Dark/light theme vars ─── */
  const wrapStyle = darkMode
    ? { minHeight: '100vh', background: 'var(--tf-surface)', color: 'var(--tf-text)', paddingBottom: 48 }
    : { minHeight: '100vh', background: '#f0f0ff', color: '#1a1a2e', paddingBottom: 48 };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const cu = await refreshUser();
        setProfileForm({ name: cu.name || '', email: cu.email || '', username: cu.username || '' });
        setPreferences({ ...emptyPreferences, ...cu.preferences });
        setImageUrl(cu.profilePic || null);
        setAvatar(cu.avatar || null);
        setPublicId(cu.profilePicPublicId || null);
      } catch { navigate('/login'); }
      finally { setLoading(false); }
    };
    bootstrap();
  }, [navigate, refreshUser]);

  useEffect(() => {
    (async () => {
      try {
        setTasksLoading(true);
        const r = await taskApi.get('/', { params: { limit: 100, sortBy: 'newest' } });
        setTasks(Array.isArray(r.data) ? r.data : r.data.tasks || []);
      } catch { toast.error('Unable to load profile activity.'); }
      finally { setTasksLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const normalizeDate = (v) => { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; };

  const stats = useMemo(() => {
    const total       = tasks.length;
    const completed   = tasks.filter((t) => t.taskStatus === 'Completed').length;
    const pending     = tasks.filter((t) => t.taskStatus === 'Pending').length;
    const inProgress  = tasks.filter((t) => t.taskStatus === 'In Progress').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const overdue = tasks.filter((t) => { const d = normalizeDate(t.dueDate); return d && d < new Date() && t.taskStatus !== 'Completed'; }).length;
    return { total, completed, pending, inProgress, completionRate, overdue };
  }, [tasks]);

  const recentTasks          = useMemo(() => [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5), [tasks]);
  const recentCompletedTasks = useMemo(() => tasks.filter((t) => t.taskStatus === 'Completed').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4), [tasks]);
  const activityTimeline     = useMemo(() => {
    const entries = tasks.flatMap((t) => (t.activityHistory || []).map((e) => ({ ...e, taskId: t._id, taskName: t.taskName })));
    return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  }, [tasks]);

  const productivityInsight = useMemo(() => {
    if (!stats.total) return 'Start by creating tasks. Your productivity snapshot will fill in automatically.';
    if (stats.completionRate >= 75) return 'Excellent execution rhythm! Most tasks are closing on time.';
    if (stats.overdue > 0) return `${stats.overdue} overdue task${stats.overdue > 1 ? 's are' : ' is'} pulling momentum down. Clear those first.`;
    return 'Your workspace looks active. A few focused sessions will push more work to completed.';
  }, [stats]);

  /* ─── Handlers ─── */
  const handleProfileInput  = (e) => setProfileForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePasswordInput = (e) => setPasswordForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePreferenceToggle = async (key) => {
    const prev = preferences;
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    try { const { data } = await API.patch('/profile', { preferences: next }); setUser(data.user); }
    catch (err) { setPreferences(prev); toast.error(err.response?.data?.message || 'Unable to update.'); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { data } = await API.patch('/profile', profileForm);
      setUser(data.user);
      setProfileForm({ name: data.user.name || '', email: data.user.email || '', username: data.user.username || '' });
      setPreferences({ ...emptyPreferences, ...data.user.preferences });
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Unable to update.'); }
    finally { setSubmitting(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match.'); return; }
    setSubmitting(true);
    try {
      const { data } = await API.post('/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success(data.message);
      await logout(); navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Unable to change password.'); }
    finally { setSubmitting(false); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('profilePic', file);
    try {
      const { data } = await API.post('/profilepic', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageUrl(data.url); setPublicId(data.publicId);
      await refreshUser(); toast.success('Profile picture updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed.'); }
  };

  const handleDeleteProfilePic = async () => {
    if (!publicId || !window.confirm('Delete your profile picture?')) return;
    try { await API.delete('/profilepic'); setImageUrl(null); setPublicId(null); await refreshUser(); toast.success('Removed.'); }
    catch (err) { toast.error(err.response?.data?.message || 'Unable to delete.'); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Permanently delete your account? This cannot be undone.')) return;
    try { await API.delete('/delete-account'); toast.success('Account deleted.'); navigate('/login'); }
    catch (err) { toast.error(err.response?.data?.message || 'Unable to delete account.'); }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--tf-surface)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="tf-spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'var(--tf-text-muted)' }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  /* ─── Shared input focus handler ─── */
  const onFocus = (e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.12)'; };
  const onBlur  = (e) => { e.target.style.borderColor = darkMode ? 'var(--tf-border)' : 'rgba(99,102,241,0.15)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={wrapStyle} className={`relative overflow-hidden ${darkMode ? '' : 'light-mode'}`}>
      <div className="orb orb-indigo absolute -left-12 top-6 h-52 w-52 opacity-70" />
      <div className="orb orb-violet absolute right-4 top-24 h-60 w-60 opacity-60" />
      <div className="orb orb-cyan absolute bottom-0 left-1/3 h-52 w-52 opacity-50" />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 20px' }} className="relative z-10">

        {/* ─── Header Bar ─── */}
        <div style={{ ...card(darkMode), display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/dashboard" style={{
              width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: darkMode ? 'rgba(99,102,241,0.1)' : '#eef0ff',
              border: `1px solid ${darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
              color: darkMode ? '#818cf8' : '#6366f1', textDecoration: 'none', transition: 'all 0.2s',
            }}><ArrowLeft size={18} /></Link>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: darkMode ? 'var(--tf-text-subtle)' : '#8080a0', marginBottom: 2 }}>User Profile</div>
              <h1 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Your Workspace Identity</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handlePreferenceToggle('darkMode')}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid var(--tf-border)`,
                background: darkMode ? 'rgba(255,255,255,0.06)' : '#eef0ff', cursor: 'pointer',
                color: darkMode ? 'var(--tf-text-muted)' : '#6060a0', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {darkMode ? <SunMedium size={14} /> : <Moon size={14} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
                border: 'none', cursor: 'pointer',
              }}
            >Logout</button>
          </div>
        </div>

        {/* ─── Main Grid ─── */}
        <div className="profile-main-grid" style={{ gap: 20, alignItems: 'start' }}>

          {/* ─── Left Sidebar ─── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar Card */}
            <div style={{ ...card(darkMode), textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <img
                  src={displayImage} alt="Profile"
                  style={{ width: 100, height: 100, borderRadius: 22, objectFit: 'cover',
                    border: '3px solid rgba(99,102,241,0.3)', boxShadow: '0 8px 24px rgba(99,102,241,0.2)' }}
                />
                <label htmlFor="avatar-upload" style={{
                  position: 'absolute', bottom: -6, right: -6,
                  width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)', border: '2px solid var(--tf-surface)',
                }}>
                  <Camera size={14} style={{ color: 'white' }} />
                  <input id="avatar-upload" type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                </label>
                {publicId && (
                  <button onClick={handleDeleteProfilePic} style={{
                    position: 'absolute', top: -6, left: -6, width: 28, height: 28, borderRadius: '50%',
                    background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Trash2 size={12} style={{ color: '#f43f5e' }} />
                  </button>
                )}
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{user?.name}</h2>
              <p style={{ fontSize: 13, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0', marginBottom: 10 }}>
                @{profileForm.username || 'username'}
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: darkMode ? 'rgba(99,102,241,0.1)' : '#eef0ff',
                border: `1px solid ${darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
                borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600,
                color: darkMode ? '#818cf8' : '#6366f1',
              }}>
                <Mail size={12} /> {user?.email}
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(3,1fr)', gap: 10 }}>
              {[
                { label: 'Total',      value: stats.total,     icon: LayoutGrid,   color: '#6366f1' },
                { label: 'Completed',  value: stats.completed, icon: CheckCircle2, color: '#10b981' },
                { label: 'Pending',    value: stats.pending,   icon: Clock3,       color: '#f59e0b' },
              ].map(({ label: lbl, value, icon: Icon, color }) => (
                <div key={lbl} style={softCard(darkMode)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Icon size={14} style={{ color }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: darkMode ? 'var(--tf-text-subtle)' : '#8080a0' }}>{lbl}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: darkMode ? 'var(--tf-text)' : '#1a1a2e' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Productivity Insight */}
            <div style={softCard(darkMode)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkles size={14} style={{ color: '#6366f1' }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: darkMode ? 'var(--tf-text)' : '#1a1a2e' }}>Productivity Insight</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>
                {productivityInsight}
              </p>
              <div style={{ marginTop: 12, height: 6, background: darkMode ? 'var(--tf-surface-high)' : '#e0e0f8', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stats.completionRate}%`, background: 'linear-gradient(90deg,#6366f1,#10b981)', borderRadius: 10, transition: 'width 0.6s' }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 6, color: darkMode ? 'var(--tf-text-subtle)' : '#8080a0', fontWeight: 600 }}>
                {stats.completionRate}% completion rate
              </div>
            </div>
          </aside>

          {/* ─── Right Main Panel ─── */}
          <main style={card(darkMode)} className="animate-fade-in">
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: `1px solid ${darkMode ? 'var(--tf-border)' : 'rgba(99,102,241,0.1)'}`, paddingBottom: 16, flexWrap: 'wrap' }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: activeTab === tab ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : darkMode ? 'rgba(255,255,255,0.05)' : '#eef0ff',
                    color: activeTab === tab ? 'white' : darkMode ? 'var(--tf-text-muted)' : '#6060a0',
                    boxShadow: activeTab === tab ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >{tab}</button>
              ))}
            </div>

            {/* ── PROFILE TAB ── */}
            {activeTab === 'Profile' && (
              <div className="profile-tab-grid" style={{ gap: 20, alignItems: 'start' }}>
                {/* Profile Details Form */}
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Profile Details</h3>
                    <p style={{ fontSize: 13, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>Keep your account information up to date.</p>
                  </div>
                  <div className="profile-two-col" style={{ gap: 12 }}>
                    {[
                      { field: 'name',     lbl: 'Full Name',  type: 'text'  },
                      { field: 'username', lbl: 'Username',   type: 'text'  },
                    ].map(({ field, lbl, type }) => (
                      <label key={field} style={{ display: 'block' }}>
                        <span style={label(darkMode)}>{lbl}</span>
                        <input name={field} type={type} value={profileForm[field]}
                          onChange={handleProfileInput} style={input(darkMode)} onFocus={onFocus} onBlur={onBlur} />
                      </label>
                    ))}
                  </div>
                  <label style={{ display: 'block' }}>
                    <span style={label(darkMode)}>Email Address</span>
                    <input name="email" type="email" value={profileForm.email} onChange={handleProfileInput} style={input(darkMode)} onFocus={onFocus} onBlur={onBlur} />
                  </label>
                  <button type="submit" disabled={submitting} style={{
                    padding: '10px 22px', borderRadius: 11, fontSize: 13, fontWeight: 700,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
                    border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
                  }}>
                    <Save size={14} /> Save Profile
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Security Snapshot */}
                  <div style={softCard(darkMode)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Shield size={16} style={{ color: '#6366f1' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Security Snapshot</div>
                        <div style={{ fontSize: 12, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>Keep your account protected.</div>
                      </div>
                    </div>
                    {[
                      { lbl: 'Last Login',    val: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Not available' },
                      { lbl: 'Last Activity', val: user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Not available' },
                    ].map(({ lbl, val }) => (
                      <div key={lbl} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>{lbl}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Change Password */}
                  <form onSubmit={handleChangePassword} style={{ ...softCard(darkMode), display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <KeyRound size={16} style={{ color: '#6366f1' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Change Password</div>
                        <div style={{ fontSize: 12, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>Use 8+ chars, uppercase & numbers.</div>
                      </div>
                    </div>
                    {[
                      { key: 'currentPassword', lbl: 'Current Password' },
                      { key: 'newPassword',      lbl: 'New Password' },
                      { key: 'confirmPassword',  lbl: 'Confirm Password' },
                    ].map(({ key, lbl }) => (
                      <label key={key} style={{ display: 'block' }}>
                        <span style={label(darkMode)}>{lbl}</span>
                        <input type="password" name={key} value={passwordForm[key]} onChange={handlePasswordInput} style={input(darkMode)} onFocus={onFocus} onBlur={onBlur} />
                      </label>
                    ))}
                    <button type="submit" disabled={submitting} style={{
                      padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      background: darkMode ? 'rgba(99,102,241,0.15)' : '#eef0ff',
                      color: darkMode ? '#818cf8' : '#6366f1',
                      border: `1px solid ${darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
                    }}>
                      <Shield size={14} /> Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── ACTIVITY TAB ── */}
            {activeTab === 'Activity' && (
              <div className="profile-tab-grid" style={{ gap: 20, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Recent Tasks */}
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Recent Tasks</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {tasksLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0', fontSize: 13 }}>
                          <div className="tf-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                          Loading tasks…
                        </div>
                      ) : recentTasks.length ? recentTasks.map((task) => (
                        <div key={task._id} style={softCard(darkMode)}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{task.taskName}</div>
                              <div style={{ fontSize: 12, color: darkMode ? 'var(--tf-text-subtle)' : '#8080a0' }}>
                                {task.category || 'General'} · {task.taskStatus}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, flexShrink: 0,
                              background: task.priority === 'High' ? 'rgba(244,63,94,0.12)' : task.priority === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(76,215,246,0.12)',
                              color: task.priority === 'High' ? '#f43f5e' : task.priority === 'Medium' ? '#f59e0b' : '#4cd7f6',
                            }}>{task.priority}</span>
                          </div>
                        </div>
                      )) : <div style={{ fontSize: 13, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>No recent tasks yet.</div>}
                    </div>
                  </div>

                  {/* Recently Completed */}
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Recently Completed</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {recentCompletedTasks.length ? recentCompletedTasks.map((task) => (
                        <div key={task._id} style={{ ...softCard(darkMode), display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{task.taskName}</div>
                            <div style={{ fontSize: 12, color: darkMode ? 'var(--tf-text-subtle)' : '#8080a0' }}>
                              {normalizeDate(task.updatedAt)?.toLocaleDateString() || 'recently'}
                            </div>
                          </div>
                        </div>
                      )) : <div style={{ fontSize: 13, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>Completed tasks will appear here.</div>}
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Activity Timeline</h3>
                  <p style={{ fontSize: 12, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0', marginBottom: 16 }}>Recent updates and task changes from your workspace.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {activityTimeline.length ? activityTimeline.map((entry, i) => (
                      <div key={`${entry.taskId}-${entry.createdAt}-${i}`} style={{ display: 'flex', gap: 14 }}>
                        {/* Timeline dot */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', marginTop: 4, flexShrink: 0 }} />
                          {i < activityTimeline.length - 1 && (
                            <div style={{ width: 2, flex: 1, background: darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)', margin: '4px 0' }} />
                          )}
                        </div>
                        <div style={{ ...softCard(darkMode), flex: 1, marginBottom: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{entry.summary}</div>
                          <div style={{ fontSize: 12, color: darkMode ? 'var(--tf-text-subtle)' : '#8080a0', marginTop: 2 }}>{entry.taskName}</div>
                          <div style={{ fontSize: 11, color: darkMode ? 'var(--tf-text-subtle)' : '#8080a0', marginTop: 4 }}>{normalizeDate(entry.createdAt)?.toLocaleString()}</div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ fontSize: 13, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>Activity timeline will fill up as you manage tasks.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'Settings' && (
              <div className="profile-tab-grid" style={{ gap: 20, alignItems: 'start' }}>
                {/* Preferences */}
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Preferences</h3>
                  <p style={{ fontSize: 13, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0', marginBottom: 16 }}>Tailor the experience to your workflow.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { key: 'darkMode',                  lbl: 'Dark Mode',             icon: darkMode ? Moon : SunMedium },
                      { key: 'emailNotifications',        lbl: 'Email Notifications',   icon: Mail   },
                      { key: 'deadlineReminders',         lbl: 'Deadline Reminders',    icon: Clock3 },
                      { key: 'assignmentNotifications',   lbl: 'Assignment Alerts',     icon: Bell   },
                      { key: 'productUpdates',            lbl: 'Product Updates',       icon: Sparkles },
                    ].map(({ key, lbl, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => handlePreferenceToggle(key)}
                        style={{
                          ...softCard(darkMode),
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          border: `1px solid ${darkMode ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)'}`,
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? 'rgba(99,102,241,0.15)' : '#eef0ff' }}>
                            <Icon size={15} style={{ color: '#6366f1' }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{lbl}</span>
                        </div>
                        {/* Toggle */}
                        <div style={{
                          width: 44, height: 24, borderRadius: 12, position: 'relative',
                          background: preferences[key] ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : darkMode ? 'rgba(255,255,255,0.1)' : '#ddd',
                          transition: 'background 0.25s', flexShrink: 0,
                          boxShadow: preferences[key] ? '0 2px 10px rgba(99,102,241,0.4)' : 'none',
                        }}>
                          <div style={{
                            position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
                            background: 'white', transition: 'left 0.25s',
                            left: preferences[key] ? 23 : 3,
                          }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Account Management */}
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Account Management</h3>
                    <div className="profile-two-col" style={{ gap: 10 }}>
                      <div style={softCard(darkMode)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <User size={13} style={{ color: '#6366f1' }} />
                          <span style={{ fontWeight: 700, fontSize: 12 }}>Account Role</span>
                        </div>
                        <p style={{ fontSize: 13, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0', textTransform: 'capitalize' }}>{user?.role || 'user'}</p>
                      </div>
                      <div style={softCard(darkMode)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <Shield size={13} style={{ color: '#10b981' }} />
                          <span style={{ fontWeight: 700, fontSize: 12 }}>Account Status</span>
                        </div>
                        <p style={{ fontSize: 13, color: darkMode ? 'var(--tf-text-muted)' : '#6060a0' }}>Protected & Secure ✓</p>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div style={{
                    background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)',
                    borderRadius: 16, padding: 18,
                  }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f43f5e', marginBottom: 6 }}>Danger Zone</h3>
                    <p style={{ fontSize: 13, color: darkMode ? 'rgba(244,63,94,0.7)' : '#c0304a', marginBottom: 16, lineHeight: 1.6 }}>
                      Deleting your account is permanent and removes all your workspace data.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: '#f43f5e', color: 'white', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
                      }}
                    >
                      <Trash2 size={14} /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
