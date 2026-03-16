import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.warn("DEPLOYER_PRIVATE_KEY is not set. The current signer from the selected Hardhat network will be used.");
  }

  const [deployer, fallbackOracle] = await ethers.getSigners();

  const isLocalNetwork = network.name === "hardhat" || network.name === "localhost";

  let oracleWallet = process.env.ORACLE_WALLET_ADDRESS;
  if (!oracleWallet || !ethers.isAddress(oracleWallet)) {
    if (isLocalNetwork) {
      oracleWallet = fallbackOracle.address;
      console.warn(`ORACLE_WALLET_ADDRESS not set. Using local fallback oracle: ${oracleWallet}`);
    } else {
      throw new Error("ORACLE_WALLET_ADDRESS is missing or invalid in environment variables.");
    }
  }

  console.log("Deploying contracts with:", deployer.address);

  const TokenFactory = await ethers.getContractFactory("MediPearsToken");
  const token = await TokenFactory.deploy(deployer.address);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  const ControllerFactory = await ethers.getContractFactory("RewardsController");
  const maxRewardPerEvent = ethers.parseEther("1000");
  const maxRewardsPerUser = ethers.parseEther("10000");

  const controller = await ControllerFactory.deploy(
    tokenAddress,
    deployer.address,
    oracleWallet,
    maxRewardPerEvent,
    maxRewardsPerUser
  );
  await controller.waitForDeployment();

  const controllerAddress = await controller.getAddress();

  const VaultFactory = await ethers.getContractFactory("RewardsVault");
  const vault = await VaultFactory.deploy(tokenAddress, deployer.address);
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();

  const tx = await token.setRewardsController(controllerAddress);
  await tx.wait();

  console.log("MediPearsToken deployed at:", tokenAddress);
  console.log("RewardsController deployed at:", controllerAddress);
  console.log("RewardsVault deployed at:", vaultAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
