import { viem } from "hardhat";
import { sepolia } from "viem/chains";
import { bootstrap } from "@scripts/utils";

const CONTRACT_NAME = "BallotToken";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> Deploy`;

async function main() {
  const { publicClient, walletClient } = await bootstrap(MSG_PREFIX, sepolia);

  // console.log(`scripts -> ${CONTRACT_NAME} -> Deploy -> deploying contract`);
  const tokenContract = await viem.deployContract(CONTRACT_NAME, [], {
    client: {
      public: publicClient,
      wallet: walletClient
    }
  });
  console.log(`${MSG_PREFIX} -> contract deployed to`, tokenContract.address);

  const totalSupply = await tokenContract.read.totalSupply();
  console.log(`${MSG_PREFIX} -> totalSupply`, { totalSupply });
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
