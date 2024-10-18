import React from "react";
import Section from "./Section";
import Button from "./Button";
import addFriendIcon from "../../assets/images/item-icon.svg";
function UserInfo() {
  return (
    <>
      <div className="flex gap-3 py-3">
        <img
          src="https://picsum.photos/1000/1000"
          alt=""
          className="h-[80px] w-[80px] rounded-full  cursor-pointer"
        />
        <div className="">
          <p className="font-bold cursor-pointer  hover:text-linkedinBlue hover:underline">
            Yousef Emad
          </p>
          <p className="text-linkedinGray">Student at Ain shams University</p>
          <Button
            label={"Connect"}
            icon={<img src={addFriendIcon} />}
            onClick={() => {}}
            styleType="outline"
          />
        </div>
      </div>
      {/* don't add it when only one item or the last one  */}
      <hr />
    </>
  );
}
function RecommendCard() {
  return (
    <Section className="w-[100%]">
      <UserInfo />
      <UserInfo />
      <UserInfo />
    </Section>
  );
}

export default RecommendCard;
