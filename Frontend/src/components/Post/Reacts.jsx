import React, { useEffect } from "react";
import likeIcon from "../../assets/images/like-icon.svg";
const handelCommentsClick = async () => {};
const handelLikesClick = async () => {};
function Reacts({ post }) {
  return post ? (
    <div className="flex justify-between">
      <div className="relative flex items-center">
        <div className="flex items-center ">
          <img
            src={likeIcon}
            alt=""
            className="w-[17px] h-[17px] bg-linkedinSecondBlue rounded-full p-[2px] border-[1px] mr-1"
          />
          {/* <img
            src={likeIcon}
            alt=""
            className="w-[17px] h-[17px] bg-red-500 rounded-full p-[2px] relative right-1 border-[1px]"
          />
          <img
            src={likeIcon}
            alt=""
            className="w-[17px] h-[17px] bg-green-600 rounded-full p-[2px] relative right-2 border-[1px]"
          /> */}
        </div>
        <p
          className="text-linkedinGray hover:text-linkedinBlue hover:underline cursor-pointer"
          onClick={handelLikesClick}
        >
          {post.likes.length}
        </p>
      </div>
      <div>
        <div className="flex gap-5">
          <p
            className="text-linkedinGray hover:text-linkedinBlue hover:underline cursor-pointer"
            onClick={handelCommentsClick}
          >
            {post.shares.length} shares
          </p>
          <p
            className="text-linkedinGray hover:text-linkedinBlue hover:underline cursor-pointer"
            onClick={handelCommentsClick}
          >
            {post.comments.length} comments
          </p>
        </div>
      </div>
    </div>
  ) : (
    <>loading</>
  );
}

export default Reacts;
