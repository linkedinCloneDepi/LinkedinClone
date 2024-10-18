import React, { useEffect, useRef, useState } from "react";
import Section from "../common/section";
import Reacts from "./Reacts";
import ReactsInteraction from "./ReactsInteraction";
import AddComment from "./AddComment";
import PostUserInfo from "./PostUserInfo";
import Comment from "./Comment";
import LargeText from "../common/LargeText";
import deleteIcon from "../../assets/images/delete.svg";

import axios from "axios";
import {
  deletePost,
  deleteShare,
  getPostByID,
  getPostComments,
} from "../../utils/postApi";
import { useAuthStore } from "../../store/authStore";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
function PostDetails() {
  const [post, setPost] = useState();
  let description = "";
  const { user } = useAuthStore();
  const [commentAdded,setCommentAdded] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loading, setLoading] = useState(false);
  const componentRef = useRef(null);
  const loaderRef = useRef(null);
  const limit = 3;
  const loadMoreComments = async () => {
    if (hasMoreComments) {
      const newPage = page + 1;
      const response = await getPostComments(
        setComments,
        newPage,
        limit,
        comments,
        post._id,
        setLoading
      );
      if (response.length === 0) {
        

        setHasMoreComments(false); // No more comments
      } else {
        setPage(newPage);
      }
    }
  };
  const { id } = useParams();
  useEffect(() => {
    if (post)
      getPostComments(setComments, 1, limit, comments, post._id, setLoading);
  }, [post]);
  // Function to open the PostFocus component when the image is clicked
  const handleImageClick = () => {
    setIsVisible(true);
    document.body.style.overflow = "hidden";
  };

  // Close PostFocus when clicking outside of it
  const handleClickOutside = (event) => {
    if (componentRef.current && !componentRef.current.contains(event.target)) {
      setIsVisible(false);
      document.body.style.overflow = "";
    }
  };
  const handleDeletePost = () => {
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
        if (checkIsShare()) {
          deleteShare(post._id, setPost);
        } else {
          deletePost(post._id, setPost);
        }
        setPost((prevPosts) => prevPosts.filter((p) => p._id !== post._id))
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

  // Add event listener to detect clicks outside the component
  useEffect(() => {
    getPostByID(id, setPost, setLoading);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const checkIsShare = () => {
    return post.shares.includes(user._id);
  };
  //   description = post.content? post.content: ""

  return (
    <Section className="mt-[80px]">
      {loading && (
        <div className="flex justify-center">
          <span className="loading loading-spinner mx-auto text"></span>
        </div>
      )}
      {post && (
        <div className="bg-gray-100 p-3 rounded my-2 relative">
          {user._id === post.auther._id || checkIsShare() ? (
            <button
              className="absolute right-0 top-0 m-2 hover:bg-red-500 p-3 rounded-full duration-300"
              onClick={handleDeletePost}
            >
              <img src={deleteIcon} alt="deleteIcon" />
            </button>
          ) : (
            <></>
          )}

          {/* title with profile picture */}
          <div className="flex gap-2 justify-between items-start pb-3 ">
            <PostUserInfo post={post} />
            <div>{/* more icon */}</div>
          </div>
          {/* Description */}
          <div>
            <LargeText
              description={post.content}
              style="text-linkedinDarkGray"
            />
          </div>
          {/* Photos -videos */}
          {/* todo make it slider ! */}
          <div
            className="relative group cursor-pointer w-full object-cover flex justify-center"
            onClick={handleImageClick}
          >
            {post.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="rounded-xl my-3 object-cover"
              />
            ))}
            <div className="absolute bottom-5 right-5 bg-[rgba(255,255,255,0.6)] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-black">
              {post.images.length}
            </div>
          </div>

          {/* Reacts */}
          <Reacts post={post} />
          <hr />
          <ReactsInteraction post={post} setPost={setPost} />
          {loading && (
            <div className="flex justify-center">
              <span className="loading loading-spinner mx-auto text"></span>
            </div>
          )}
          {isVisible && (
            <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-[500]">
              <PostFocus
                componentRef={componentRef}
                post={post}
                setPost={setPost}
                comments={comments}
                commentAdded={commentAdded}
                setCommentAdded={setCommentAdded}
                setComments={setComments}
                loaderRef={loaderRef}
                loadMoreComments={loadMoreComments}
                hasMoreComments={hasMoreComments}
              />
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

const PostFocus = ({
  componentRef,
  post,
  setPost,
  comments,
  commentAdded,
  setCommentAdded,
  setComments,
  loadMoreComments,
  loaderRef,
  hasMoreComments,
}) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreComments(); // Load more comments when the loader is visible
      }
    });
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [comments, hasMoreComments]);
  const [showMore, setShowMore] = useState(false);
  const description = post.content;
  return post ? (
    <div
      className="bg-white rounded-xl shadow-lg max-w-[100%] h-[80%] grid grid-rows-2 xl:grid-rows-1 xl:grid-cols-6 2xl:w-[80%] "
      ref={componentRef}
    >
      {/* Left Column (Image - 75%) */}
      <div className="row-start-2 xl:row-start-1 col-span-4 bg-black flex items-center justify-center relative rounded-l-xl">
        {/* todo make a slider */}
        <img
          src={post.images[0]}
          alt="Post Image"
          className="max-w-full max-h-full m-auto absolute"
        />
      </div>
      {/* Right Column (Extra Info - 25%) */}
      <div className="row-start-1 xl:row-start-1 col-span-2 bg-gray-100 p-4 pt-0 overflow-auto  flex-col flex-nowrap rounded-r-xl">
        {/* header */}
        <div className="sticky top-0 bg-gray-100 py-2 z-10 w-full">
          {/* Changed from fixed to sticky */}
          <PostUserInfo post={post} />
        </div>
        <div className="text-black">
          {/* description */}
          {description.length > 400 ? (
            <div className="my-5">
              {showMore ? (
                <p>
                  {description}
                  <span
                    className="text-linkedinGray hover:text-linkedinBlue cursor-pointer ml-3"
                    onClick={() => setShowMore(false)}
                  >
                    less
                  </span>
                </p>
              ) : (
                <p>
                  {description.substring(0, description.length / 4)}
                  <span
                    className="text-linkedinGray hover:text-linkedinBlue cursor-pointer ml-3"
                    onClick={() => setShowMore(true)}
                  >
                    ...more
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="my-5">{description}</p>
          )}

          <div className="mt-5">
            <Reacts post={post} />
          </div>
          <ReactsInteraction post={post} setPost={setPost} />
          <AddComment
            post={post}
            setPost={setPost}
            setCommentAdded={setCommentAdded}
            commentAdded={commentAdded}
          />
          {comments ? (
            comments.map((comment, index) => (
              <Comment comment={comment} setPost={setPost} />
            ))
          ) : (
            <>No Comments</>
          )}
          <div ref={loaderRef} className="h-10"></div>
          {!hasMoreComments && <p>No more comments to load</p>}
        </div>
      </div>
    </div>
  ) : (
    <>loading</>
  );
};

export default PostDetails;
