import React, { useEffect, useState } from "react";
import { TiDelete } from "react-icons/ti";
import { IoPersonAdd, IoHourglassOutline } from "react-icons/io5";
import Button from "../../../components/common/Button";
import axios from "axios";
import { Link } from "react-router-dom";

const ProfileCard = ({ profile, handleIgnore }) => {
  const [isPending, setIsPending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        if (profile.connectionStatus === "connect") {
          setConnectionStatus({ [profile._id]: "connect" });
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const sendConnectionRequest = async () => {
    try {
      const currentStatus = connectionStatus[profile._id];

      if (currentStatus === "connect") {
        // Send a connection request
        const response = await axios.post(
          "http://localhost:5000/api/connections",
          {
            receiverId: profile._id,
          }
        );

        // Update the connection status to "pending"
        setConnectionStatus((prevStatus) => ({
          ...prevStatus,
          [profile._id]: "pending",
        }));
      } else if (currentStatus === "pending") {
        const response = await axios.post(
          "http://localhost:5000/api/connections/status",
          {
            userId: profile._id,
            status: "rejected",
          }
        );

        setConnectionStatus((prevStatus) => ({
          ...prevStatus,
          [profile._id]: "connect",
        }));
      }
      setIsPending(!isPending);
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };
  return (
    <div className="border rounded-lg shadow-md">
      <div className="relative">
        <img
          src={
            profile.bannerImg
              ? profile.bannerImg
              : "src/assets/images/card-bg.svg"
          }
          alt="user photo"
          className="rounded w-full h-28 object-cover"
        />
        <img
          src={
            profile.profilePicture
              ? profile.profilePicture
              : "src/assets/images/user.svg"
          }
          alt="user photo"
          className="w-20 rounded-full -mt-10 ms-5"
        />
        <button
          className="absolute top-2 right-2 rounded-full text-3xl text-linkedinDarkGray hover:shadow-2xl"
          onClick={() => handleIgnore(profile._id)}
        >
          <TiDelete />
        </button>
      </div>
      <Link to={`/profile/${profile._id}`}>
        <h3 className="text-lg font-semibold px-4 mt-4 text-linkedinDarkGray text-center">
          {profile.firstName
            ? `${profile.firstName} ${profile.lastName}`
            : profile.username}
        </h3>
      </Link>

      <p className="text-sm text-linkedinGray px-4 text-center">
        {profile.headline}
      </p>
      <Button
        label={isPending ? "Pending" : "Connect"}
        icon={isPending ? <IoHourglassOutline /> : <IoPersonAdd />}
        styleType={isPending ? "default" : "outline"}
        className="w-3/4 mx-auto my-5 py-1"
        onClick={sendConnectionRequest}
      />
    </div>
  );
};

export default ProfileCard;
