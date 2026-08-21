// 커뮤니티 관련 컨트롤러 (게시글, 댓글 등)
import mongoose from "mongoose";
import Post from "../../models/postSchema.js"
import Reply from "../../models/replySchema.js"
import User from "../../models/userSchema.js";


// 게시글
export const getPosts = async (req, res) => {
  // 게시글 목록 조회 로직
  try {
    const posts = await Post.find().sort({created_at: -1}).lean();

    const userIds = [...new Set(posts.map(p=> p.user_id).filter(Boolean))];

    const users = await User.find(
      {user_id: {$in: userIds}},
      {user_id:1, 'dogProfile.name': 1, 'dogProfile.profileImage':1}
    ).lean();

    const userMap = new Map(users.map(u => [u.user_id, u]));

    const withAuthors = posts.map(p => {
      const author = userMap.get(p.user_id);
      return {
        ...p,
        authorName: author?.dogProfile?.name,
        authorProfileImage: author?.dogProfile?.profileImage,
      };
    })

    res.status(200).json({
      message: '게시글 목록 조회',
      data: withAuthors,

    });
  } catch (error) {
    console.error(`communityController getPosts ${error}`)
    res.status(500).json({message: "게시글 목록 조회 오류 발생"})
  }
}; 


export const registerPost = async(req, res) => {
  // 게시글 등록
  const {post_id, title, content} = req.body;
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({message:'인증 필요'});
  

  if(!title?.trim() || !content?.trim()) {
    return res.status(400).json({message: "필수값 누락"});
  }

  const safePostId = post_id || `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

  

  try {
    const created = await Post.create({
      post_id: safePostId,
      user_id,
      title,
      content,
      like_count: 0,
      comment_count: 0,
      created_at:new Date(),
    })


    const author = await User.findOne(
      {user_id},
      {'dogProfile.name':1, 'dogProfile.profileImage': 1, _id:0}
    ).lean();

    res.status(201).json({
      message: "게시글 등록 완료", 
      data: {
        ...created.toObject(),
        authorName: author?.dogProfile?.name || null,
        authorProfileImage: author?.dogProfile?.profileImage || null,
      },

      })
  } catch(error) {
    console.error(`communityController registerPost ${error}`)
    res.status(500).json({message:"게시글 등록 중 오류 발생"})
  }
}


export const removePost = async(req,res) => {
  // 게시글 삭제
  const {post_id} = req.params;

  try {
    await Post.deleteOne({post_id})
    // 댓글도 같이 삭제
    await Reply.deleteMany({post_id})

    res.status(200).json({message: "게시글 삭제 완료"})
  } catch (error) {
    console.error(`communityController removePost ${error}`)
    res.status(500).json({message:"게시글 삭제 중 오류 발생"})
  }
}





// 댓글 ---------------------------------------------

export const registerReply = async(req, res) => {
  // 댓글 등록
  const {post_id, reply_content} = req.body;
  const user_id = req.user.id;

  if(!post_id || !reply_content?.trim()){ 
    return res.status(400).json({message:"필수값 누락"});
  }

  
  try{
    const reply_id = new mongoose.Types.ObjectId().toString();
    
    const created = await Reply.create( {
      reply_id,
      post_id,
      user_id,
      reply_content,
      created_at: new Date(),
    });

    const author = await User.findOne(
      {user_id},
      {'dogProfile.name':1, 'dogProfile.profileImage': 1}
    ).lean();


    // 댓글 수 
    const updated = await Post.findOneAndUpdate(
      {post_id},
      {$inc: {comment_count: 1}},
      {new: true, projection: {comment_count:1}}
    );

    res.status(201).json({
      message: "댓글 추가 완료",
      reply: {
        reply_id: created.reply_id,
        post_id,
        user_id,
        reply_content,
        created_at: created.created_at,
        authorName: author?.dogProfile?.name,
        authorProfileImage: author?.dogProfile?.profileImage,

      },
      post_id,
      comment_count: updated?.comment_count,
    })
  } catch (error) {
    console.error(`communityController registerReply ${error}`)
    res.status(500).json({
      message: "댓글 추가 중 오류 발생"
    })
  }

}




export const removeReply = async(req, res) => {
  // 댓글 삭제
  const {reply_id} = req.params

  try {
    const reply = await Reply.findOne({reply_id})
    if(!reply) {
      return res.status(404).json({message:"댓글을 찾을 수 없음"})
    }

    await Reply.deleteOne({reply_id})
    
    // 댓글 수 
    await Post.updateOne(
      {post_id: reply.post_id},
      {$inc: {comment_count: -1}}
    )

    res.status(200).json({message:"댓글 삭제 완료"})

  } catch(error){
    console.error(`communityController removeReply ${error}`)
    res.status(500).json({message:"댓글 삭제 중 오류 발생"})
  }


}




export const toggleLike = async(req, res) => {
  // 좋아요 수
  try {
    const {post_id} = req.params;
    const post = await Post.findOne({post_id});
    if (!post) return res.status(404).json({message:"게시글 없음"})

    // 프론트 liked
    const {liked} = req.body
    const updatedPost = await Post.findOneAndUpdate(
      {post_id},
      {$inc: {like_count: liked? -1 : 1}},
      {new: true, projection: {like_count: 1}}
    );
    res.status(200).json({
      message:"좋아요 성공",
      like_count: updatedPost.like_count,
    })   
  } catch (error) {
    console.error(`communityController toggleLike ${error}`);
    res.status(500).json({message: "좋아요 실패"})
  }
}


