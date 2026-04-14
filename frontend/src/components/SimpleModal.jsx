import { createPortal } from "react-dom";

const SimpleModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,17,26,0.42)] px-3 py-4 backdrop-blur-md sm:px-4">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[24px] border border-white/10 bg-[#17131c] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:rounded-[28px] sm:p-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-2 text-2xl text-white/80 transition hover:text-white sm:right-4 sm:top-3"
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
