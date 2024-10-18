import styled from "styled-components";
import axios from "axios";
import userIcon from "../assets/images/nav/user.svg";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./common/Button";
import { TiDelete } from "react-icons/ti";
import { IoPersonAdd, IoHourglassOutline } from "react-icons/io5";
const Rightside = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});

  useEffect(() => {
    // Fetch suggested users when the component mounts
    const fetchSuggestedUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/suggestions",
          {
            params: { page: 1, limit: 3 },
          }
        );
        setSuggestedUsers(response.data.suggestedUsers);
        const initialStatus = response.data.suggestedUsers.reduce(
          (acc, user) => {
            acc[user._id] = user.connectionStatus;
            return acc;
          },
          {}
        );
        setConnectionStatus(initialStatus);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    fetchSuggestedUsers();
  }, []);

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
    <Container>
      <FollowCard>
        <Title>
          <h2>Add to your feed</h2>
          <img src="src/assets/images/feed-icon.svg" alt="" />
        </Title>
        <div>
          {suggestedUsers.map((user) => (
            <li key={user._id} className="flex  my-3 relative text-sm gap-3">
              <a>
                <img
                  src={user.profilePicture ? user.profilePicture : userIcon}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
              </a>
              <div className="flex flex-col gap-0">
                <Link to={`/profile/${user._id}`}>
                  <span className="font-semibold text-black">
                    {user.username}
                  </span>
                </Link>
                
                <div className="text-gray-500">{user.headline}</div>
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
                  className={`my-5 py-1 ${
                    connectionStatus[user._id] === "accepted"
                      ? "hidden"
                      : "block"
                  }`}
                  onClick={() => sendConnectionRequest(user._id)} // Pass user._id here
                />
              </div>
            </li>
          ))}
        </div>

        <Link
          to="/networks"
          className="text-blue-600 flex items-center text-sm"
        >
          View all recommendations
          <img src="src/assets/images/right-icon.svg" alt="" />
        </Link>
      </FollowCard>
      <BannerCard>
        <img src="src/assets/images/banner-image.jpg" alt="" />
      </BannerCard>
    </Container>
  );
};

const Container = styled.div`
  width: 20%;
  @media (max-width: 1300px) {
    display: none;
  }
`;

const FollowCard = styled.div`
  text-align: center;
  overflow: hidden;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 5px;
  position: relative;
  border: none;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 0 0 rgb(0 0 0 / 20%);
  padding: 12px;
`;

const Title = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  width: 100%;
  color: rgba(0, 0, 0, 0.6);
`;

const FeedList = styled.ul`
  margin-top: 16px;
  li {
    display: flex;
    align-items: center;
    margin: 12px 0;
    position: relative;
    font-size: 14px;
    & > div {
      display: flex;
      flex-direction: column;
    }

    button {
      background-color: transparent;
      color: rgba(0, 0, 0, 0.6);
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.6);
      padding: 16px;
      align-items: center;
      border-radius: 15px;
      box-sizing: border-box;
      font-weight: 600;
      display: inline-flex;
      justify-content: center;
      max-height: 32px;
      max-width: 480px;
      text-align: center;
      outline: none;
    }
  }
`;

const Avatar = styled.div`
  background-image: url("src/assets/images/avatar.svg");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 48px;
  height: 48px;
  margin-right: 8px;
`;

const Recommendation = styled.a`
  color: #0a66c2;
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const BannerCard = styled(FollowCard)`
  img {
    width: 100%;
    height: 100%;
  }
`;
export default Rightside;
