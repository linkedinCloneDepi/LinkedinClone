import React from "react";
import Reacts from "./Reacts";
import { extractTimeDuration } from "../../utils/extractTime";
import { Link } from "react-router-dom";


function PostShortView({post}) {
  const description = post.content
  return (
    <>
      <div className="cursor-pointer">
        {/* auther and date */}
        <div>
          <p className="text-linkedinGray">
            {post.auther.firstName} {post.auther.lastName} posted this .{" "}
            {extractTimeDuration(post.createdAt)}
          </p>
        </div>
        {/* image - title - description */}
        <div className="py-1">
          <div className="flex gap-2">
            <img
              src={post.images[0]}
              alt={"image"}
              className="w-[90px] h-[70px] rounded-lg"
            />
            <p>
              {description.length > 210 ? (
                <>
                  {description.substring(0, 210) + "..."}
                  <br />
                  <div className="flex justify-end">
                    <p>...</p>
                    <Link to={`/posts/${post._id}`}>
                    <p className="hover:text-linkedinBlue">show more</p>
                    </Link>
                  </div>
                </>
              ) : (
                description
              )}
            </p>
          </div>
        </div>
        {/* likes - comments ''buttons'' */}
        <div className="py-3">
          <Reacts post={post}/>
        </div>
        {/*want to check not to add it in 2 cases 1->only one post 2->with last post*/}
        <hr className="py-1" />
      </div>
    </>
  );
}

export default PostShortView;
