import React from "react";
import Section from "./Section";
import userIcon from "../../assets/images/user.svg";

function UserInfoCart({ user }) {
  
  
  return user ? (
    <Section className="w-[100%]">
      {/* user photos */}
      <div className="relative  mb-5 fixed">
        <img
          src={user.bannerImg ? user.bannerImg : userIcon}
          alt=""
          className="h-[100px] w-[100%] object-cover "
        />
        <img
          src={user.profilePicture ? user.profilePicture : userIcon}
          alt=""
          className="h-[80px] w-[80px] rounded-full absolute top-12 border-2 left-1/2 -translate-x-1/2 cursor-pointer"
        />
      </div>
      {/* user name and title*/}
      <div className="py-6 text-center">
        <p className="hover:underline hover:text-linkedinBlue  cursor-pointer">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-linkedinGray">{user.headline}</p>
      </div>
      <div className="border-t-2 w-full flex justify-between p-3">
        <p>Followers</p>
        <p className="text-linkedinBlue hover:underline cursor-pointer">
          {user.connectedUsers.length}
        </p>
      </div>
    </Section>
  ) : (
    <>loading</>
  );
}

export default UserInfoCart;
