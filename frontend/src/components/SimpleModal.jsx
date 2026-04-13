import { createPortal } from "react-dom";

const SimpleModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(15,23,42,0.25)] px-4 py-8 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-[28px] border border-white/80 bg-white p-6 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.18)] max-h-[calc(100vh-4rem)] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-2xl text-slate-500 transition hover:text-slate-900"
        >
          x
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
};

export default SimpleModal;
