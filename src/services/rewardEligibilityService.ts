/**
 * Reward Eligibility Service
 * Checks if a user is eligible to earn token rewards
 */

import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";
import Post from "@/models/Post";
import mongoose from "mongoose";

// Eligibility requirements
const REQUIRED_CREDIBLE_POSTS = 5;
const MINIMUM_TRUST_SCORE = 0.5;
const MINIMUM_ACCOUNT_AGE_HOURS = 0;
const POST_MINIMUM_AGE_HOURS = 0;

export interface EligibilityCheckResult {
  eligible: boolean;
  crediblePostCount: number;
  totalPostCount: number;
  averageTrustScore: number;
  accountAgeValid: boolean;
  reasons: string[];
}

class RewardEligibilityService {
  /**
   * Check if a user is eligible for token rewards
   */
  async checkUserRewardEligibility(userId: string | mongoose.Types.ObjectId): Promise<EligibilityCheckResult> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        return {
          eligible: false,
          crediblePostCount: 0,
          totalPostCount: 0,
          averageTrustScore: 0,
          accountAgeValid: false,
          reasons: ["User not found"],
        };
      }

      const reasons: string[] = [];

      // 1. Check account age (minimum 48 hours)
      const accountAgeHours = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60);
      const accountAgeValid = accountAgeHours >= MINIMUM_ACCOUNT_AGE_HOURS;

      if (!accountAgeValid) {
        const hoursNeeded = Math.ceil(MINIMUM_ACCOUNT_AGE_HOURS - accountAgeHours);
        reasons.push(`Account must be at least ${MINIMUM_ACCOUNT_AGE_HOURS} hours old. Eligible in ${hoursNeeded} hours`);
      }

      // 2. Fetch user's posts - must be at least 24 hours old
      const cutoffTime = new Date(Date.now() - POST_MINIMUM_AGE_HOURS * 60 * 60 * 1000);

      const allPosts = await Post.find({
        author: userId,
        createdAt: { $lt: cutoffTime },
      }).select("trustScore aiModerationStatus");

      const totalPostCount = allPosts.length;

      // 3. Filter for credible posts
      // Criteria: score >= 0.7, status == approved, older than 24 hours
      const crediblePosts = allPosts.filter(
        (post) => post.trustScore >= MINIMUM_TRUST_SCORE && post.aiModerationStatus === "approved"
      );

      const crediblePostCount = crediblePosts.length;

      // 4. Calculate average trust score
      const averageTrustScore = crediblePosts.length > 0 ? crediblePosts.reduce((sum, p) => sum + p.trustScore, 0) / crediblePosts.length : 0;

      // 5. Determine eligibility
      const hasEnoughPosts = crediblePostCount >= REQUIRED_CREDIBLE_POSTS;

      if (!hasEnoughPosts && crediblePostCount > 0) {
        const postsNeeded = REQUIRED_CREDIBLE_POSTS - crediblePostCount;
        reasons.push(`Need ${postsNeeded} more credible posts (${crediblePostCount}/${REQUIRED_CREDIBLE_POSTS})`);
      } else if (crediblePostCount === 0) {
        reasons.push(`Need ${REQUIRED_CREDIBLE_POSTS} credible posts`);
      }

      if (totalPostCount > crediblePostCount) {
        const lowTrustPosts = totalPostCount - crediblePostCount;
        reasons.push(`${lowTrustPosts} posts do not meet trust score requirements`);
      }

      const eligible = accountAgeValid && hasEnoughPosts;

      // Log successful eligibility determination
      if (eligible && !user.eligibleForRewards) {
        console.log(`[RewardEligibility] User ${user.username} now eligible for rewards`);
      }

      return {
        eligible,
        crediblePostCount,
        totalPostCount,
        averageTrustScore: Math.round(averageTrustScore * 100) / 100,
        accountAgeValid,
        reasons,
      };
    } catch (error) {
      console.error("[RewardEligibility] Error checking user eligibility:", error);
      return {
        eligible: false,
        crediblePostCount: 0,
        totalPostCount: 0,
        averageTrustScore: 0,
        accountAgeValid: false,
        reasons: ["Error checking eligibility"],
      };
    }
  }

  /**
   * Update user's eligibility status in database
   */
  async updateUserRewardEligibility(userId: string | mongoose.Types.ObjectId): Promise<void> {
    try {
      const result = await this.checkUserRewardEligibility(userId);

      await User.findByIdAndUpdate(userId, {
        eligibleForRewards: result.eligible,
        crediblePostCount: result.crediblePostCount,
        trustScoreAverage: result.averageTrustScore,
        rewardEligibilityCheckedAt: new Date(),
      });
    } catch (error) {
      console.error("[RewardEligibility] Error updating user eligibility:", error);
    }
  }

  /**
   * Batch update eligibility for all users (run periodically)
   */
  async updateAllUserEligibility(): Promise<number> {
    try {
      await connectDB();

      const users = await User.find({}).select("_id");
      let updatedCount = 0;

      for (const user of users) {
        await this.updateUserRewardEligibility(user._id);
        updatedCount++;
      }

      console.log(`[RewardEligibility] Updated eligibility for ${updatedCount} users`);
      return updatedCount;
    } catch (error) {
      console.error("[RewardEligibility] Error batch updating user eligibility:", error);
      return 0;
    }
  }

  /**
   * Get text explanation of why user is not eligible
   */
  getEligibilityExplanation(result: EligibilityCheckResult): string {
    if (result.eligible) {
      return "You are eligible to earn rewards!";
    }

    if (result.reasons.length === 0) {
      return "Your account does not meet reward eligibility requirements.";
    }

    return result.reasons.join(". ");
  }
}

export const rewardEligibilityService = new RewardEligibilityService();
