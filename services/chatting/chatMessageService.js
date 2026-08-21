import { createChat } from './chatService.js';
import { createMessage } from './messageService.js';

export const createChatWithInitialMessage = 
async (user_id, target_id, match_id, target_name, target_profile_img, messageContent, senderId) => {
  // 1. 채팅방 생성
  const chat = await createChat(user_id, target_id, match_id, target_name, target_profile_img);

  // 2. 첫 메시지 생성
  const message = await createMessage(chat._id, user_id, messageContent, senderId);

  return {
    chat,
    message,
  };
};

