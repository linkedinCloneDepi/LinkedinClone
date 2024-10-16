import React, { useState } from 'react';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from "react-hot-toast";

function SignUpDetailsPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState(''); 

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ firstName, lastName });
    setFirstName(firstName);
    setLastName(lastName);
    navigate("/verify-email");
    toast.success("Your Name Enterd Successfully");
    toast.success("Welcome to Linkedin!");
  };

  return (
    <main className="flex-grow flex flex-col justify-center items-center bg-linkedinLightGray min-h-screen space-y-6">
      <h1 className="text-3xl text-gray-800 text-center">
      Make the most of your professional life
      </h1>
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-linkedinsecondGray">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-linkedinsecondGray">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
          </div>
          <Button label="Continue" styleType="primary" className="w-full"/>
        </form>
      </div>
    </main>
  );
}

export default SignUpDetailsPage;
