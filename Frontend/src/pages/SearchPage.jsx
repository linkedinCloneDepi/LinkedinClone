import React, { useEffect, useState } from "react";
import Section from "../components/common/Section";
import Button from "../components/common/Button";
import { TiDelete } from "react-icons/ti";
import { IoPersonAdd, IoHourglassOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import axios from "axios";
import userIcon from "../assets/images/nav/user.svg";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const location = useLocation();
  const searchTerm = location.state?.searchTerm || "";
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const page = 1;
      const limit = 10;
      try {
        const response = await axios.get(`http://localhost:5000/api/users`, {
          params: {
            search: searchTerm
          },
        });

        const { users } = response.data;
        

        setSuggestedUsers(users);
        const initialStatus = users.reduce((acc, user) => {
          
          acc[user._id] = user.connectionStatus;
          return acc;
        }, {});
        setConnectionStatus(initialStatus);
      } catch (error) {
        console.error("Error fetching search results", error);
      }
    };
    fetchData();
  }, [searchTerm]);

  const sendConnectionRequest = async (userId) => {
    try {
      const currentStatus = connectionStatus[userId];
      

      if (currentStatus === "connect") {
        // Send a connection request
        const response = await axios.post(
          "http://localhost:5000/api/connections",
          {
            receiverId: userId,
          }
        );
        
        

        // Update the connection status to "pending"
        setConnectionStatus((prevStatus) => ({
          ...prevStatus,
          [userId]: "pending",
        }));
      } else if (currentStatus === "pending") {
        const response = await axios.post(
          "http://localhost:5000/api/connections/status",
          {
            userId,
            status: "rejected",
          }
        );

        
        setConnectionStatus((prevStatus) => ({
          ...prevStatus,
          [userId]: "connect",
        }));
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };

  return (
    <div className="pt-20 pb-4 bg-linkedinLightGray min-h-screen">
      <Section>
        <h1 className="underline">Search Results</h1>
        {searchTerm && <p>Showing results for: {searchTerm}</p>}
        {suggestedUsers &&
          suggestedUsers.map((user) => (
            <li key={user._id} className="flex  my-3 relative text-sm gap-3">
              <a>
                <img
                  src={user.profilePicture ? user.profilePicture : userIcon}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
              </a>
              <div className="flex items-center w-full gap-4">
                <div className="flex-grow">
                  <span className="font-semibold text-black">
                    <Link to={`/profile/${user._id}`}>
                      {user.firstName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username}
                    </Link>
                  </span>
                  <div className="text-gray-500">{user.headline}</div>
                </div>
                <Button
                  label={
                    connectionStatus[user._id] === "pending"
                      ? "Pending"
                      : "Connect"
                  }
                  icon={
                    connectionStatus[user._id] === "pending" ? (
                      <IoHourglassOutline />
                    ) : (
                      <IoPersonAdd />
                    )
                  }
                  styleType={
                    connectionStatus[user._id] === "pending"
                      ? "default"
                      : "outline"
                  }
                  className={`w-1/4 mx-auto my-5 py-1 ${
                    connectionStatus[user._id] === "accepted"
                      ? "hidden"
                      : "block"
                  }`}
                  onClick={() => sendConnectionRequest(user._id)} // Pass user._id here
                />
              </div>
            </li>
          ))}
      </Section>
    </div>
  );
};

export default SearchPage;
