import { viem } from "hardhat";
import { formatEther, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { ballotContractAddress, checkAddress, checkNumber, checkParameters, publicClientFor } from "@scripts/utils";

const CONTRACT_NAME = "TokenizedBallot";
const PROPOSAL_NAME_IDX = 0;
const PROPOSAL_VOTES_IDX = 1;

async function main() {
  // Fetch parameters
  const ARG_PROPOSAL_NO_IDX = 0;
  const ARG_CONTRACT_ADDRESS_IDX = 1;
  const parameters = process.argv.slice(2);
  const proposalIndex = parameters[ARG_PROPOSAL_NO_IDX];
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotContractAddress;
  checkParameters(parameters, 2, "You must at least provide the proposal ID.");
  checkAddress("ballot", contractAddress);
  checkNumber("proposal index", proposalIndex);

  // Fetch the contract
  const publicClient = await publicClientFor(sepolia);
  const [deployer] = await viem.getWalletClients();
  const deployerAccount = deployer!.account;
  const deployerAddress = deployerAccount.address;
  const blockNumber = await publicClient.getBlockNumber();
  const balance = await publicClient.getBalance({
    address: deployer!.account.address,
  });
  console.log(
    `scripts -> ${CONTRACT_NAME} -> GetProposal -> last block number`, 
    blockNumber, 
    "deployer", 
    deployerAddress, 
    "balance", 
    formatEther(balance), 
    deployer!.chain.nativeCurrency.symbol
  );

  // Get the proposal details
  const contract = await viem.getContractAt(CONTRACT_NAME, contractAddress, {
    client: {
      public: publicClient,
      wallet: walletClient
    });
  const proposal = await contract.read.proposals([BigInt(proposalIndex!)]);
  console.log(`scripts -> ${CONTRACT_NAME} -> GetProposal -> idx`, proposalIndex, "name", hexToString(proposal[PROPOSAL_NAME_IDX]), "votes", proposal[PROPOSAL_VOTES_IDX]);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
