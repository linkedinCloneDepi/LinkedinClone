import React, { useEffect, useState } from "react";
import Button from "../../../components/common/Button";
import axios from "axios";
import { useAuthStore } from "../../../store/authStore.js";
import { Link } from "react-router-dom";
const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const loggeduser = user;
  

  //Hooks

  //requested users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users`);
        const { users } = response.data;
        
        const filteredUsers = users.filter((user) => {
          
          
          return user.connections.some(
            (connection) =>
              connection.receiverId === loggeduser._id &&
              connection.status === "pending"
          );
        });
        
        setInvitations(filteredUsers);
      } catch (error) {
        console.error("Error fetching search results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggeduser]);

  if (loading) {
    return <div>Loading...</div>;
  }
  // Handle Ignore button
  const handleIgnore = async (id) => {
    try {
      await axios.post("http://localhost:5000/api/connections/status", {
        userId: id,
        status: "rejected",
      });

      setInvitations(invitations.filter((invite) => invite._id !== id));

      
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  // Handle Accept button
  const handleAccept = async (id) => {
    try {
      await axios.post("http://localhost:5000/api/connections/status", {
        userId: id,
        status: "accepted",
      });

      setInvitations(invitations.filter((invite) => invite._id !== id));
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg md:mt-4 p-5">
      <p className="text-linkedinDarkGray font-semibold mb-2">Invitations</p>
      <hr />
      {invitations.length === 0 ? (
        <p className="text-linkedinDarkGray mt-2">No pending invitations</p>
      ) : (
        invitations.map((invite) => (
          <div
            key={invite._id}
            className="flex justify-between items-center my-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  invite.profilePicture
                    ? invite.profilePicture
                    : "src/assets/images/user.svg"
                }
                alt={invite.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="font-semibold text-linkedinDarkGray">
                  <Link to={`/profile/${invite._id}`}>
                  {invite.firstName
                    ? `${invite.firstName} ${invite.lastName}`
                    : invite.username}
                  </Link>
                  
                </h4>
                <p className="text-sm text-linkedinGray">{invite.headline}</p>
                {/* <p className="text-xs text-linkedinGray">
                  Connected with {invite.connections}
                </p> */}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleIgnore(invite._id)}
                className=" text-linkedinDarkGray"
              >
                Ignore
              </button>
              <Button
                label="Accept"
                styleType="outline"
                onClick={() => handleAccept(invite._id)}
                className=" w-3/4 mx-auto my-5 py-0.5 "
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Invitations;
