const Conversation = require("../Models/Conversation");
const Message = require("../Models/Message");

const newMessageHandler = async (socket, data, io) => {

    console.log(data, 'new-message');

    const { message, conversationId } = data;
    const { author, content, media, audioUrl, document, type, giphyUrl } = message;
  
    try {
      // 1. Find the conversation by conversationId
      const conversation = await Conversation.findById(conversationId);
  
      if (!conversation) {
        return socket.emit("error", { message: "Conversation not found" });
      }
  
      // 2. Create a new message using the Message Model
      const newMessage = await Message.create({
        author,
        content,
        media,
        audioUrl,
        document,
        type,
        giphyUrl
      });
  
      // 3. Push messageId to messages in conversation
      conversation.messages.push(newMessage._id);
      await conversation.save();
  
      // 4. Populate the conversation with messages and participants
      const updatedConversation = await Conversation.findById(conversationId)
        .populate("messages")
        .populate("participants");
  
      // 5. Find participants who are online (status === "Online") and have a socketId
      const onlineParticipants = updatedConversation.participants.filter(
        (participant) => participant.status === "Online" && participant.socketId
      );

      console.log(onlineParticipants);
  
      // 6. Emit 'new-message' event to online participants
      onlineParticipants.forEach((participant) => {
        console.log(participant.socketId);
        io.to(participant.socketId).emit("new-direct-chat", {
          conversationId: conversationId,
          message: newMessage,
        });
      });
  
    } catch (error) {
      console.error("Error handling new message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  };
  
  module.exports = newMessageHandler;
  