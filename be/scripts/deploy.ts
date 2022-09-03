import { ethers } from "hardhat";

async function main() {
  const faucetFactory = await ethers.getContractFactory("Faucet");
  console.log("Deploying contract...");
  const faucet = await faucetFactory.deploy();
  console.log(`Deployed contract to: ${faucet.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
