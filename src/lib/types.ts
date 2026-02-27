export interface User {
  id: string;
  username: string;
  walletAddress: string;
  avatar: string;
  karma: number;
  tokensEarned: number;
  joinDate: string;
  bio: string;
  communities: string[];
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  postCount: number;
  icon: string;
  banner: string;
  tags: string[];
  createdAt: string;
  createdBy: string;
  isJoined?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  communityId: string;
  community: Community;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tokenReward: number;
  createdAt: string;
  tags: string[];
  imageUrl?: string;
  userVote?: "up" | "down" | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies?: Comment[];
  userVote?: "up" | "down" | null;
}
