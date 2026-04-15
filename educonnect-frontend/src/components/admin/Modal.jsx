import "../../styles/admin.css";

const Modal = ({ isOpen, title, children, onClose, footer, size = "medium" }) => {
  if (!isOpen) return null;

  const modalStyle = {
    maxWidth: size === "small" ? "400px" : size === "large" ? "700px" : "500px",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
