import { createPortal } from "react-dom";

const SimpleModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,17,26,0.42)] px-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#17131c] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-2xl text-white/80 transition hover:text-white"
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
};

export default SimpleModal;
