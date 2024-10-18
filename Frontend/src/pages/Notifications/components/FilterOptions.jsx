import React, { useState } from "react";

const FilterOptions = ({ onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isIcon, setIcon] = useState(false);
  const [postFilter, setPostFilter] = useState("all");

  const filters = [
    { value: "all", label: "All" },
    // { value: "jobs", label: "Jobs" },
    { value: "posts", label: "My posts" },
    { value: "mentions", label: "Mentions" },
  ];

  const postFilters = [
    { value: "all", label: "All" },
    { value: "comments", label: "Comments" },
    { value: "likes", label: "Likes" },
    { value: "reposts", label: "Reposts" },
  ];

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    if (filter !== "posts") {
      setPostFilter("all"); // Reset post filter when changing main filter
      setIsDropdownOpen(false); // Close dropdown when selecting other filters
      setIcon(false);
    } else {
      setIcon(true);
      setIsDropdownOpen((prev) => !prev); // Toggle dropdown for "My posts"
    }
    onFilterChange(filter);
  };

  const handlePostFilterChange = (filter) => {
    setPostFilter(filter);
    setIsDropdownOpen(false);
    onFilterChange(`posts:${filter}`); // Pass the selected post filter
  };

  return (
    <div className="border flex flex-wrap justify-start space-x-4 p-4 bg-linkedinWhite rounded-lg">
      {filters.map((filter) => {
        if (filter.value === "posts") {
          return (
            <div key={filter.value} className="relative">
              <button
                className={`border-2 border-gray-300 flex items-center px-4 py-2 rounded-full transition duration-200 sm:w-auto flex-shrink-0 flex-grow-0 ${
                  selectedFilter === filter.value
                    ? "bg-linkedinGreen text-white border-0 hover:bg-green-900"
                    : "bg-white text-gray-700 hover:bg-gray-200 hover:border-gray-500"
                }`}
                onClick={() => handleFilterChange(filter.value)}
              >
                {postFilter === "all"
                  ? filter.label
                  : `Posts | ${
                      postFilter.charAt(0).toUpperCase() + postFilter.slice(1)
                    }`}
                {isIcon && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    className="ml-1 hidden sm:inline fill-current"
                  >
                    <path d="M8.8 10.66L14 5.12a.07.07 0 00-.07-.12H2.07a.07.07 0 00-.07.12l5.2 5.54a1.1 1.1 0 001.6 0z"></path>
                  </svg>
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1 px-4 text-sm font-semibold text-gray-700">
                    Filter post activity
                  </div>
                  <div className="py-1">
                    {postFilters.map((postFilterOption) => (
                      <button
                        key={postFilterOption.value}
                        onClick={() =>
                          handlePostFilterChange(postFilterOption.value)
                        }
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          postFilter === postFilterOption.value
                            ? "bg-blue-100 text-blue-900"
                            : "bg-white text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {postFilterOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <button
            key={filter.value}
            className={`border-gray-300 flex px-4 py-2 rounded-full transition duration-200  sm:w-auto flex-shrink-0 flex-grow-0 ${
              selectedFilter === filter.value
                ? "bg-linkedinGreen text-white border-0 hover:bg-green-900"
                : "bg-white text-gray-800 hover:bg-gray-200 hover:border-gray-500 border-2"
            }`}
            onClick={() => handleFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterOptions;
