import { viem } from "hardhat";
import { formatEther } from "viem";
import { sepolia } from "viem/chains";
import { publicClientFor } from "@scripts/utils";

const CONTRACT_NAME = "BallotToken";

async function main() {
  const publicClient = await publicClientFor(sepolia);
  const [deployer] = await viem.getWalletClients();
  const deployerAccount = deployer!.account;
  const deployerAddress = deployerAccount.address;
  const blockNumber = await publicClient.getBlockNumber();
  const balance = await publicClient.getBalance({
    address: deployer!.account.address,
  });
  console.log(
    `scripts -> ${CONTRACT_NAME} -> Deploy -> last block number`, 
    blockNumber, 
    "deployer", 
    deployerAddress, 
    "balance", 
    formatEther(balance), 
    deployer!.chain.nativeCurrency.symbol
  );

  // console.log(`scripts -> ${CONTRACT_NAME} -> Deploy -> deploying contract`);
  const tokenContract = await viem.deployContract(CONTRACT_NAME);
  console.log(`scripts -> ${CONTRACT_NAME} -> Deploy -> contract deployed to`, tokenContract.address);

  const totalSupply = await tokenContract.read.totalSupply();
  console.log(`scripts -> ${CONTRACT_NAME} -> Deploy -> totalSupply`, { totalSupply });
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
