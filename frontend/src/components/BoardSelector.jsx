import React, { useState, useEffect } from 'react';
import { FaPlus, FaUsers, FaCrown } from 'react-icons/fa';
import boardApi from '../library/boardApi';

const BoardSelector = ({ selectedBoard, onBoardSelect, onBoardCreate, darkMode }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardApi.get('/');
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const response = await boardApi.post('/', {
        name: newBoardName.trim(),
        description: newBoardDescription.trim(),
      });

      setBoards(prev => [response.data, ...prev]);
      setNewBoardName('');
      setNewBoardDescription('');
      setShowCreateForm(false);
      onBoardCreate && onBoardCreate(response.data);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const shellClass = darkMode
    ? "rounded-[28px] border border-[#31456e] bg-[#1f2f4f] p-4 shadow-sm"
    : "rounded-[28px] border border-[#d6e1f6] bg-[linear-gradient(180deg,#f9fbff_0%,#eef4ff_100%)] p-4 shadow-sm";

  return (
    <div className={shellClass}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={darkMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-900"}>Boards</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-sm rounded-2xl border-0 bg-[#2f66dd] text-white shadow-[0_10px_20px_rgba(47,102,221,0.28)] hover:bg-[#2456c2]"
        >
          <FaPlus className="w-4 h-4" />
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateBoard} className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="Board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            className={darkMode ? "input input-sm w-full rounded-2xl border border-[#31456e] bg-[#15233f] text-slate-100" : "input input-sm w-full rounded-2xl border border-[#c9d9f6] bg-white text-slate-700"}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newBoardDescription}
            onChange={(e) => setNewBoardDescription(e.target.value)}
            className={darkMode ? "textarea textarea-sm w-full rounded-2xl border border-[#31456e] bg-[#15233f] text-slate-100" : "textarea textarea-sm w-full rounded-2xl border border-[#c9d9f6] bg-white text-slate-700"}
            rows="2"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-sm rounded-2xl border-0 bg-[#2f66dd] text-white hover:bg-[#2456c2]">
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn btn-sm rounded-2xl border-0 bg-[#edf4ff] text-slate-700 hover:bg-[#dfeaff]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <button
          onClick={() => onBoardSelect(null)}
          className={`w-full rounded-2xl border p-3 text-left transition ${
            !selectedBoard
              ? darkMode
                ? 'border-[#6f86b4] bg-[#d3d9e3] shadow-sm'
                : 'border-[#b9cdf2] bg-[#e8f1ff] shadow-sm'
              : darkMode
                ? 'border-[#31456e] bg-[#1a2744] hover:bg-[#223459]'
                : 'border-transparent bg-white/80 hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2f66dd] text-[11px] font-semibold text-white">
              Home
            </div>
            <div>
              <div className={darkMode ? "font-medium text-[#3f4f68]" : "font-medium text-slate-900"}>Personal Tasks</div>
              <div className={darkMode ? "text-xs text-[#7788a3]" : "text-xs text-slate-500"}>Your private tasks</div>
            </div>
          </div>
        </button>

        {loading ? (
          <div className="text-center py-4">
            <div className="loading loading-spinner loading-sm"></div>
          </div>
        ) : (
          boards.map((board) => (
            <button
              key={board._id}
              onClick={() => onBoardSelect(board)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selectedBoard?._id === board._id
                  ? darkMode
                    ? 'border-[#6f86b4] bg-[#d3d9e3] shadow-sm'
                    : 'border-[#b9cdf2] bg-[#e8f1ff] shadow-sm'
                  : darkMode
                    ? 'border-[#31456e] bg-[#1a2744] hover:bg-[#223459]'
                    : 'border-transparent bg-white/80 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c8d8f7] text-[11px] font-semibold text-[#2f66dd]">
                  Board
                </div>
                <div className="flex-1">
                  <div className={darkMode ? "flex items-center gap-1 font-medium text-[#3f4f68]" : "flex items-center gap-1 font-medium text-slate-900"}>
                    {board.name}
                    {board.owner._id === board.members.find(m => m.role === 'owner')?.user._id && (
                      <FaCrown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <div className={darkMode ? "flex items-center gap-1 text-xs text-[#7788a3]" : "flex items-center gap-1 text-xs text-slate-500"}>
                    <FaUsers className="w-3 h-3" />
                    {board.members.length} members
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default BoardSelector;
