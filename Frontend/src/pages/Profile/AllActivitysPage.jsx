import React, { useEffect, useState } from "react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import PostFullView from "../../components/Post/PostFullView";
import UserInfoCart from "../../components/common/UserInfoCart";
import RecommendCard from "../../components/common/RecommendCard";
import { base_url, getUserPosts } from "../../utils/postApi";
import Rightside from "../../components/Rightside";
import { useAuthStore } from "../../store/authStore";
import { useParams } from "react-router-dom";
import axios from "axios";
function AllActivitysPage() {
  const [posts, setPosts] = useState([]);
  const { id } = useParams();
  const [realUser, setUser] = useState();
  const [loading, isLoading] = useState(false);
  const { user } = useAuthStore();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${base_url}/users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching post:", error); // Handle errors if any
      }
    };
    fetchUser();
  }, []);
  useEffect(() => {
    getUserPosts(setPosts, 1, 10, [], id, isLoading);
  }, []);
  return (
    <div className="bg-linkedinLightGray min-h-screen py-3 mt-16">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-3  p-4">
          <UserInfoCart user={realUser}></UserInfoCart>
        </aside>
        {/* Main Content Area */}
        <main className="col-span-1 md:col-span-6 p-4 w-full">
          <Section className="w-full">
            <div className="flex gap-2 justify-between py-3">
              <div>
                <p className="font-semibold text-xl">All activity</p>
              </div>
            </div>

            {posts ? (
              posts.map((post, index) => (
                <PostFullView
                  parentPost={post}
                  key={index}
                  setPosts={setPosts}
                />
              ))
            ) : (
              <div className="flex justify-center">
                <span className="loading loading-spinner mx-auto text"></span>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center">
                <span className="loading loading-spinner mx-auto text"></span>
              </div>
            ) : (
              <></>
            )}
            {posts.length === 0 && <div>No posts to show !</div>}
          </Section>
          {/* Add more posts as needed */}
        </main>
        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 p-4 ">
          {/* <RecommendCard /> */}
          <Rightside />
        </aside>
      </div>
    </div>
  );
}

export default AllActivitysPage;
