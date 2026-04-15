import { memo } from "react";
import { ReactComponent as CameraIcon } from "eva-icons/outline/svg/camera-outline.svg";
import { ReactComponent as EditIcon } from "eva-icons/outline/svg/edit-2-outline.svg";
import { ReactComponent as EyeOffIcon } from "eva-icons/outline/svg/eye-off-outline.svg";
import { ReactComponent as HeartIcon } from "eva-icons/outline/svg/heart-outline.svg";
import { ReactComponent as MessageCircleIcon } from "eva-icons/outline/svg/message-circle-outline.svg";
import { ReactComponent as PaperPlaneIcon } from "eva-icons/outline/svg/paper-plane-outline.svg";
import { ReactComponent as TrashIcon } from "eva-icons/outline/svg/trash-2-outline.svg";

const ICON_MAP = {
  image: CameraIcon,
  hide: EyeOffIcon,
  edit: EditIcon,
  delete: TrashIcon,
  like: HeartIcon,
  comment: MessageCircleIcon,
  post: PaperPlaneIcon,
};

const PostActionIcon = ({ name, className = "", active = false }) => {
  const Icon = ICON_MAP[name];

  if (!Icon) return null;

  return (
    <span
      className={`post-eva-icon ${active ? "is-active" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      <Icon className="post-eva-icon-svg" focusable="false" />
    </span>
  );
};

export default memo(PostActionIcon);
