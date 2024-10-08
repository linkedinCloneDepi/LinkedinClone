import React from 'react';
import ProfileHeader from './componenets/ProfileHeader';
import AnalyticsSection from './componenets/AnalyticsSection'
import ResourcesSection from './componenets/ResourcesSection'
import AboutSection from './componenets/AboutSection';
import ActivitySection from './componenets/ActivitySection';
import ExperienceSection from './componenets/ExperienceSection';
import EducationSection from './componenets/EducationSection';
import SkillsSection from './componenets/SkillsSection';


const Profile = () => {
  return (
    
    <div className="bg-linkedinLightGray min-h-screen py-3 mt-16">
      <ProfileHeader />
      <AboutSection />
      <AnalyticsSection />
      <ResourcesSection />
      <ActivitySection />
      <ExperienceSection />
      <EducationSection  />
      <SkillsSection />
    </div>
  );
}

export default Profile;
