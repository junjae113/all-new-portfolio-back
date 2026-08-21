// Chat 생성 단독 로직
import Chat from '../../models/chatSchema.js';

export const createChat = async (user_id, target_id, match_id, target_name, target_profile_img) => {
  const chat = await Chat.create({
    match_id: match_id,
    user_id: user_id,
    target_id: target_id,

    target_name: target_name,
    target_profile_img: target_profile_img,

    lastMessage,
    lastMessageAt,
    unreadCounts,
  });
  return chat;
};
