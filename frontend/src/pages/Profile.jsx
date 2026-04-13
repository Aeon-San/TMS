import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../library/api.js';
import taskApi from '../library/taskApi.js';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  Clock3,
  KeyRound,
  LayoutGrid,
  LoaderCircle,
  Mail,
  Moon,
  Save,
  Shield,
  Sparkles,
  SunMedium,
  Trash2,
  User,
} from 'lucide-react';

const TABS = ['Profile', 'Activity', 'Settings'];

const emptyPreferences = {
  darkMode: false,
  emailNotifications: true,
  deadlineReminders: true,
  assignmentNotifications: true,
  productUpdates: false,
};

const inputClass = (darkMode) =>
  darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#1d1723] px-4 py-3 text-slate-100 outline-none'
    : 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none';

const cardClass = (darkMode) =>
  darkMode ? 'border border-white/8 bg-white/6' : 'border border-white/70 bg-white/90';

const softCardClass = (darkMode) =>
  darkMode ? 'bg-white/6' : 'bg-[#fff7f8]';

const Profile = () => {
  const { user, logout, refreshUser, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [tasks, setTasks] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', username: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [preferences, setPreferences] = useState(emptyPreferences);
  const [imageUrl, setImageUrl] = useState(null);
  const [publicId, setPublicId] = useState(null);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const currentUser = await refreshUser();
        setProfileForm({
          name: currentUser.name || '',
          email: currentUser.email || '',
          username: currentUser.username || '',
        });
        setPreferences({ ...emptyPreferences, ...currentUser.preferences });
        setImageUrl(currentUser.profilePic || null);
        setAvatar(currentUser.avatar || null);
        setPublicId(currentUser.profilePicPublicId || null);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [navigate, refreshUser]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const response = await taskApi.get('/', { params: { limit: 100, sortBy: 'newest' } });
        setTasks(Array.isArray(response.data) ? response.data : response.data.tasks || []);
      } catch (error) {
        toast.error('Unable to load profile activity.');
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const normalizeDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.taskStatus === 'Completed').length;
    const pending = tasks.filter((task) => task.taskStatus === 'Pending').length;
    const inProgress = tasks.filter((task) => task.taskStatus === 'In Progress').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const overdue = tasks.filter((task) => {
      const due = normalizeDate(task.dueDate);
      return due && due < new Date() && task.taskStatus !== 'Completed';
    }).length;
    return { total, completed, pending, inProgress, completionRate, overdue };
  }, [tasks]);

  const recentTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5),
    [tasks]
  );

  const recentCompletedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.taskStatus === 'Completed')
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 4),
    [tasks]
  );

  const activityTimeline = useMemo(() => {
    const entries = tasks.flatMap((task) =>
      (task.activityHistory || []).map((entry) => ({
        ...entry,
        taskId: task._id,
        taskName: task.taskName,
      }))
    );
    return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  }, [tasks]);

  const productivityInsight = useMemo(() => {
    if (!stats.total) return 'Start by creating a few tasks. Your productivity snapshot will begin filling in automatically.';
    if (stats.completionRate >= 75) return 'You are in a strong execution rhythm. Most tasks are closing on time and the completion rate looks excellent.';
    if (stats.overdue > 0) return `${stats.overdue} overdue task${stats.overdue > 1 ? 's are' : ' is'} pulling your momentum down. Clearing those first will help quickly.`;
    return 'Your workspace looks active. A few focused sessions should push more work into the completed column.';
  }, [stats]);

  const displayImage = imageUrl || avatar || '/image/user.png';
  const darkMode = preferences.darkMode;

  const handleProfileInput = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = async (key) => {
    const previousPreferences = preferences;
    const nextPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(nextPreferences);
    try {
      const { data } = await API.patch('/profile', { preferences: nextPreferences });
      setUser(data.user);
    } catch (error) {
      setPreferences(previousPreferences);
      toast.error(error.response?.data?.message || 'Unable to update settings.');
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await API.patch('/profile', profileForm);
      setUser(data.user);
      setProfileForm({
        name: data.user.name || '',
        email: data.user.email || '',
        username: data.user.username || '',
      });
      setPreferences({ ...emptyPreferences, ...data.user.preferences });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password must match.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await API.post('/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(data.message);
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    try {
      const { data } = await API.post('/profilepic', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageUrl(data.url);
      setPublicId(data.publicId);
      await refreshUser();
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed.');
    }
  };

  const handleDeleteProfilePic = async () => {
    if (!publicId || !window.confirm('Delete your profile picture?')) return;
    try {
      await API.delete('/profilepic');
      setImageUrl(null);
      setPublicId(null);
      await refreshUser();
      toast.success('Profile picture removed.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete profile picture.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account?')) return;
    try {
      await API.delete('/delete-account');
      toast.success('Account deleted.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete account.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
          <LoaderCircle className="h-10 w-10 animate-spin text-[#2563eb]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-8 ${darkMode ? 'bg-[radial-gradient(circle_at_top,#2d1e33_0%,#16121b_42%,#0c0a10_100%)] text-slate-100' : 'bg-white text-slate-900'}`}>
        <div className="mx-auto max-w-[1450px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <div className={`mb-4 rounded-[24px] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:mb-6 sm:rounded-[32px] sm:p-6 ${darkMode ? 'border border-white/8 bg-white/6 backdrop-blur' : 'border border-slate-200 bg-white'}`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link to="/dashboard" className={darkMode ? 'inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-slate-100 transition hover:bg-white/12' : 'inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-slate-700 transition hover:bg-blue-100'}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <p className={`text-xs uppercase tracking-[0.28em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>User Profile</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Your Workspace Identity</h1>
                <p className={`mt-2 max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manage your profile, tighten account security, and track your personal productivity in one place.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => handlePreferenceToggle('darkMode')} className={darkMode ? 'btn rounded-2xl border-0 bg-white/8 text-slate-100 hover:bg-white/12' : 'btn rounded-2xl border-0 bg-white text-slate-700 hover:bg-[#fff7f8]'}>
                {darkMode ? <SunMedium className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button type="button" onClick={logout} className="btn rounded-2xl border-0 bg-slate-900 text-white hover:bg-slate-800">Logout</button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <aside className={`rounded-[24px] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:p-6 ${darkMode ? 'border border-white/8 bg-white/6 backdrop-blur' : 'border border-slate-200 bg-white'}`}>
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="relative">
                <img src={displayImage} alt="Profile" className="h-28 w-28 rounded-[28px] object-cover shadow-[0_18px_40px_rgba(15,23,42,0.14)]" />
                <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-[0_12px_24px_rgba(37,99,235,0.3)] transition hover:scale-105">
                  <Camera className="h-4 w-4" />
                  <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                {publicId ? (
                  <button type="button" onClick={handleDeleteProfilePic} className="absolute -left-2 -top-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2b2133] text-white transition hover:bg-[#392c45]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <h2 className="mt-5 text-2xl font-bold">{user?.name}</h2>
              <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>@{profileForm.username || 'username'}</p>
              <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${darkMode ? 'bg-white/8 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3 xl:grid-cols-1">
              {[
                { label: 'Total Tasks', value: stats.total, icon: LayoutGrid },
                { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
                { label: 'Pending', value: stats.pending, icon: Clock3 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className={`rounded-[24px] p-4 ${cardClass(darkMode)}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className={darkMode ? 'rounded-2xl bg-[#2563eb]/20 p-2 text-[#93c5fd]' : 'rounded-2xl bg-blue-50 p-2 text-[#2563eb]'}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                  </div>
                  <div className="text-3xl font-black">{value}</div>
                </div>
              ))}
            </div>

            <div className={`mt-6 rounded-[24px] p-5 ${cardClass(darkMode)}`}>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#2563eb]" />
                <h3 className="font-semibold">Productivity Insight</h3>
              </div>
              <p className={`text-sm leading-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{productivityInsight}</p>
              <div className={`mt-4 h-2 rounded-full ${darkMode ? 'bg-white/8' : 'bg-slate-200'}`}>
                <div className="h-full rounded-full bg-[#2563eb] transition-all duration-500" style={{ width: `${stats.completionRate}%` }} />
              </div>
              <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stats.completionRate}% completion rate</p>
            </div>
          </aside>

          <main className={`rounded-[24px] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:p-6 ${darkMode ? 'border border-white/8 bg-white/6 backdrop-blur' : 'border border-slate-200 bg-white'}`}>
            <div className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-[#2563eb] text-white shadow-[0_12px_24px_rgba(37,99,235,0.3)]'
                      : darkMode
                        ? 'bg-white/8 text-slate-200 hover:bg-white/12'
                        : 'bg-slate-100 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Profile' ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
                <form onSubmit={handleSaveProfile} className={`rounded-[28px] p-5 ${cardClass(darkMode)}`}>
                  <div className="mb-5">
                    <h3 className="text-xl font-bold">Profile Details</h3>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Keep your identity and account information up to date.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className={`mb-2 block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</span>
                      <input name="name" value={profileForm.name} onChange={handleProfileInput} className={inputClass(darkMode)} />
                    </label>
                    <label className="block">
                      <span className={`mb-2 block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Username</span>
                      <input name="username" value={profileForm.username} onChange={handleProfileInput} className={inputClass(darkMode)} />
                    </label>
                    <label className="block md:col-span-2">
                      <span className={`mb-2 block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</span>
                      <input name="email" type="email" value={profileForm.email} onChange={handleProfileInput} className={inputClass(darkMode)} />
                    </label>
                  </div>
                  <button type="submit" disabled={submitting} className="mt-5 inline-flex items-center rounded-2xl bg-[#2563eb] px-5 py-3 font-medium text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70">
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </button>
                </form>

                <div className="space-y-6">
                  <div className={`rounded-[28px] p-5 ${cardClass(darkMode)}`}>
                    <div className="mb-5 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#2563eb]" />
                      <div>
                        <h3 className="text-xl font-bold">Security Snapshot</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Keep your account protected with strong credentials.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className={`rounded-2xl p-4 ${softCardClass(darkMode)}`}>
                        <div className="text-sm font-medium">Last Login</div>
                        <div className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Not available'}</div>
                      </div>
                      <div className={`rounded-2xl p-4 ${softCardClass(darkMode)}`}>
                        <div className="text-sm font-medium">Last Activity</div>
                        <div className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Not available'}</div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className={`rounded-[28px] p-5 ${cardClass(darkMode)}`}>
                    <div className="mb-5 flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-[#2563eb]" />
                      <div>
                        <h3 className="text-xl font-bold">Change Password</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Use a strong password with uppercase, lowercase, and numbers.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { key: 'currentPassword', label: 'Current Password' },
                        { key: 'newPassword', label: 'New Password' },
                        { key: 'confirmPassword', label: 'Confirm New Password' },
                      ].map((field) => (
                        <label key={field.key} className="block">
                          <span className={`mb-2 block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{field.label}</span>
                          <input type="password" name={field.key} value={passwordForm[field.key]} onChange={handlePasswordInput} className={inputClass(darkMode)} />
                        </label>
                      ))}
                    </div>
                    <button type="submit" disabled={submitting} className="mt-5 inline-flex items-center rounded-2xl bg-[#2b2133] px-5 py-3 font-medium text-white transition hover:bg-[#392c45] disabled:cursor-not-allowed disabled:opacity-70">
                      <Shield className="mr-2 h-4 w-4" />
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {activeTab === 'Activity' ? (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-6">
                  <div className={`rounded-[28px] p-5 ${cardClass(darkMode)}`}>
                    <h3 className="text-xl font-bold">Recent Tasks</h3>
                    <div className="mt-4 space-y-3">
                      {tasksLoading ? (
                        <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Loading tasks...</div>
                      ) : recentTasks.length ? (
                        recentTasks.map((task) => (
                          <div key={task._id} className={`rounded-2xl p-4 ${softCardClass(darkMode)}`}>
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="font-semibold">{task.taskName}</div>
                                <div className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{task.category || 'General'} • {task.taskStatus}</div>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                task.priority === 'High'
                                ? 'bg-sky-100 text-sky-700'
                                  : task.priority === 'Medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>No recent tasks yet.</div>
                      )}
                    </div>
                  </div>

                  <div className={`rounded-[28px] p-5 ${cardClass(darkMode)}`}>
                    <h3 className="text-xl font-bold">Recently Completed</h3>
                    <div className="mt-4 space-y-3">
                      {recentCompletedTasks.length ? (
                        recentCompletedTasks.map((task) => (
                          <div key={task._id} className={`rounded-2xl p-4 ${softCardClass(darkMode)}`}>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb] text-white">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-semibold">{task.taskName}</div>
                                <div className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Completed {normalizeDate(task.updatedAt)?.toLocaleString() || 'recently'}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Completed tasks will appear here.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`rounded-[28px] p-5 ${cardClass(darkMode)}`}>
                  <h3 className="text-xl font-bold">Activity Timeline</h3>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Recent updates, completions, comments, and task changes from your workspace.</p>
                  <div className="mt-5 space-y-4">
                    {activityTimeline.length ? (
                      activityTimeline.map((entry, index) => (
                        <div key={`${entry.taskId}-${entry.createdAt}-${index}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="mt-1 h-3 w-3 rounded-full bg-[#2563eb]" />
                            {index !== activityTimeline.length - 1 ? <div className={`mt-2 h-full w-px ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`} /> : null}
                          </div>
                          <div className={`flex-1 rounded-2xl p-4 ${softCardClass(darkMode)}`}>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="font-semibold">{entry.summary}</div>
                                <div className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{entry.taskName}</div>
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{normalizeDate(entry.createdAt)?.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Your activity timeline will fill up as you manage tasks.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'Settings' ? (
              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`rounded-[28px] p-5 ${cardClass(darkMode)}`}>
                  <h3 className="text-xl font-bold">Preferences</h3>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tailor the experience to your workflow and communication style.</p>
                  <div className="mt-5 space-y-3">
                    {[
                      { key: 'darkMode', label: 'Dark Mode', icon: darkMode ? Moon : SunMedium },
                      { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                      { key: 'deadlineReminders', label: 'Deadline Reminders', icon: Clock3 },
                      { key: 'assignmentNotifications', label: 'Assignment Alerts', icon: Bell },
                      { key: 'productUpdates', label: 'Product Updates', icon: Sparkles },
                    ].map(({ key, label, icon: Icon }) => (
                      <button key={key} type="button" onClick={() => handlePreferenceToggle(key)} className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition ${softCardClass(darkMode)} ${darkMode ? 'hover:bg-white/10' : 'hover:bg-blue-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={darkMode ? 'rounded-2xl bg-white/8 p-2 text-slate-200' : 'rounded-2xl bg-white p-2 text-slate-700'}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{label}</span>
                        </div>
                        <div className={`relative h-7 w-12 rounded-full transition ${preferences[key] ? 'bg-[#2563eb]' : darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${preferences[key] ? 'left-6' : 'left-1'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={`rounded-[28px] p-5 ${cardClass(darkMode)}`}>
                    <h3 className="text-xl font-bold">Account Management</h3>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className={`rounded-2xl p-4 ${softCardClass(darkMode)}`}>
                        <div className="mb-2 flex items-center gap-2 font-semibold">
                          <User className="h-4 w-4 text-[#2563eb]" />
                          Account Role
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{user?.role || 'user'}</p>
                      </div>
                      <div className={`rounded-2xl p-4 ${softCardClass(darkMode)}`}>
                        <div className="mb-2 flex items-center gap-2 font-semibold">
                          <Shield className="h-4 w-4 text-[#2563eb]" />
                          Account Status
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Protected with secure session cookies and password hashing</p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-[28px] p-5 ${darkMode ? 'border border-white/8 bg-white/6' : 'border border-slate-200 bg-slate-50'}`}>
                    <h3 className="text-xl font-bold text-slate-900">Danger Zone</h3>
                    <p className="mt-2 max-w-xl text-sm text-slate-600">Deleting your account is permanent and removes access to your personal workspace data.</p>
                    <button type="button" onClick={handleDeleteAccount} className="mt-5 inline-flex items-center rounded-2xl bg-rose-600 px-5 py-3 font-medium text-white transition hover:bg-rose-700">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
