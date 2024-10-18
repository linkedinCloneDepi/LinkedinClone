import React, { useEffect, useState } from "react";
import Section from "../../../components/common/Section";
import Button from "../../../components/common/Button";
import EditIcon from "../../../components/Icons/editIcon";
import LargeText from "../../../components/common/LargeText";
import { useAuthStore } from "../../../store/authStore";
import { useViewProfile } from "../../../store/useViewProfile";

function AboutSection({ isOwnProfile }) {
  const { user, updateProfile } = useAuthStore();
  const { viewedUser } = useViewProfile();
  const [about, setAbout] = useState(""); 
  const [tempAbout, setTempAbout] = useState(""); 
  const [btnClick, setBtnClick] = useState(false); // Track edit state
  const [isLoading, setIsLoading] = useState(false); // Track save status

  useEffect(() => {
    if (isOwnProfile && user) {
      setAbout(user.about || ""); 
      setTempAbout(user.about || "");
    } else if (viewedUser) {
      setAbout(viewedUser.about || "");
      setTempAbout(viewedUser.about || "");
    }
  }, [user, viewedUser, isOwnProfile]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      
      await updateProfile({ about: tempAbout });
      setAbout(tempAbout); // Reflect changes locally
      setBtnClick(false); // Exit edit mode
    } catch (error) {
      console.error("Error updating about section:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section>
      <div className="relative py-4">
        {/* Edit Button (only if it's the user's own profile) */}
        {isOwnProfile && !btnClick && about && (
          <div className="absolute right-0 top-0">
            <Button
              className="border-none"
              icon={<EditIcon fill="white" />}
              onClick={() => setBtnClick(true)}
            />
          </div>
        )}

        <p className="font-bold text-2xl pb-2">About</p>

        {/* Display About Text or Add Button */}
        {!about && !btnClick && isOwnProfile ? (
          <Button
            label={"Add Brief about yourself"}
            onClick={() => setBtnClick(true)}
          />
        ) : about ? (
          about.length > 100 ? (
            <LargeText description={about} style="" />
          ) : (
            <p className="text-gray-500">{about}</p>
          )
        ) : (
          <p className=" text-gray-500">No About Added Yet</p> // Fallback text
        )}

        {/* Input Field for Editing */}
        {btnClick && (
          <div className="flex gap-3 py-3">
            <input
              type="text"
              value={tempAbout}
              className="border-2 rounded-lg w-full px-3"
              onChange={(event) => setTempAbout(event.target.value)}
            />
            <Button
              label={isLoading ? "Saving..." : "Save"}
              onClick={handleSave}
              disabled={isLoading}
            />
          </div>
        )}
      </div>
    </Section>
  );
}

export default AboutSection;
