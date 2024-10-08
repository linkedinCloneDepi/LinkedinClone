import React from "react";
import PostShortView from "../../../components/Post/PostShortView";
import Button from "../../../components/common/Button";
import editIcon from "../../../assets/images/comment-icon.svg";
import { Link } from "react-router-dom";
import Section from "../../../components/common/Section";
function ActivitySection() {
  return (
    <>
      <Section>
        {/* Section title and create new post button with edit button */}
        <div className="w-1/2">
          <div className="flex gap-2 justify-between">
            <div>
              <p className="font-bold text-xl">Activity</p>
              <p className="text-linkedinBlue cursor-pointer">1098 followers</p>
            </div>
            <div className="flex">
              <Button
                label={"Create a Post"}
                icon={""}
                onClick={() => console.log("Post button clicked")}
                styleType="outline"
              />
              <Button
                icon={<img src={editIcon} />}
                onClick={() => console.log("Post button clicked")}
                styleType="outline"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 py-1 pb-4">
          <Button
            label={"Post"}
            icon={""}
            onClick={() => console.log("Post button clicked")}
          />
          <Button
            label={"Comments"}
            icon={""}
            onClick={() => console.log("Post button clicked")}
          />
        </div>

        <div>
          <PostShortView />
          <PostShortView />
          <PostShortView />
        </div>
        <Link
          to="allActivity"
          className="flex justify-center hover:bg-linkedinLightGray border-t-2 py-3 cursor-pointer"
        >
          Show all Post
        </Link>
      </Section>
    </>
    // <div className="mx-auto w-[80%] cursor-default border-gray-100 rounded-lg shadow-sm border-2 my-3">

    // </div>
  );
}

export default ActivitySection;
