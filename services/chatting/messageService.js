// message 생성 단독 로직
import Message from '../../models/messageSchema.js';

export const createMessage = async (chatId, senderId, messageContent, images_url) => {
  const message = await Message.create({
    chat_id: chatId,
    senderId: senderId,
    message: messageContent,
    images_url: images_url,
    read: false,
    createdAt,
  });
  return message;
};
