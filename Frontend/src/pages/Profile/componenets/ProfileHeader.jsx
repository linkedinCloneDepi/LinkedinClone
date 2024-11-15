import React, { useEffect, useState } from "react";
import "../../../assets/style/profile.css";
import Button from "../../../components/common/Button";
import { useAuthStore } from "../../../store/authStore";
import EditIcon from "../../../components/Icons/editIcon";
import ExperienceIcon from "../../../assets/images/ExperienceIcon.svg";
import EducationIcon from "../../../assets/images/EducationIcon.svg";
import defaultImage from "../../../assets/images/user.svg";
import defaultBG from "../../../assets/images/card-bg.svg";
import { useViewProfile } from "../../../store/useViewProfile";
import Section from "../../../components/common/Section";
import { IoPersonAdd, IoHourglassOutline } from "react-icons/io5";
import axios from "axios";
const ProfileHeader = ({ isOwnProfile }) => {
  const { user, updateProfile } = useAuthStore();
  const { viewedUser } = useViewProfile();
  const [profileData, setProfileData] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [headline, setHeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(defaultImage);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(defaultBG);
  const [newBackgroundImage, setNewBackgroundImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState();
  const [firstExperience, setFirstExperience] = useState({});
  const [firstEducation, setFirstEducation] = useState({});

  useEffect(() => {
    const data = isOwnProfile ? user : viewedUser;
    if (viewedUser) {
      let statusUpdated = false;
      viewedUser.connections.forEach((connection) => {
        if (
          connection.receiverId === user._id ||
          connection.senderId === user._id
        ) {
          setConnectionStatus(connection.status);
          statusUpdated = true;
        }
      });
      if (!statusUpdated) {
        setConnectionStatus("connect");
      }
    }
    if (data) {
      setProfileData(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setHeadline(data.headline);
      setProfileImage(data.profilePicture || defaultImage);
      setBackgroundImage(data.bannerImg || defaultBG);
      setFirstEducation(data.education?.slice(-1)[0] || {});
      setFirstExperience(data.experience?.slice(-1)[0] || {});
    }
  }, [user, viewedUser, isOwnProfile]);

    useEffect(() => {
      setFirstExperience(profileData.experience?.slice(-1)[0] || {});
      setFirstEducation(profileData.education?.slice(-1)[0] || {});
    }, [profileData.experience, profileData.education]);

  // const firstEducation = profileData.education?.slice(-1)[0] || {};
  // const firstExperience = profileData.experience?.slice(-1)[0] || {};

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        headline,
        profilePicture: newProfileImage || profileImage,
        backgroundImage: newBackgroundImage || backgroundImage,
        bannerImg: newBackgroundImage || backgroundImage,
      });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setNewProfileImage(reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBackgroundImage(reader.result);
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const sendConnectionRequest = async () => {
    try {
      const status = connectionStatus;
      if (status == "connect") {
        // Send a connection request
        const response = await axios.post(
          "http://localhost:5000/api/connections",
          {
            receiverId: viewedUser._id,
          }
        );

        setConnectionStatus("pending");
      } else if (status === "pending") {
        const response = await axios.post(
          "http://localhost:5000/api/connections/status",
          {
            userId: viewedUser._id,
            status: "rejected",
          }
        );
        setConnectionStatus("connect");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };
  return (
    <Section>
      <div className="hero">
        <div className="hero-banner cursor-pointer">
          <img
            src={backgroundImage}
            alt="Background"
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="hero-avatar cursor-pointer flex sm:justify-center sm:align-middle">
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div className="flex items-center justify-between m-auto p-3">
        <div className="intro">
          {!showEditModal && (
            <div>
              <span className="intro-name">
                {profileData.firstName} {profileData.lastName}
              </span>
              <span>
                {" ("}
                {profileData.username}
                {")"}
              </span>
              <div className="intro-desc">
                <p>{profileData.headline}</p>
              </div>
              {!isOwnProfile && (
                <Button
                  label={connectionStatus === "pending" ? "pending" : "connect"}
                  icon={
                    connectionStatus === "pending" ? (
                      <IoHourglassOutline />
                    ) : (
                      <IoPersonAdd />
                    )
                  }
                  styleType={
                    connectionStatus === "pending" ? "default" : "outline"
                  }
                  className={`${
                    connectionStatus === "accepted" ? "hidden" : "block"
                  }`}
                  onClick={() => sendConnectionRequest()}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-5 flex-col relative py-8 px-4">
          {isOwnProfile && (
            <div className="absolute right-0 top-0 cursor-pointer">
              <Button
                className="border-none"
                icon={<EditIcon fill="white" />}
                onClick={() => setShowEditModal(true)}
              />
            </div>
          )}
          <div className="flex gap-2 mt-6 cursor-pointer text-center justify-center">
            <img src={ExperienceIcon} alt="ExperienceIcon" className="w-8" />
            <p className="text-sm text-linkedinGray">
              {firstExperience.title
                ? firstExperience.title
                : "No Experience added"}
            </p>
          </div>
          <div className="flex gap-2 cursor-pointer text-center justify-center">
            <img src={EducationIcon} alt="EducationIcon" className="w-8" />
            <p className="text-sm text-linkedinGray mt-2">
              {firstEducation.school
                ? firstEducation.school
                : "No Education added"}
            </p>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className="flex flex-col md:flex-row gap-2 w-full ">
          <Button
            label="Open to"
            styleType="primary"
            className="font-bold w-full md:w-1/6"
          />
          <Button
            label="Add Profile section"
            styleType="default"
            className="w-full text-linkedinBlue font-bold md:w-2/6 "
          />
          <Button
            label="More"
            styleType="default"
            className="font-bold w-full md:w-1/6"
            onClick={() => setShowEditModal(true)}
          />
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-10">
          <div className="bg-white px-6 rounded-lg shadow-lg w-1/2 h-3/4 overflow-y-auto">
            <div className="sticky top-0 py-4 bg-white z-10 flex justify-between">
              <h2 className="text-lg font-semibold text-linkedinDarkGray">
                Edit Profile
              </h2>
              <button
                className="text-3xl text-linkedinGray"
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col mb-4">
              <label className="text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border-2 rounded-lg p-2 mb-2 text-linkedinDarkGray text-sm"
                placeholder="First Name"
              />
              <label className="text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border-2 rounded-lg p-2 mb-2 text-linkedinDarkGray text-sm"
                placeholder="Last Name"
              />
              <label className="text-sm font-medium mb-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Edit your headline"
                className="border-2 rounded-lg p-2 mb-2 text-linkedinDarkGray text-sm"
              />
            </div>

            <div className="flex flex-col mb-4">
              <h3>Edit Profile Picture</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2"
              />
              <img
                src={profileImage}
                alt="Profile Preview"
                className="w-20 h-20 mt-2"
              />
            </div>

            <div className="flex flex-col mb-4">
              <h3>Edit Background Picture</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundChange}
                className="mt-2"
              />
              <img
                src={backgroundImage}
                alt="Background Preview"
                className="w-20 h-20 mt-2"
              />
            </div>

            <div className="flex justify-end space-x-4 mb-4">
              <Button label="Cancel" onClick={() => setShowEditModal(false)} />
              <Button
                label={isLoading ? "Saving..." : "Save"}
                onClick={handleSave}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default ProfileHeader;
