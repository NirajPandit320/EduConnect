import Modal from "./Modal";
import "../../styles/admin.css";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmLabel = "Confirm",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      size="small"
      footer={
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      }
    >
      <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.5" }}>
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmModal;
