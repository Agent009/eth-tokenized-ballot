import { viem } from "hardhat";
import { formatEther, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { ballotContractAddress, checkAddress, deployerAccount, publicClientFor, walletClientFor } from "@scripts/utils";

const CONTRACT_NAME = "TokenizedBallot";
const PROPOSAL_NAME_IDX = 0;
const PROPOSAL_VOTES_IDX = 1;

async function main() {
  // Fetch parameters
  const ARG_CONTRACT_ADDRESS_IDX = 0;
  const parameters = process.argv.slice(2);
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotContractAddress;
  checkAddress("ballot", contractAddress);

  // Fetch the contract
  const publicClient = await publicClientFor(sepolia);
  const [deployer] = await viem.getWalletClients();
  const deployerAddress = deployerAccount.address;
  const walletClient = walletClientFor(deployerAccount);
  const blockNumber = await publicClient.getBlockNumber();
  const balance = await publicClient.getBalance({
    address: deployer!.account.address,
  });
  console.log(
    `scripts -> ${CONTRACT_NAME} -> GetWinningProposal -> last block number`, 
    blockNumber, 
    "deployer", 
    deployerAddress, 
    "balance", 
    formatEther(balance), 
    walletClient.chain.nativeCurrency.symbol
  );

  // Get the winning proposal details
  const contract = await viem.getContractAt(CONTRACT_NAME, contractAddress);
  const proposalIndex = await contract.read.winningProposal();
  const proposal = await contract.read.proposals([BigInt(proposalIndex!)]);
  console.log(`scripts -> ${CONTRACT_NAME} -> GetWinningProposal -> idx`, proposalIndex, "name", hexToString(proposal[PROPOSAL_NAME_IDX]), "votes", proposal[PROPOSAL_VOTES_IDX]);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
