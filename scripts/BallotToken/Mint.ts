import { viem } from "hardhat";
import { formatEther } from "viem";
import { sepolia } from "viem/chains";
import {
  checkAddress,
  checkParameters,
  checkNumber,
  deployerAccount,
  ballotTokenContractAddress,
  publicClientFor,
  walletClientFor
} from "@scripts/utils";

const CONTRACT_NAME = "BallotToken";

async function main() {
  // Fetch parameters
  const ARG_TARGET_ADDRESS_IDX = 0;
  const ARG_MINT_AMOUNT_IDX = 1;
  const parameters = process.argv.slice(2);
  const targetAddress = parameters[ARG_TARGET_ADDRESS_IDX] as `0x${string}`;
  const mintAmount = parameters[ARG_MINT_AMOUNT_IDX];
  checkParameters(parameters, 2, "You must provide the target user address and the mint amount.");
  checkAddress("target user", targetAddress);
  checkNumber("mint amount", mintAmount);
  console.log(`scripts -> ${CONTRACT_NAME} -> Mint -> target`, targetAddress, "amount", mintAmount);

  // Fetch the contract
  const publicClient = await publicClientFor(sepolia);
  const deployerAddress = deployerAccount.address;
  const walletClient = walletClientFor(deployerAccount);
  const blockNumber = await publicClient.getBlockNumber();
  const balance = await publicClient.getBalance({
    address: deployerAccount.address,
  });
  console.log(
    `scripts -> ${CONTRACT_NAME} -> Mint -> last block number`, 
    blockNumber, 
    "deployer", 
    deployerAddress, 
    "balance", 
    formatEther(balance), 
    walletClient.chain.nativeCurrency.symbol
  );

  // Get the proposal details
  const contract = await viem.getContractAt(CONTRACT_NAME, ballotTokenContractAddress, {
    client: {
      public: publicClient,
      wallet: walletClient
    }
  });
  const mintTx = await await contract.write.mint([targetAddress, BigInt(mintAmount as string)]);
  const mintReceipt = await publicClient.waitForTransactionReceipt({hash: mintTx});
  console.log(`scripts -> ${CONTRACT_NAME} -> Mint -> mintReceipt`, mintReceipt);

  const balanceBN = await contract.read.balanceOf([targetAddress]);
  console.log(
    `scripts -> ${CONTRACT_NAME} -> Mint -> target has ${balanceBN.toString()} decimal units of ${CONTRACT_NAME}`
  );
  const votes = await contract.read.getVotes([targetAddress]);
  console.log(`scripts -> ${CONTRACT_NAME} -> Mint -> target has ${votes.toString()} units of voting power.`);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
