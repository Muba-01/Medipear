import { ethers } from "ethers";
import type { RewardsController } from "../../contracts/typechain-types";
import { RewardsController__factory } from "../../contracts/typechain-types";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

interface OracleConfig {
  rpcUrl: string;
  privateKey?: string;
  rewardsControllerAddress: string;
}

// Reward amounts for different events (in wei or token decimals)
const REWARD_AMOUNTS = {
  POST_CREATED: ethers.parseEther("10"),
  POST_UPVOTED: ethers.parseEther("2"),
  COMMENT_CREATED: ethers.parseEther("5"),
  COMMENT_UPVOTED: ethers.parseEther("1"),
  COMMUNITY_JOINED: ethers.parseEther("15"),
  DAILY_LOGIN: ethers.parseEther("3"),
};

const POST_REWARD_MIN = ethers.parseEther("2");
const POST_REWARD_MAX = ethers.parseEther("15");
const POST_REWARD_THRESHOLD = 0.5;
const LOCAL_SIGNER_GAS_TOPUP = ethers.parseEther("0.05");

class RewardsOracleService {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: RewardsController | null = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const config = this.validateConfig();
    
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      
      // Initialize contract + signer (with local fallback when needed)
      this.contract = await this.getContractInstance(config);

      this.initialized = true;
      console.log("[RewardsOracle] Service initialized successfully");
    } catch (error) {
      console.error("[RewardsOracle] Initialization failed:", error);
      throw error;
    }
  }

  private validateConfig(): OracleConfig {
    const rpcUrl =
      process.env.BLOCKCHAIN_RPC_URL ||
      process.env.NEXT_PUBLIC_LOCAL_RPC_URL ||
      "http://127.0.0.1:8545";
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    const rewardsControllerAddress = process.env.REWARDS_CONTROLLER_ADDRESS;

    if (!rewardsControllerAddress) {
      throw new Error(
        "REWARDS_CONTROLLER_ADDRESS environment variable is not set"
      );
    }

    return {
      rpcUrl,
      privateKey,
      rewardsControllerAddress,
    };
  }

  private isLocalRpc(rpcUrl: string): boolean {
    return rpcUrl.includes("127.0.0.1") || rpcUrl.includes("localhost");
  }

  private extractGrantedAccount(logs: Array<ethers.Log | ethers.EventLog>): string | null {
    for (let i = logs.length - 1; i >= 0; i -= 1) {
      const candidate = logs[i];
      if ("args" in candidate) {
        const account = candidate.args?.account;
        if (typeof account === "string" && ethers.isAddress(account)) {
          return account;
        }
      }
    }
    return null;
  }

  private async getUnlockedAccounts(): Promise<string[]> {
    if (!this.provider) {
      return [];
    }

    try {
      const accounts = (await this.provider.send("eth_accounts", [])) as string[];
      return accounts.filter((account) => ethers.isAddress(account));
    } catch (error) {
      console.warn("[RewardsOracle] Failed to query unlocked RPC accounts:", error);
      return [];
    }
  }

  private async getUnlockedSignerByAddress(address: string): Promise<ethers.Signer | null> {
    if (!this.provider || !ethers.isAddress(address)) {
      return null;
    }

    const unlockedAccounts = await this.getUnlockedAccounts();
    const match = unlockedAccounts.find(
      (account) => account.toLowerCase() === address.toLowerCase()
    );

    if (!match) {
      return null;
    }

    return this.provider.getSigner(match);
  }

  private async tryGrantOracleRoleLocally(
    accessProbe: ethers.Contract,
    oracleRole: string,
    targetAddress: string
  ): Promise<boolean> {
    if (!this.provider || !ethers.isAddress(targetAddress)) {
      return false;
    }

    try {
      const roleAdmin: string = await accessProbe.getRoleAdmin(oracleRole);
      const unlockedAccounts = await this.getUnlockedAccounts();

      for (const account of unlockedAccounts) {
        const isRoleAdmin: boolean = await accessProbe.hasRole(roleAdmin, account);
        if (!isRoleAdmin) {
          continue;
        }

        const adminSigner = await this.provider.getSigner(account);
        const adminConnected = accessProbe.connect(adminSigner);
        const grantRole = adminConnected.getFunction("grantRole");
        const tx = await grantRole(oracleRole, targetAddress);
        await tx.wait();

        const granted: boolean = await accessProbe.hasRole(oracleRole, targetAddress);
        if (granted) {
          console.log(
            `[RewardsOracle] Granted ORACLE_ROLE to configured signer ${targetAddress} via local admin ${account}`
          );
          return true;
        }
      }
    } catch (error) {
      console.warn("[RewardsOracle] Local ORACLE_ROLE grant attempt failed:", error);
    }

    return false;
  }

  private async findUnlockedOracleRoleSigner(
    accessProbe: ethers.Contract,
    oracleRole: string
  ): Promise<ethers.Signer | null> {
    if (!this.provider) {
      return null;
    }

    const unlockedAccounts = await this.getUnlockedAccounts();
    let roleHolderWithoutFunds: string | null = null;

    for (const account of unlockedAccounts) {
      const hasRole: boolean = await accessProbe.hasRole(oracleRole, account);
      if (!hasRole) {
        continue;
      }

      const balance = await this.provider.getBalance(account);
      if (balance > BigInt(0)) {
        return this.provider.getSigner(account);
      }

      if (!roleHolderWithoutFunds) {
        roleHolderWithoutFunds = account;
      }
    }

    if (roleHolderWithoutFunds) {
      console.warn(
        `[RewardsOracle] Found unlocked ORACLE_ROLE account ${roleHolderWithoutFunds}, but it has zero native balance for gas.`
      );
    }

    return null;
  }

  private async ensureLocalSignerHasGas(signer: ethers.Signer): Promise<boolean> {
    if (!this.provider) {
      return false;
    }

    const signerAddress = await signer.getAddress();
    const currentBalance = await this.provider.getBalance(signerAddress);
    if (currentBalance > BigInt(0)) {
      return true;
    }

    const unlockedAccounts = await this.getUnlockedAccounts();
    for (const account of unlockedAccounts) {
      if (account.toLowerCase() === signerAddress.toLowerCase()) {
        continue;
      }

      const funderBalance = await this.provider.getBalance(account);
      if (funderBalance <= LOCAL_SIGNER_GAS_TOPUP) {
        continue;
      }

      try {
        const funderSigner = await this.provider.getSigner(account);
        const tx = await funderSigner.sendTransaction({
          to: signerAddress,
          value: LOCAL_SIGNER_GAS_TOPUP,
        });
        await tx.wait();

        const newBalance = await this.provider.getBalance(signerAddress);
        if (newBalance > BigInt(0)) {
          console.log(
            `[RewardsOracle] Funded local oracle signer ${signerAddress} with ${LOCAL_SIGNER_GAS_TOPUP.toString()} wei from ${account}`
          );
          return true;
        }
      } catch (error) {
        console.warn(
          `[RewardsOracle] Failed to fund oracle signer ${signerAddress} from ${account}:`,
          error
        );
      }
    }

    return false;
  }

  private async getContractInstance(config: OracleConfig): Promise<RewardsController> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const contractAddress = config.rewardsControllerAddress;
    const accessProbe = new ethers.Contract(
      contractAddress,
      [
        "function ORACLE_ROLE() view returns (bytes32)",
        "function getRoleAdmin(bytes32 role) view returns (bytes32)",
        "function hasRole(bytes32,address) view returns (bool)",
        "function grantRole(bytes32 role,address account)",
        "event RoleGranted(bytes32 indexed role,address indexed account,address indexed sender)",
      ],
      this.provider
    );

    const oracleRole: string = await accessProbe.ORACLE_ROLE();
    let signer: ethers.Signer | null = null;

    if (config.privateKey) {
      signer = new ethers.Wallet(config.privateKey, this.provider);
      const signerAddress = await signer.getAddress();
      const signerHasRole: boolean = await accessProbe.hasRole(oracleRole, signerAddress);

      if (!signerHasRole && this.isLocalRpc(config.rpcUrl)) {
        const grantedLocally = await this.tryGrantOracleRoleLocally(
          accessProbe,
          oracleRole,
          signerAddress
        );
        if (!grantedLocally) {
          console.warn(
            `[RewardsOracle] ORACLE_PRIVATE_KEY signer ${signerAddress} lacks ORACLE_ROLE. Attempting local unlocked signer fallback.`
          );

          const localOracleSigner = await this.findUnlockedOracleRoleSigner(
            accessProbe,
            oracleRole
          );
          if (localOracleSigner) {
            const localAddress = await localOracleSigner.getAddress();
            signer = localOracleSigner;
            console.log(
              `[RewardsOracle] Using funded local ORACLE_ROLE signer fallback: ${localAddress}`
            );
          }
        }
      }

      if (this.isLocalRpc(config.rpcUrl)) {
        const signerBalance = await this.provider.getBalance(signerAddress);
        if (signerBalance <= BigInt(0)) {
          console.warn(
            `[RewardsOracle] ORACLE_PRIVATE_KEY signer ${signerAddress} has zero native balance. Attempting funded local ORACLE_ROLE signer fallback.`
          );

          const localOracleSigner = await this.findUnlockedOracleRoleSigner(
            accessProbe,
            oracleRole
          );
          if (localOracleSigner) {
            const localAddress = await localOracleSigner.getAddress();
            signer = localOracleSigner;
            console.log(
              `[RewardsOracle] Using funded local ORACLE_ROLE signer fallback: ${localAddress}`
            );
          }
        }
      }
    }

    if (!signer && this.isLocalRpc(config.rpcUrl)) {
      const localOracleSigner = await this.findUnlockedOracleRoleSigner(
        accessProbe,
        oracleRole
      );
      if (localOracleSigner) {
        const localAddress = await localOracleSigner.getAddress();
        signer = localOracleSigner;
        console.log(
          `[RewardsOracle] ORACLE_PRIVATE_KEY missing; using funded local ORACLE_ROLE signer: ${localAddress}`
        );
      } else {
        const grantedLogs = await accessProbe.queryFilter(
          accessProbe.filters.RoleGranted(oracleRole),
          0,
          "latest"
        );
        const oracleHolder = this.extractGrantedAccount(grantedLogs);
        if (oracleHolder) {
          console.warn(
            `[RewardsOracle] ORACLE_ROLE holder ${oracleHolder} is not usable on current RPC node (locked or unfunded).`
          );
        }
      }
    }

    if (!signer) {
      throw new Error(
        "No usable oracle signer found. Set ORACLE_PRIVATE_KEY to an address that has ORACLE_ROLE."
      );
    }

    if (this.isLocalRpc(config.rpcUrl)) {
      const funded = await this.ensureLocalSignerHasGas(signer);
      if (!funded) {
        const fallbackSigner = await this.findUnlockedOracleRoleSigner(accessProbe, oracleRole);
        if (fallbackSigner) {
          signer = fallbackSigner;
        } else {
          const signerAddress = await signer.getAddress();
          throw new Error(
            `No funded oracle signer available on local RPC. Signer ${signerAddress} has zero native balance and no funded unlocked ORACLE_ROLE account was found.`
          );
        }
      }
    }

    this.signer = signer;
    return RewardsController__factory.connect(contractAddress, signer);
  }

  private generateEventId(...parts: string[]): string {
    const combined = parts.join(":");
    return ethers.keccak256(ethers.toUtf8Bytes(combined));
  }

  private getTrustScoreScaledPostReward(trustScore: number): bigint {
    const clamped = Math.max(0, Math.min(1, trustScore));
    const ppm = BigInt(Math.round(clamped * 1_000_000));
    const ppmBase = BigInt(1_000_000);
    const range = POST_REWARD_MAX - POST_REWARD_MIN;
    return POST_REWARD_MIN + (range * ppm) / ppmBase;
  }

  private async resolvePostRewardAmount(postId: string): Promise<bigint | null> {
    try {
      await connectDB();
      const post = await Post.findById(postId)
        .select("trustScore aiModerationStatus")
        .lean();

      if (!post) {
        console.warn(`[RewardsOracle] Post not found for reward amount resolution: ${postId}`);
        return null;
      }

      const trustScore = post.trustScore ?? 0;
      if (trustScore <= POST_REWARD_THRESHOLD) {
        console.log(
          `[RewardsOracle] Post ${postId} trustScore=${trustScore} is not above ${POST_REWARD_THRESHOLD}; skipping post reward.`
        );
        return null;
      }

      const dynamicReward = this.getTrustScoreScaledPostReward(trustScore);
      console.log(
        `[RewardsOracle] Dynamic post reward computed for ${postId}: trustScore=${trustScore}, rewardWei=${dynamicReward.toString()}`
      );
      return dynamicReward;
    } catch (error) {
      console.error("[RewardsOracle] Failed to resolve dynamic post reward amount:", error);
      return null;
    }
  }

  private async executeReward(
    walletAddress: string,
    rewardAmount: bigint,
    eventId: string,
    eventType: string,
    userId?: string,
    enforceEligibility: boolean = true
  ): Promise<void> {
    try {
      await this.initialize();

      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      // Check user eligibility if userId is provided
      if (enforceEligibility && userId) {
        await connectDB();
        const user = await User.findById(userId).select("eligibleForRewards username").lean();
        
        if (!user) {
          console.warn(`[RewardsOracle] User not found: ${userId}`);
          return;
        }

        if (!user.eligibleForRewards) {
          console.log(
            `[RewardsOracle] User ${user.username} is not eligible for rewards. Event ${eventType} not rewarded.`
          );
          return;
        }
      }

      // Validate wallet address
      if (!ethers.isAddress(walletAddress)) {
        throw new Error(`Invalid wallet address: ${walletAddress}`);
      }

      // Check if event already rewarded
      const alreadyUsed = await this.contract.eventIdUsed(eventId);
      if (alreadyUsed) {
        console.warn(
          `[RewardsOracle] Event ${eventType} already rewarded:`,
          eventId
        );
        return;
      }

      // Call issueReward on contract
      const tx = await this.contract.issueReward(
        walletAddress,
        rewardAmount,
        eventId
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      console.log(
        `[RewardsOracle] ${eventType} reward issued. Tx Hash:`,
        receipt?.hash || tx.hash
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[RewardsOracle] Failed to issue ${eventType} reward:`,
        errorMessage
      );
      // Retry logic can be added here if needed
    }
  }

  /**
   * Award tokens when a user creates a post
   * Fires asynchronously - does not block API response
   * Only rewards if user is eligible
   */
  onPostCreated(walletAddress: string, postId: string, userId?: string): Promise<void> {
    return (async () => {
      const eventId = this.generateEventId("postCreated", postId);
      const rewardAmount = await this.resolvePostRewardAmount(postId);
      if (!rewardAmount) {
        return;
      }
      return this.executeReward(
        walletAddress,
        rewardAmount,
        eventId,
        "postCreated",
        userId,
        false
      );
    })().catch(console.error);
  }

  /**
   * Award tokens when a user upvotes a post
   * Fires asynchronously - does not block API response
   * Only rewards if user is eligible
   */
  onPostUpvoted(
    walletAddress: string,
    postId: string,
    voterId: string,
    userId?: string
  ): Promise<void> {
    const eventId = this.generateEventId("postUpvote", postId, voterId);
    return this.executeReward(
      walletAddress,
      REWARD_AMOUNTS.POST_UPVOTED,
      eventId,
      "postUpvote",
      userId
    ).catch(console.error);
  }

  /**
   * Award tokens when a user creates a comment
   * Fires asynchronously - does not block API response
   * Only rewards if user is eligible
   */
  onCommentCreated(walletAddress: string, commentId: string, userId?: string): Promise<void> {
    const eventId = this.generateEventId("commentCreated", commentId);
    return this.executeReward(
      walletAddress,
      REWARD_AMOUNTS.COMMENT_CREATED,
      eventId,
      "commentCreated",
      userId
    ).catch(console.error);
  }

  /**
   * Award tokens when a user upvotes a comment
   * Fires asynchronously - does not block API response
   * Only rewards if user is eligible
   */
  onCommentUpvoted(
    walletAddress: string,
    commentId: string,
    voterId: string,
    userId?: string
  ): Promise<void> {
    const eventId = this.generateEventId("commentUpvote", commentId, voterId);
    return this.executeReward(
      walletAddress,
      REWARD_AMOUNTS.COMMENT_UPVOTED,
      eventId,
      "commentUpvote",
      userId
    ).catch(console.error);
  }

  /**
   * Award tokens when a user joins a community
   * Fires asynchronously - does not block API response
   * Only rewards if user is eligible
   */
  onCommunityJoined(walletAddress: string, communitySlug: string, userId?: string): Promise<void> {
    const eventId = this.generateEventId("communityJoined", communitySlug);
    return this.executeReward(
      walletAddress,
      REWARD_AMOUNTS.COMMUNITY_JOINED,
      eventId,
      "communityJoined",
      userId
    ).catch(console.error);
  }

  /**
   * Award tokens for daily login
   * Fires asynchronously - does not block API response
   * Only rewards if user is eligible
   */
  onDailyLogin(walletAddress: string, userId?: string): Promise<void> {
    const dateKey = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const eventId = this.generateEventId("dailyLogin", walletAddress, dateKey);
    return this.executeReward(
      walletAddress,
      REWARD_AMOUNTS.DAILY_LOGIN,
      eventId,
      "dailyLogin",
      userId
    ).catch(console.error);
  }
}

// Export singleton instance
export const rewardsOracle = new RewardsOracleService();
