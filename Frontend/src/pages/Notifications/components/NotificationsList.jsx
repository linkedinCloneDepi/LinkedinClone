import React, { useEffect, useState } from "react";
// import CommentNotification from "./CommentNotification";
import axios from "axios";
import Section from "../../../components/common/Section";
import GenericNotification from "./GenericNotification";

const NotificationList = ({ filter }) => {
  const [isNotificationVisible, setNotificationVisible] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const handleDeleteNotification = async (id) => {
    const response = await axios.delete(
      `http://localhost:5000/api/notifications/${id}`
    );
    

    const updatedNotifications = notifications.filter(
      (notification) => notification._id !== id
    );
    setNotifications(updatedNotifications);
    setNotificationVisible(false);
  };

  useEffect(() => {
    const getNotificationWithType = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get(
          `http://localhost:5000/api/notifications?notificationType=${filter}`
        );
        

        setNotifications(response.data.notifications); // Set notifications in state
      } catch (err) {
        setError("Failed to fetch notifications");
        setLoading(false);
      }
    };

    getNotificationWithType();
  }, [filter]);

const openNotification=()=>{

}

return (
  <div className="border flex flex-col flex-wrap justify-start bg-linkedinWhite rounded-lg mt-4">
    {notifications.map((notification) => (
      <GenericNotification
        key={notification._id}
        notification={notification}
        onDelete={handleDeleteNotification}
      />
    ))}
  </div>
);
};

export default NotificationList;
