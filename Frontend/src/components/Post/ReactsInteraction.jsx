import React, { useEffect, useState } from "react";
import Button from "../common/Button";
import shareIcon from "../../assets/images/share-icon.svg";
import likeIcon from "../../assets/images/like-icon.svg";
import { useAuthStore } from "../../store/authStore";
import axios from "axios";
import { addLike, deleteLike, sharePost } from "../../utils/postApi";
import LikeIcon from "../Icons/LikeIcon";
import Swal from "sweetalert2";
import { BiLike, BiSolidLike } from "react-icons/bi";

const handelCommentClicked = (post) => {};

function ReactsInteraction({ post, setPost }) {
  const { user } = useAuthStore();

  const checkLike = () => {
    return post.likes.includes(user._id);
  };
  const [isLike, setIsLike] = useState(checkLike());

  // Check if the user has already liked the post
  useEffect(() => {
    setIsLike(checkLike());
  }, [post]);

  const handelShareClicked = (post) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want be share this post!",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Share it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sharePost(post.auther, post._id);
        setPost((prevPost) => ({
          ...prevPost,
          shares: [...prevPost.shares, user._id],
        }))
          .then(() => {
            // Update your state or handle UI changes after deletion
            setCommentAdded((prev) => prev - 1); // If you need to refresh comments

            Swal.fire("Deleted!", "Your post has been deleted.", "success");
          })
          .catch((error) => {
            Swal.fire(
              "Error!",
              "There was an issue deleting your post.",
              "error"
            );
            console.error("Error deleting post:", error);
          });
      }
    });
  };
  // Like handler
  const handleLikeClick = () => {
    if (!isLike) {
      addLike(post._id, "post");
      setIsLike(true);
      setPost((prevPost) => ({
        ...prevPost,
        likes: [...prevPost.likes, user._id],
      }));
      // setChange("add like");
    } else {
      deleteLike(post._id, "post");
      setIsLike(false);
      setPost((prevPost) => ({
        ...prevPost,
        likes: prevPost.likes.filter((id) => id !== user._id), // remove like
      }));
      // setChange("delete like");
    }
  };

  return (
    <div className="flex justify-around py-4 flex-wrap">
      {/* Like */}
      <Button
        label={isLike ? "Liked" : "Like"}
        className={isLike ? "text-linkedinBlue border-linkedinSecondBlue" : ""}
        icon={
          !isLike ? (
            <BiLike className="text-2xl " />
          ) : (
            <BiSolidLike className="text-2xl text-linkedinBlue" />
          )
          // <LikeIcon fill={"black"} />
        }
        onClick={handleLikeClick}
        // styleType="outline"
      />
      {/* Comment */}
      {/* <Button
        label={"Comment"}
        icon={<img src={commentIcon} alt="comment" />}
        onClick={() => {}}
        styleType="outline"
      /> */}
      {/* Repost */}
      <Button
        label={"Share"}
        icon={<img src={shareIcon} alt="repost" />}
        onClick={() => handelShareClicked(post)}
        styleType="outline"
      />
      {/* Send */}
      {/* <Button
        label={"Send"}
        icon={<img src={commentIcon} alt="send" />}
        onClick={() => {}}
        styleType="outline"
      /> */}
    </div>
  );
}

export default ReactsInteraction;
