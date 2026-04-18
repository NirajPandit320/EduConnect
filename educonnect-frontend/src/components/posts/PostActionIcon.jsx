import { memo } from "react";
import {
  FiCamera,
  FiEdit2,
  FiEyeOff,
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiTrash2,
} from "react-icons/fi";

const ICON_MAP = {
  image: FiCamera,
  hide: FiEyeOff,
  edit: FiEdit2,
  delete: FiTrash2,
  like: FiHeart,
  comment: FiMessageCircle,
  post: FiSend,
};

const PostActionIcon = ({ name, className = "", active = false }) => {
  const Icon = ICON_MAP[name];

  if (!Icon) return null;

  return (
    <Icon
      className={`post-action-icon ${active ? "is-active" : ""} ${className}`.trim()}
      aria-hidden="true"
      size={18}
      strokeWidth={2}
    />
  );
};

export default memo(PostActionIcon);
