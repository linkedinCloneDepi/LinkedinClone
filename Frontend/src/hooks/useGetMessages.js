import { useEffect, useState } from "react";
import useConversation from "../store/useConversation";
import toast from "react-hot-toast";
import axios from "axios";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  useEffect(() => {
    
    const getMessages = async () => {
      
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedConversation._id}`
        );
        // const data = await res.json();
        // if (data.error) throw new Error(data.error);
        
        setMessages(res.data);
      } catch (error) {
        console.error("error in getMessages:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessages]);

  return { messages, loading };
};
export default useGetMessages;
