import React, { useEffect, useRef, useState } from "react";
import deleteIcon from "../../../assets/images/delete.svg";
import { useNavigate } from "react-router-dom";
import userIcon from "../../../assets/images/nav/user.svg";
import Section from "../../../components/common/Section";
const GenericNotification = ({ key, notification, onDelete }) => {
  const navigate = useNavigate();

  const openNotification = () => {
    if (notification.type == "connectionRequest") {
      navigate(`/networks`);
    } else if (notification.type.includes("post")) {
      navigate(`/posts/${notification.relatedId?notification.relatedId._id:""}`);
    }
  };
  return (
    <div
      className="flex items-center hover:bg-linkedin-lighthover-gray w-full justify-between p-4 cursor-pointer border-b"
      onClick={openNotification}
    >
      <div className="flex">
        <div className="mr-3">
          {notification.relatedId && (
            <img
              src={
                notification.relatedId.auther.profilePicture
                  ? notification.relatedId.auther.profilePicture
                  : userIcon
              }
              alt="avatar"
              className="w-10 h-10 rounded-lg"
              key={notification._id}
            />
          )}
        </div>
        <div>
          <div className="text-gray-800">
            {notification.relatedId && (
              <span className="font-semibold">
                {`${notification.relatedId.auther.firstName} ${notification.relatedId.auther.lastName} `}
              </span>
            )}
            <span>{notification.message} </span>
            {notification.type.includes("post") && (
              <div className="mx-auto w-[100%] cursor-default border-linkedin-darkhover-gray bg-linkedin-lighthover-blue rounded-xl shadow-xs border-2 my-2 overflow-hidden">
                <div className="line-clamp-2 max-w-xs p-1 text-linkedinGray">
                  {notification.relatedId?notification.relatedId.content:""}
                </div>
              </div>
            )}
          </div>
          <div className="text-gray-500 text-sm">{notification.date}</div>
        </div>
      </div>

      <div
        className="relative hover:bg-linkedin-darkhover-gray rounded-full p-4"
        onClick={() => onDelete(notification._id)}
      >
        <img src={deleteIcon} alt="delete icon" className="h-5 w-5 icon" />
      </div>
    </div>
  );
};

export default GenericNotification;
