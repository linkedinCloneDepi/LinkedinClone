import React, { useState } from 'react';
import Microsoft_logo from '../assets/images/Microsoft_logo.svg';
import google_logo from '../assets/images/google.svg';
import Button from '../components/common/Button';
import { useNavigate, Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signup, error, isLoading } = useAuthStore();

  const handleSignUp = async (e) => {
		e.preventDefault();

		try {
			await signup(email, password, username);
			navigate("/SignUpDetailsPage");
			// navigate("/verify-email");
		} catch (error) {
			
		}
	};

  return (
    <>
      <main className="flex-grow flex flex-col justify-center items-center bg-linkedinLightGray space-y-6">
        <h1 className="text-3xl text-gray-800 text-center">
          Make the most of your professional life
        </h1>
        {/* Card */}
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-linkedinsecondGray"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-2 border rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-linkedinsecondGray">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-linkedinsecondGray"
              >
                Password (6+ characters)
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 font-semibold mt-2">{error}</p>
            )}
            <Button
              label={
                isLoading ? (
                  <div className="loading loading-spinner"></div>
                ) : (
                  "Agree & Join"
                )
              }
              styleType="primary"
              className="w-full"
              disabled={isLoading}
            />

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-600">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Button
              label="Continue with Google"
              icon={<img src={google_logo} alt="Google" className="w-5 h-5" />}
              styleType="default"
              className="w-full flex items-center justify-center space-x-2"
            />

            <Button
              label="Continue with Microsoft"
              icon={
                <img src={Microsoft_logo} alt="Microsoft" className="w-5 h-5" />
              }
              styleType="default"
              className="w-full flex items-center justify-center space-x-2"
            />
            <p className="text-sm text-linkedinsecondGray text-center">
              Already on LinkedIn?{" "}
              <Link
                to="/login"
                className="text-linkedinBlue hover:text-linkedinDarkBlue hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}

export default SignUpPage;
