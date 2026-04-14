import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { addComment, getTaskComments } from '../library/taskApi';

const CommentSection = ({ taskId, board, task, darkMode }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await getTaskComments(taskId);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await addComment(taskId, newComment.trim(), mentions);
      setNewComment('');
      setMentions([]);
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1) {
      const searchText = value.substring(atIndex + 1);
      setMentionSearch(searchText);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionSearch('');
    }
  };

  const handleMentionSelect = (user) => {
    const atIndex = newComment.lastIndexOf('@');
    const beforeAt = newComment.substring(0, atIndex);
    const afterAt = newComment.substring(atIndex + mentionSearch.length + 1);

    setNewComment(`${beforeAt}@${user.name} ${afterAt}`);
    setMentions(prev => [...prev, user._id]);
    setShowMentions(false);
    setMentionSearch('');
  };

  const boardUsers = board?.members?.map(member => member.user) || [];
  const taskUsers = task ? [
    task.user,
    ...(task.assignedTo || [])
  ].filter((user, index, arr) =>
    arr.findIndex(u => u._id === user._id) === index
  ) : [];

  const availableUsers = boardUsers.length > 0 ? boardUsers : taskUsers;
  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mt-4">
      <h4 className={darkMode ? "mb-3 text-md font-semibold text-white" : "mb-3 text-md font-semibold"}>Comments</h4>

      <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
        {comments.length === 0 ? (
          <div className={darkMode ? "py-4 text-center text-sm text-slate-400" : "py-4 text-center text-sm text-gray-500"}>
            No comments yet
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className={darkMode ? "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff7b86] text-sm text-white" : "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm text-white"}>
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className={darkMode ? "text-sm font-medium text-slate-100" : "text-sm font-medium"}>{comment.user.name}</span>
                  <span className={darkMode ? "text-xs text-slate-500" : "text-xs text-gray-500"}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className={darkMode ? "text-sm text-slate-300" : "text-sm text-gray-700"}>{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmitComment} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              value={newComment}
              onChange={handleCommentChange}
              placeholder="Add a comment... Use @ to mention users"
              className={darkMode ? "textarea w-full resize-none border-white/10 bg-[#1d1723] text-slate-100 placeholder:text-slate-500" : "textarea textarea-bordered w-full resize-none"}
              rows="2"
              disabled={loading}
            />

            {showMentions && filteredUsers.length > 0 && (
              <div className={darkMode ? "absolute bottom-full left-0 right-0 z-50 max-h-32 overflow-y-auto rounded-lg border border-white/10 bg-[#15111a] shadow-lg" : "absolute bottom-full left-0 right-0 z-50 max-h-32 overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"}>
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleMentionSelect(user)}
                    className={darkMode ? "flex w-full items-center gap-2 p-2 text-left hover:bg-white/8" : "flex w-full items-center gap-2 p-2 text-left hover:bg-base-200"}
                  >
                    <div className={darkMode ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#ff7b86] text-xs text-white" : "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white"}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={darkMode ? "text-sm text-slate-100" : "text-sm"}>{user.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className={darkMode ? "btn self-end border-0 bg-[#ff7b86] text-white hover:bg-[#ff6a77]" : "btn btn-primary self-end"}
            disabled={loading || !newComment.trim()}
          >
            <FaPaperPlane className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
