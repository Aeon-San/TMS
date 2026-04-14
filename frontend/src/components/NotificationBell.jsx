import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import notificationApi from '../library/notificationApi';

const NotificationBell = ({ darkMode, compact = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const unreadInterval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(unreadInterval);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;

    fetchNotifications();
    const notificationInterval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(notificationInterval);
  }, [showDropdown]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.get('/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.get('/', {
        params: { page: 1, limit: 20 }
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.put(`/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.put('/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationApi.delete(`/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return 'User';
      case 'task_status_changed':
        return 'Status';
      case 'task_comment_added':
        return 'Comment';
      case 'task_attachment_added':
        return 'File';
      case 'deadline_reminder':
        return 'Reminder';
      case 'board_invitation':
        return 'Invite';
      case 'board_member_joined':
        return 'Member';
      default:
        return 'Bell';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className={darkMode
          ? `relative ${compact ? "rounded-2xl px-3 py-3 sm:px-4" : "btn btn-circle"} border border-white/10 bg-white/6 text-slate-100 hover:bg-white/10`
          : `relative ${compact ? "rounded-2xl px-3 py-3 sm:px-4" : "btn btn-circle"} border border-[#f1d1d8] bg-white/80 text-slate-700 hover:bg-[#fff3f6]`}
      >
        <div className="flex items-center gap-2">
          <FaBell className="h-5 w-5" />
          {compact ? <span className="text-sm font-medium">Notifications</span> : null}
        </div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className={darkMode
          ? "fixed left-2 right-2 top-20 z-50 max-h-[75vh] overflow-hidden rounded-[20px] border border-white/10 bg-[#15111a] shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:max-h-96 sm:w-80 sm:rounded-[24px]"
          : "fixed left-2 right-2 top-20 z-50 max-h-[75vh] overflow-hidden rounded-[20px] border border-[#f1d1d8] bg-white shadow-[0_20px_60px_rgba(163,82,104,0.18)] sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:max-h-96 sm:w-80 sm:rounded-[24px]"}>
          <div className={darkMode ? "flex items-center justify-between border-b border-white/8 p-3" : "flex items-center justify-between border-b border-[#f6d8df] p-3"}>
            <h3 className={darkMode ? "font-semibold text-white" : "font-semibold text-slate-900"}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={darkMode ? "btn btn-sm border-0 bg-white/8 text-slate-200 hover:bg-white/12 sm:btn-xs" : "btn btn-sm border-0 bg-[#fff3f6] text-slate-700 hover:bg-[#ffe8ee] sm:btn-xs"}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="loading loading-spinner loading-sm"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className={darkMode ? "p-4 text-center text-slate-400" : "p-4 text-center text-gray-500"}>
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`cursor-pointer border-b p-3 ${
                    darkMode ? "border-white/6 hover:bg-white/6" : "border-[#f7e0e5] hover:bg-[#fff5f7]"
                  } ${
                    !notification.isRead
                      ? darkMode ? 'bg-[#211927]' : 'bg-[#fff0f4]'
                      : ''
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={darkMode ? "text-lg text-[#ff9bab]" : "text-lg text-[#d45d83]"}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={darkMode ? "text-sm font-medium text-white" : "text-sm font-medium text-slate-900"}>
                        {notification.title}
                      </p>
                      <p className={darkMode ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-gray-600"}>
                        {notification.message}
                      </p>
                      <p className={darkMode ? "mt-1 text-xs text-slate-500" : "mt-1 text-xs text-gray-400"}>
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className={darkMode ? "btn btn-xs border-0 bg-transparent text-slate-500 opacity-60 hover:bg-white/8 hover:opacity-100" : "btn btn-xs border-0 bg-transparent text-slate-500 opacity-60 hover:bg-[#fff3f6] hover:opacity-100"}
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
