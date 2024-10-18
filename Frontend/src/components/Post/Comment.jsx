import React, { useState } from "react";
import editIcon from "../../assets/images/edit_icon.svg";
import sendIcon from "../../assets/images/send-icon.svg";
import deleteIcon from "../../assets/images/delete.svg";
import { deleteComment, editComment } from "../../utils/postApi";
import { useAuthStore } from "../../store/authStore";
import userIcon from "../../assets/images/user.svg";

import Swal from "sweetalert2";
function Comment({ comment, setPost }) {
  const { user } = useAuthStore();
  const [isEdit, setIsEdit] = useState(false);
  const [compComment, setCompComment] = useState(comment.content);
  const handelDeleteComment = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setPost((prevPost) => ({
          ...prevPost,
          comments: prevPost.comments.filter((id) => id !== comment._id),
        }));
        deleteComment(comment._id)
          .then(() => {
            // Update your state or handle UI changes after deletion
            Swal.fire("Deleted!", "Your comment has been deleted.", "success");
          })
          .catch((error) => {
            Swal.fire(
              "Error!",
              "There was an issue deleting your comment.",
              "error"
            );
            console.error("Error deleting comment:", error);
          });
      }
    });
  };
  const handelEditComment = async () => {
    if (!isEdit) await setIsEdit(true);
    if (isEdit) {
      await editComment(compComment, comment._id);
      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, comment._id],
      }));
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Edit is updated sucsessfully",
        showConfirmButton: false,
        timer: 1000,
      });
      setIsEdit(false);
    }
  };
  return (
    <div className="flex gap-2 py-4">
      <img
        src={
          comment.userId.profilePicture
            ? comment.userId.profilePicture
            : userIcon
        }
        alt=""
        className="w-[50px] h-[50px] rounded-full"
      />
      <div className="rounded-tl-none rounded-lg bg-[#fff] w-full px-3 py-2 ">
        <div className="cursor-pointer pb-2">
          <div className="flex gap-2 ">
            <p className="text-bold text-black hover:text-linkedinBlue hover:underline">
              {`${comment.userId.firstName} ${comment.userId.lastName}`}
            </p>
            <p className=" text-linkedinGray">&#x2022; 1st</p>
          </div>
          <p className="text-linkedinGray text-xs">{comment.userId.headline}</p>
        </div>

        <div className="flex justify-between">
          {isEdit ? (
            <input
              type="text"
              className="border-2 p-2 rounded-xl w-full mr-2"
              value={compComment}
              onChange={(e) => setCompComment(e.target.value)}
            />
          ) : (
            <p>{compComment}</p>
          )}
          {comment.userId._id === user._id ? (
            <div className="flex gap-1 m-0">
              <img
                src={!isEdit ? editIcon : sendIcon}
                alt="emojiIcon"
                className="max-w-[20px]"
                onClick={() => handelEditComment()}
              />
              <img
                src={deleteIcon}
                alt="deleteIcon"
                className="max-w-[20px]"
                onClick={() => handelDeleteComment()}
              />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;
