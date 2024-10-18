
const {Message} = require("../models/message.model");
const {Conversation} = require("../models/conversation.model");
const { getReceiverSocketId } = require("../socket/socket");
const { io } = require("../socket/socket"); 

const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.userId;  

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage.id);
		}

		// await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// SOCKET IO Fn
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		
		res.status(500).json({ error: "Internal server error" });
	}
};

const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.userId;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages");  // return array of messages 'objects' // NOT REFERENCE BUT MESSAGE itself

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		
		res.status(500).json({ error: "Internal server error" });
	}
};


// Edit Message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message: newContent } = req.body;
    // const { id: receiverId } = req.params;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { message: newContent },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Emit updated message via socket
    // io.emit("messageUpdated", updatedMessage);
    const receiverSocketId = getReceiverSocketId(updatedMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", updatedMessage);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error in editMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    // const { id: receiverId } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Remove the message from its conversation
    await Conversation.updateMany(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    // Emit deletion via socket
    // io.emit("messageDeleted", messageId);
    const receiverSocketId = getReceiverSocketId(deletedMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage
};