import React, { useEffect, useState } from "react";
import Section from "../../../components/common/Section";
import Button from "../../../components/common/Button";
import ExperienceIcon from "../../../assets/images/ExperienceIcon.svg";
import { IoMdClose } from "react-icons/io";
import { IoAddOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import { useAuthStore } from "../../../store/authStore";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import axios from "axios";
import { useViewProfile } from "../../../store/useViewProfile";

const ExperienceSection = ({isOwnProfile}) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(new Array(50), (val, index) => 2024 - index);

  const { user, updateProfile } = useAuthStore();
  const { viewedUser } = useViewProfile();
  const [deleteIndex, setDeleteIndex] = useState(null); // state for delete index
  const [confirmModalOpen, setConfirmModalOpen] = useState(false); // State for confirmation modal
  const [experience, setExperience] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    employmentType: "",
    company: "",
    location: "",
    locationType: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    currentlyWorking: false,
    description: "",
  });

  useEffect(() => {
    if (isOwnProfile && user) {
      setExperience(user.experience || []);
    } else if (viewedUser) {
      setExperience(viewedUser.experience || []);
    }
  }, [user,viewedUser, isOwnProfile]);

  // handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, currentlyWorking: e.target.checked });
  };

  //edit
  const handleEdit = (index) => {
    setFormData(experience[index]);
    setEditingIndex(index);
    setShowModal(true);
  };

  //submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      // update
      const updatedExperiences = [...experience];
      updatedExperiences[editingIndex] = formData;
      await updateProfile({ experience: updatedExperiences });
      setExperience(updatedExperiences);
    } else {
      // add new
      const response = await axios.post(
        "http://localhost:5000/api/users/experience",
        formData
      );
      
      setExperience([
        ...experience,
        response.data.experience[response.data.experience.length - 1],
      ]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      employmentType: "",
      company: "",
      location: "",
      locationType: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      currentlyWorking: false,
      description: "",
    });
    setEditingIndex(null);
    setShowModal(false);
  };

  const handleDelete = async (index) => {
    setDeleteIndex(index);
    setConfirmModalOpen(true);
  };
  // Confirm deletion
  const confirmDelete = async () => {
    if (deleteIndex !== null) {
      const updatedExperience = experience.filter((_, i) => i !== deleteIndex);
      try {
        await updateProfile({ experience: updatedExperience });
        setExperience(updatedExperience);
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    }
    setConfirmModalOpen(false); // Close confirmation modal
  };

  return (
    <Section>
      {experience.length === 0 ? (
        <div className={isOwnProfile ? "border-2 border-dashed border-linkedinBlue p-4 rounded-lg" : ""}>
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-semibold text-linkedinDarkGray">
              Experience
            </h2>
            {isOwnProfile && (
              <button className="text-2xl text-linkedinDarkGray">
                <IoMdClose />
              </button>
            )}
          </div>
          <p className="text-sm text-linkedinGray">
              {isOwnProfile ?("Showcase your accomplishments and get up to 2X as many profile views and connections")
            :("No Experience Added Yet")}
            
          </p>

          <div className="flex items-center space-x-4 my-4">
            <img src={ExperienceIcon} alt="ExperienceIcon" className="w-8" />
            <div className="text-gray-500">
              <p className="font-medium">Job Title</p>
              <p>Organization</p>
              <p>2023 - Present</p>
            </div>
          </div>
          {isOwnProfile &&(
            <Button
            label="Add experience"
            styleType="outline"
            onClick={() => setShowModal(true)}
          />
          )}
          
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-semibold text-linkedinDarkGray">
              Experience
            </h2>
            {isOwnProfile && (
              <button className="text-xl" onClick={() => setShowModal(true)}>
              <IoAddOutline />
            </button>
            )}
          </div>
          {experience.map((exp, index) => (
            <div key={index} className="mb-4 border-b border-gray-200 pb-2">
              <div className="flex justify-between items-start mt-8">
                <div className="flex items-center space-x-4">
                  <img
                    src={ExperienceIcon}
                    alt="ExperienceIcon"
                    className="w-8"
                  />
                  <div>
                    <h3 className="font-semibold text-linkedinDarkGray">
                      {exp.title}
                    </h3>
                    <p className="font-medium text-linkedinGray">
                      {exp.company}
                    </p>
                    <p className="text-sm text-linkedinGray">
                      {exp.startMonth} {exp.startYear} -{" "}
                      {exp.currentlyWorking
                        ? "Present"
                        : `${exp.endMonth} ${exp.endYear}`}
                    </p>
                    <p className="text-sm text-linkedinGray">{exp.location}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {isOwnProfile &&(
                    <button
                    className="text-xl text-linkedinDarkGray"
                    onClick={() => handleEdit(index)}
                  >
                    <MdOutlineEdit />
                  </button>
                  )}
                  
                  {isOwnProfile &&(
                      <button
                    className="text-xl text-linkedinDarkGray"
                    onClick={() => handleDelete(index)}
                  >
                    <IoMdClose />
                  </button>
                  )}
                
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white px-6 rounded-lg shadow-lg w-1/2 h-3/4 overflow-y-auto">
            <div className="sticky top-0 py-4 bg-white z-10 flex justify-between">
              <h2 className="text-lg font-semibold text-linkedinDarkGray mb-4">
                Add Experience
              </h2>
              <button
                className="text-3xl text-linkedinGray"
                onClick={() => setShowModal(false)}
              >
                <IoMdClose />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="text-linkedinGray text-sm">
              <label className="block mb-2">Title*</label>
              <input
                type="text"
                name="title"
                placeholder="Job Title"
                className="border p-2 w-full mb-4 text-linkedinDarkGray"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <label className="block mb-2">Employment Type*</label>
              <select
                name="employmentType"
                className="border p-2 w-full mb-4  text-linkedinDarkGray"
                value={formData.employmentType}
                onChange={handleChange}
                required
              >
                <option value="">Select Employment Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>

              <label className="block mb-2">Company Name*</label>
              <input
                type="text"
                name="company"
                placeholder="Company"
                className="border p-2 w-full mb-4 text-linkedinDarkGray"
                value={formData.company}
                onChange={handleChange}
                required
              />

              <label className="block mb-2">Location*</label>
              <input
                type="text"
                name="location"
                placeholder="Location"
                className="border p-2 w-full mb-4 text-linkedinDarkGray"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <label className="block mb-2">Location Type</label>
              <select
                name="locationType"
                className="border p-2 w-full mb-4 text-linkedinDarkGray"
                value={formData.locationType}
                onChange={handleChange}
              >
                <option value="">Select Location Type</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Online">Online</option>
              </select>

              <div className="flex items-center mb-4 text-linkedinDarkGray">
                <input
                  type="checkbox"
                  name="currentlyWorking"
                  checked={formData.currentlyWorking}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label>I am currently working in this role</label>
              </div>

              <label className="block mb-2">Start Date*</label>
              <div className="flex space-x-4 mb-4 ">
                <select
                  name="startMonth"
                  className="border p-2 w-full text-linkedinDarkGray"
                  value={formData.startMonth}
                  onChange={handleChange}
                  required
                >
                  <option value="">Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  name="startYear"
                  className="border p-2 w-full text-linkedinDarkGray"
                  value={formData.startYear}
                  onChange={handleChange}
                  required
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <label className="block mb-2">End Date*</label>
              <div className="flex space-x-4 mb-4">
                <select
                  name="endMonth"
                  className="border p-2 w-full text-linkedinDarkGray"
                  value={formData.endMonth}
                  onChange={handleChange}
                  disabled={formData.currentlyWorking}
                >
                  <option value="">Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  name="endYear"
                  className="border p-2 w-full text-linkedinDarkGray"
                  value={formData.endYear}
                  onChange={handleChange}
                  disabled={formData.currentlyWorking}
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <label className="block mb-2">Description</label>
              <textarea
                name="description"
                placeholder="Description"
                className="border p-2 w-full mb-4 text-linkedinDarkGray"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              ></textarea>
              <div className="flex space-x-4 justify-end pb-6">
                <Button
                  label="Cancel"
                  styleType="default"
                  className=""
                  onClick={() => setShowModal(false)}
                />
                <Button label="Save" styleType="primary" type="submit" />
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this experience?"
      />
    </Section>
  );
};

export default ExperienceSection;
