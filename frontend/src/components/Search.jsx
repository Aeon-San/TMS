import React from 'react'
import { CiSearch } from "react-icons/ci";
import { IoIosAdd } from "react-icons/io";
import { FiFilter } from "react-icons/fi";

const Search = ({ isOpen, onOpen, onClose, setSearch, darkMode, selectedBoard, totalTasks }) => {
  const shellClass = darkMode
    ? "mb-6 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-white/5 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
    : "mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between";
  const inputWrapClass = darkMode
    ? "flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#17131c] px-4 py-3"
    : "flex flex-1 items-center gap-3 rounded-2xl border border-[#f3c5d0] bg-[#fff8fa] px-4 py-3";

  return (
    <>
    <div className={shellClass}>
        <div className={inputWrapClass}>
          <CiSearch className={darkMode ? "text-2xl text-slate-400" : "text-2xl text-slate-500"} />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or keywords"
            className={darkMode
              ? "w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              : "w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"}
            onChange={(e)=> setSearch(e.target.value)}
          />
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <div className={darkMode ? "flex items-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-300" : "flex items-center gap-2 rounded-2xl bg-[#fff3f6] px-4 py-3 text-sm text-slate-600"}>
            <FiFilter />
            <span>{selectedBoard ? selectedBoard.name : "All Boards"}</span>
          </div>
          <div className={darkMode ? "rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-300" : "rounded-2xl bg-[#fff3f6] px-4 py-3 text-sm text-slate-600"}>
            {totalTasks} tasks visible
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="flex items-center gap-2 rounded-2xl bg-[#ff7b86] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,123,134,0.28)] transition hover:bg-[#ff6a77]"
          >
            <IoIosAdd className='text-2xl' />
            Add Task
          </button>
        </div>
    </div>
    </>
  )
}

export default Search
