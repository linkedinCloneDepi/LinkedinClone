import React, { useEffect, useRef, useState } from "react";
import PostFullView from "./Post/PostFullView";
import PostModal from "./Post/PostModal";
import { getFeedPosts } from "../utils/postApi";
// import CircularProgress from "@mui/material/CircularProgress";

const Main = () => {
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const componentRef = useRef(null);
  const loaderRef = useRef(null);
  const limit = 3;
  const loadMoreComments = async () => {
    if (hasMoreComments) {
      const newPage = page + 1;
      const response = await getFeedPosts(
        setPosts,
        newPage,
        limit,
        posts,
        setLoading
      );
      if (response.length === 0) {
        

        setHasMoreComments(false); // No more comments
      } else {
        setPage(newPage);
      }
    }
  };

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
  }, [posts, hasMoreComments]);
  useEffect(() => {

    getFeedPosts(setPosts, 1, limit, posts, setLoading);
  }, []);

  const handleClick = () => setShowModal(!showModal);

  const handleAddPost = (post) => {
    // setPosts([post, ...posts]);
    setShowModal(false);
  };

  const handlePostClick = (post) => {
    if (post) {
      setSelectedPost(post);
    }
  };

  return (
    <div className="w-[100%] xl:w-[50%] text-left">
      <PostModal
        showModal={showModal}
        handleClick={handleClick}
        handleAddPost={handleAddPost}
      />
      {selectedPost && <PostFullView post={selectedPost} setPosts={setPosts} />}

      <div className="post-list ">
        {posts.map((post, index) => (
          <div
            key={index}
            className="post-item"
            onClick={() => handlePostClick(post)}
          >
            <p>{post.description}</p>
            {post.image && <img src={post.image} alt="Post Thumbnail" />}
            {post.video && <video src={post.video} controls />}
            {/* Render comments or other post details */}
            {/* Adjust this part based on how you store and want to display comments */}
            {post.comments &&
              post.comments.map((comment, idx) => (
                <div key={idx} className="post-comment">
                  <p>{comment.text}</p>
                </div>
              ))}
          </div>
        ))}
        {posts ? (
          posts.length > 0 ? (
            posts.map((post) => (
              <PostFullView
                parentPost={post}
                key={post._id}
                setPosts={setPosts}
              />
            ))
          ) : (
            <></>
            // <CircularProgress />
          )
        ) : (
          <></>
          // <CircularProgress />
        )}
        <div ref={loaderRef} className="h-10"></div>
        {!hasMoreComments && <p>No more comments to load</p>}
        {loading && (
          <div className="flex justify-center">
            <span className="loading loading-spinner mx-auto text"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
