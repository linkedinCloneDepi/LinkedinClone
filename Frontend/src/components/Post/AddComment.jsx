import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { addComment } from "../../utils/postApi";
import sendIcon from "../../assets/images/send-icon.svg";
import userIcon from "../../assets/images/user.svg";

function AddComment({ post, setPost, setCommentAdded, commentAdded }) {
  const { user } = useAuthStore();
  const [comment, setComment] = useState();
  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      const temp = commentAdded;
      const loadedComment = await addComment(post._id, comment);
      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, loadedComment._id], // add new comment
      }));
      setCommentAdded(temp + 1);
      setComment("");
    }
  };

  return (
    <div className="flex gap-1 w-full">
      <img
        src={user.profilePicture ? user.profilePicture : userIcon}
        alt="userPhoto"
        className="w-[60px] h-[60px] rounded-full"
      />
      <div className="relative flex items-center w-full">
        <input
          type="text"
          placeholder="Add a comment..."
          className="rounded-full border-2 w-full flex justify-between p-4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="absolute right-2 flex gap-3">
          <img
            src={sendIcon}
            alt="emojiIcon"
            className="mr-2"
            onClick={() => handleCommentSubmit()}
          />
          {/* <img src={addFriendIcon} alt="photoIcon" /> */}
        </div>
      </div>
    </div>
  );
}

export default AddComment;
