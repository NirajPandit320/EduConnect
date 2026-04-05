const MessageBubble = ({ msg, isOwn }) => {
  return (
    <div className={`bubble ${isOwn ? "own" : ""}`}>

      {/* TEXT */}
      {msg.type === "text" && <p>{msg.text}</p>}

      {/* IMAGE SUPPORT */}
      {msg.type === "image" && (
        <img src={msg.fileUrl} alt="chat" width="150" />
      )}

      <span>
        {msg.createdAt?.seconds
          ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString()
          : ""}
      </span>

      {/* SEEN STATUS */}
      {isOwn && <span>{msg.seen ? "✔✔" : "✔"}</span>}

    </div>
  );
};

export default MessageBubble;