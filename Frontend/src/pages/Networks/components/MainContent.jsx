import React, { useEffect, useState } from "react";
import ProfileCard from "../components/ProfileCard";
import axios from "axios";

const MainContent = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);

  //suggesstion
  useEffect(() => {
    // Fetch suggested users when the component mounts
    const fetchSuggestedUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/suggestions",
          {
            params: { page: 1, limit: 10 },
          }
        );
        setSuggestedUsers(response.data.suggestedUsers);
        // const initialStatus = response.data.suggestedUsers.reduce(
        //   (acc, user) => {
        //     if (user.connectionStatus === "connect") {
        //       acc[user._id] = user.connectionStatus;
        //     }
        //     return acc;
        //   },
        //   {}
        // );
        // setConnectionStatus(initialStatus);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const handleIgnore = async (id) => {
    try {
      await axios.post("http://localhost:5000/api/connections/status", {
        userId: id,
        status: "rejected",
      });

      setProfiles(profiles.filter((profile) => profile.id !== id));
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg mt-4 p-5">
      <h2 className=" text-linkedinDarkGray">People you may know </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
        {suggestedUsers.map((profile, index) => (
          <ProfileCard
            key={index}
            profile={profile}
            handleIgnore={handleIgnore}
          />
        ))}
      </div>
    </div>
  );
};

export default MainContent;
