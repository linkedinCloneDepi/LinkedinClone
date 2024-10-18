import React, { useState } from "react";
import FilterOptions from "./components/FilterOptions";
import Section from "../../components/common/Section";
import NotificationList from "./components/NotificationsList";

const NotificationPage = () => {
  const [filter, setFilter] = useState("all");

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Fetch or filter notifications based on the new filter
  };

  return (
    <div className=" min-h-screen py-3 mx-auto p-4 bg-linkedinLightGray mt-16 ">
      <main className="w-full max-w-2xl mx-auto">
        <FilterOptions onFilterChange={handleFilterChange} />
        <NotificationList filter ={filter}/>
      </main>
    </div>
  );
};

export default NotificationPage;
