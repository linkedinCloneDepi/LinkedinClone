import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const FollowersPage = () => {
  const { user } = useAuthStore(); 
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    if (user?.connectedUsers) {
      console.log(user.connectedUsers);
      
      setFollowers(user.connectedUsers);
    }
  }, [user]);

  return (
    <div className="flex justify-center items-start min-h-screen bg-linkedinLightGray">
      <div className="bg-white rounded-lg shadow-md p-5 w-3/4 md:w-1/2 mt-24">
        <button
            type="button"
            onClick={() => navigate('/profile')}
            className="text-linkedinPrimary hover:underline text-sm flex items-center justify-center"
          >
            <MdKeyboardArrowLeft className="text-lg mt-1" />
            Back to your profile
          </button>
        <h1 className="text-2xl font-bold my-4">Followers</h1>

        {followers.length === 0 ? (
          <p className="text-linkedinDarkGray">No followers yet.</p>
        ) : (
          followers.map((follower, index) => (
            <div key={index} className="flex justify-between items-center my-4 border-b pb-2">
              <div className="flex items-center gap-3">
                <img
                  src={follower.profilePicture || "https://via.placeholder.com/40"} // Fallback image if no profile picture
                  alt={follower.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-linkedinDarkGray">{follower.username || "Anonymous User"}</h4>
                  <p className="text-sm text-linkedinGray">{follower.headline || "No headline provided"}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowersPage;
