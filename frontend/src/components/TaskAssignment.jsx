import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserMinus, FaSearch } from 'react-icons/fa';
import { assignTask } from '../library/taskApi';

const TaskAssignment = ({ task, board, onAssignmentChange, darkMode }) => {
  const [assignedUsers, setAssignedUsers] = useState(task.assignedTo || []);
  const [boardMembers, setBoardMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (board) {
      setBoardMembers(board.members || []);
    }
  }, [board]);

  const handleAssignUser = async (userId) => {
    try {
      setLoading(true);
      const newAssignedUsers = [...assignedUsers.map(u => u._id), userId];
      await assignTask(task._id, newAssignedUsers);

      const userToAdd = boardMembers.find(member => member.user._id === userId);
      if (userToAdd) {
        setAssignedUsers(prev => [...prev, userToAdd.user]);
      }

      onAssignmentChange && onAssignmentChange();
    } catch (error) {
      console.error('Error assigning user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignUser = async (userId) => {
    try {
      setLoading(true);
      const newAssignedUsers = assignedUsers
        .filter(u => u._id !== userId)
        .map(u => u._id);
      await assignTask(task._id, newAssignedUsers);

      setAssignedUsers(prev => prev.filter(u => u._id !== userId));

      onAssignmentChange && onAssignmentChange();
    } catch (error) {
      console.error('Error unassigning user:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = boardMembers.filter(member => {
    const user = member.user;
    const searchLower = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(searchLower) ||
           user.email.toLowerCase().includes(searchLower);
  });

  const availableMembers = filteredMembers.filter(member =>
    !assignedUsers.some(assigned => assigned._id === member.user._id)
  );

  if (!board) {
    return (
      <div className={darkMode ? "text-sm text-slate-400" : "text-sm text-gray-500"}>
        Task assignment requires a board context
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-2 flex items-center gap-2">
        <span className={darkMode ? "text-sm font-medium text-slate-200" : "text-sm font-medium"}>Assigned to:</span>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={darkMode ? "btn btn-xs border-0 bg-white/8 text-slate-200 hover:bg-white/12" : "btn btn-ghost btn-xs"}
          disabled={loading}
        >
          <FaUserPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        {assignedUsers.map((user) => (
          <div
            key={user._id}
            className={darkMode ? "flex items-center gap-1 rounded-full bg-[#2b2133] px-2 py-1 text-xs text-[#ffb5c4]" : "flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"}
          >
            <span>{user.name}</span>
            <button
              onClick={() => handleUnassignUser(user._id)}
              className={darkMode ? "rounded-full p-0.5 hover:bg-white/8" : "rounded-full p-0.5 hover:bg-blue-200"}
              disabled={loading}
            >
              <FaUserMinus className="h-3 w-3" />
            </button>
          </div>
        ))}
        {assignedUsers.length === 0 && (
          <span className={darkMode ? "text-sm text-slate-400" : "text-sm text-gray-500"}>No one assigned</span>
        )}
      </div>

      {showDropdown && (
        <div className={darkMode ? "absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-white/10 bg-[#15111a] shadow-[0_20px_60px_rgba(0,0,0,0.35)]" : "absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-base-300 bg-base-100 shadow-lg"}>
          <div className="p-2">
            <div className="relative mb-2">
              <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={darkMode ? "input input-sm w-full border-white/10 bg-[#1d1723] pl-9 text-slate-100" : "input input-bordered input-sm w-full pl-9"}
              />
            </div>

            <div className="max-h-40 overflow-y-auto">
              {availableMembers.length === 0 ? (
                <div className={darkMode ? "py-2 text-center text-sm text-slate-400" : "py-2 text-center text-sm text-gray-500"}>
                  No available users
                </div>
              ) : (
                availableMembers.map((member) => (
                  <button
                    key={member.user._id}
                    onClick={() => handleAssignUser(member.user._id)}
                    className={darkMode ? "flex w-full items-center gap-2 rounded p-2 text-left hover:bg-white/8" : "flex w-full items-center gap-2 rounded p-2 text-left hover:bg-base-200"}
                    disabled={loading}
                  >
                    <div className={darkMode ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#ff7b86] text-xs text-white" : "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white"}>
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={darkMode ? "text-sm font-medium text-slate-100" : "text-sm font-medium"}>{member.user.name}</div>
                      <div className={darkMode ? "text-xs text-slate-400" : "text-xs text-gray-500"}>{member.role}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
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

export default TaskAssignment;
