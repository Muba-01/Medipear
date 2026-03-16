import * as dotenv from "dotenv";
import { isAddress } from "ethers";

dotenv.config();

const mode = (process.argv[2] ?? "hardhat").toLowerCase();

function isValidPrivateKey(value: string | undefined): value is string {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);
}

function fail(message: string): never {
  console.error(`[preflight] ${message}`);
  process.exit(1);
}

function info(message: string): void {
  console.log(`[preflight] ${message}`);
}

function warn(message: string): void {
  console.warn(`[preflight] ${message}`);
}

if (mode === "sepolia") {
  const deployerPk = process.env.DEPLOYER_PRIVATE_KEY;
  const oracleAddress = process.env.ORACLE_WALLET_ADDRESS;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!isValidPrivateKey(deployerPk)) {
    fail("DEPLOYER_PRIVATE_KEY must be a 0x-prefixed 64-byte hex private key for sepolia deploy.");
  }

  if (!oracleAddress || !isAddress(oracleAddress)) {
    fail("ORACLE_WALLET_ADDRESS must be set to a valid EVM address for sepolia deploy.");
  }

  if (!rpcUrl || !/^https?:\/\//i.test(rpcUrl)) {
    fail("SEPOLIA_RPC_URL must be set to a valid HTTP(S) RPC URL for sepolia deploy.");
  }

  info("Sepolia environment variables look good.");
  process.exit(0);
}

if (mode === "hardhat" || mode === "localhost") {
  const deployerPk = process.env.DEPLOYER_PRIVATE_KEY;
  const oracleAddress = process.env.ORACLE_WALLET_ADDRESS;

  if (!deployerPk) {
    warn("DEPLOYER_PRIVATE_KEY is not set; local hardhat signer fallback will be used.");
  } else if (!isValidPrivateKey(deployerPk)) {
    fail("DEPLOYER_PRIVATE_KEY is set but invalid. Use a 0x-prefixed 64-byte hex private key.");
  }

  if (!oracleAddress) {
    warn("ORACLE_WALLET_ADDRESS is not set; deploy script will use local fallback oracle on hardhat/localhost networks.");
  } else if (!isAddress(oracleAddress)) {
    warn("ORACLE_WALLET_ADDRESS is set but invalid; deploy script will ignore it and use local fallback oracle on hardhat/localhost networks.");
  }

  info("Local deploy preflight checks passed.");
  process.exit(0);
}

fail(`Unsupported preflight mode: ${mode}. Use one of: hardhat, localhost, sepolia.`);
