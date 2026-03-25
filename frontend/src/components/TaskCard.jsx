import React, { useState } from 'react'
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import { FaFlag, FaCalendarAlt } from "react-icons/fa";
import taskApi from '../library/taskApi';

const TaskCard = ({ task, onUpdate, onSelect, onEdit, onDelete, onStatusChange, darkMode }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const data = task || {};

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCompletionWidth = (status) => {
    switch (status) {
      case 'Completed': return '100%';
      case 'In Progress': return '62%';
      default: return '24%';
    }
  };

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    try {
      let nextStatus = "In Progress";
      if (data.taskStatus === "Pending") {
        nextStatus = "In Progress";
      } else if (data.taskStatus === "In Progress") {
        nextStatus = "Completed";
      } else if (data.taskStatus === "Completed") {
        nextStatus = "Pending";
      }

      console.log("Sending status update:", { status: nextStatus });
      const response = await taskApi.patch(`/${data._id}/status`, { status: nextStatus });
      console.log("Status update response:", response.data);
      
      if (onStatusChange) {
        onStatusChange(response.data);
      } else if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = () => {
    if (!data || !data.dueDate || data.taskStatus === 'Completed') return false;
    return new Date(data.dueDate) < new Date();
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(data);
    } else if (onEdit) {
      onEdit(data);
    }
  };

  if (!data || !data._id) {
    return null;
  }

  return (
    <div 
      className={`mx-auto mb-4 w-full max-w-md cursor-pointer rounded-[24px] border p-4 transition-all duration-200 hover:scale-[1.02] ${
        darkMode
          ? `shadow-[0_12px_30px_rgba(0,0,0,0.28)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.34)] ${
              data.taskStatus === 'Completed' ? 'border-green-400/20 bg-[#142019]' :
              isOverdue() ? 'border-red-400/20 bg-[#26161b]' : 'border-white/8 bg-[#17131c]'
            }`
          : `shadow-[0_12px_30px_rgba(163,82,104,0.1)] hover:shadow-[0_16px_36px_rgba(163,82,104,0.16)] ${
              data.taskStatus === 'Completed' ? 'border-green-200 bg-[#f2fff6]' :
              isOverdue() ? 'border-red-200 bg-[#fff1f2]' : 'border-[#f1d1d8] bg-white'
            }`
      }`}
      onClick={handleCardClick}
    >

      <div className='flex justify-between items-start mb-3'>
        <div className='flex items-center gap-2'>
          <FaFlag className={`${getPriorityColor(data.priority)} text-sm`} />
          <span className={darkMode ? 'text-xs font-medium uppercase tracking-wide text-slate-400' : 'text-xs font-medium text-gray-600 uppercase tracking-wide'}>
            {data.priority}
          </span>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) {
                onEdit(data);
              } else if (onSelect) {
                onSelect(data);
              }
            }}
            className='rounded p-1 text-gray-500 transition-colors hover:bg-[#eef4ff] hover:text-blue-600'
            title="Edit task"
          >
            <MdOutlineEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(data._id);
              }
            }}
            className='rounded p-1 text-gray-500 transition-colors hover:bg-[#fff0f3] hover:text-red-600'
            title="Delete task"
          >
            <MdOutlineDelete size={18} />
          </button>
        </div>
      </div>

      <h3 className={`font-semibold text-lg mb-2 ${
        data.taskStatus === 'Completed' ? 'line-through text-gray-500' : darkMode ? 'text-slate-100' : 'text-slate-900'
      }`}>
        {data.taskName}
      </h3>

      {data.description && (
        <p className={darkMode ? 'mb-3 line-clamp-2 text-sm text-slate-400' : 'mb-3 line-clamp-2 text-sm text-slate-600'}>
          {data.description}
        </p>
      )}

      {data.dueDate && (
        <div className={`flex items-center gap-2 mb-3 text-sm ${
          isOverdue() ? 'text-red-500' : darkMode ? 'text-slate-400' : 'text-gray-500'
        }`}>
          <FaCalendarAlt size={14} />
          <span className={isOverdue() ? 'font-medium' : ''}>
            Due: {formatDate(data.dueDate)}
            {isOverdue() && ' (Overdue)'}
          </span>
        </div>
      )}

      {data.category && data.category !== 'General' && (
        <div className='mb-3 flex flex-wrap gap-2'>
          <span className={darkMode ? 'inline-block rounded-full bg-white/8 px-2 py-1 text-xs text-slate-300' : 'inline-block rounded-full bg-[#fff3f6] px-2 py-1 text-xs text-slate-700'}>
            {data.category}
          </span>
          {Array.isArray(data.tags) && data.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={darkMode ? 'inline-block rounded-full bg-[#2b2133] px-2 py-1 text-xs text-[#ffb5c4]' : 'inline-block rounded-full bg-[#ffe7ed] px-2 py-1 text-xs text-[#a63f63]'}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {Array.isArray(data.tags) && data.tags.length > 0 && data.category === 'General' && (
        <div className='mb-3 flex flex-wrap gap-2'>
          {data.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={darkMode ? 'inline-block rounded-full bg-[#2b2133] px-2 py-1 text-xs text-[#ffb5c4]' : 'inline-block rounded-full bg-[#ffe7ed] px-2 py-1 text-xs text-[#a63f63]'}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStatusToggle();
        }}
        disabled={isUpdating}
        className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
          getStatusColor(data.taskStatus)
        } hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isUpdating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="loading loading-spinner loading-sm"></span>
            Updating...
          </span>
        ) : (
          data.taskStatus
        )}
      </button>

      <div className={darkMode ? 'mt-3 h-2 rounded-full bg-white/8' : 'mt-3 h-2 rounded-full bg-[#ffe2e9]'}>
        <div
          className="h-full rounded-full bg-[#ff7b86] transition-all duration-500"
          style={{ width: getCompletionWidth(data.taskStatus) }}
        />
      </div>

      {data.assignedTo && data.assignedTo.length > 0 && (
        <div className='mt-3'>
          <div className='text-xs text-gray-500 mb-2'>Assigned to:</div>
          <div className='flex flex-wrap gap-1'>
            {data.assignedTo.map((user) => (
              <div
                key={user._id}
                className='flex items-center gap-1 rounded-full bg-[#ffe7ed] px-2 py-1 text-xs text-[#a63f63]'
                title={user.name}
              >
                <div className='flex h-4 w-4 items-center justify-center rounded-full bg-[#ff7b86] text-xs text-white'>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className='truncate max-w-16'>{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={darkMode ? 'mt-3 space-y-1 text-center text-xs text-slate-500' : 'mt-3 space-y-1 text-center text-xs text-gray-400'}>
        <div>Created: {formatDateTime(data.createdAt)}</div>
        {data.updatedAt !== data.createdAt && (
          <div>Updated: {formatDateTime(data.updatedAt)}</div>
        )}
      </div>
    </div>
  )
}

export default TaskCard
