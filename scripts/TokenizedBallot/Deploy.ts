import { viem } from "hardhat";
import { formatEther, toHex } from "viem";
import { sepolia } from "viem/chains";
import { constants } from "@lib/constants";
import { checkAddress, checkNumber, checkParameters, deployerAccount, publicClientFor, walletClientFor } from "@scripts/utils";

const CONTRACT_NAME = "TokenizedBallot";

async function main() {
  // Fetch parameters
  const ARG_TOKEN_ADDRESS_IDX = 0;
  const ARG_BLOCK_NO_IDX = 1;
  const ARG_PROPOSAL_NAMES_START_IDX = 2;
  const parameters = process.argv.slice(2);
  // If "env" is provided as the token address, then we get the address from the environment variables.
  const tokenAddressVal = parameters[ARG_TOKEN_ADDRESS_IDX];
  const tokenAddress = tokenAddressVal === "env" ? constants.contracts.ballotToken.sepolia : tokenAddressVal as `0x${string}`;
  const blockNo = parameters[ARG_BLOCK_NO_IDX];
  checkParameters(parameters, 3, "Please provide the token address, the block no and the proposal names.");
  checkAddress("token", tokenAddress);
  checkNumber("block number", blockNo);

  const proposals: string[] = [];
  
  for (let i = ARG_PROPOSAL_NAMES_START_IDX; i < parameters.length; i++) {
    if (parameters[i] !== undefined && typeof parameters[i] === 'string') {
      // @ts-expect-error ignore
      proposals.push(parameters[i]);
    }
  }

  if (!proposals.length) throw new Error(`scripts -> ${CONTRACT_NAME} -> Deploy -> No proposals were provided.`);
  
  // Deploy the contract
  const publicClient = await publicClientFor(sepolia);
  const deployerAddress = deployerAccount.address;
  const walletClient = walletClientFor(deployerAccount);
  const blockNumber = await publicClient.getBlockNumber();
  const balance = await publicClient.getBalance({
    address: deployerAddress,
  });
  console.log(
    `scripts -> ${CONTRACT_NAME} -> Deploy -> last block number`, 
    blockNumber, 
    "deployer", 
    deployerAddress, 
    "balance", 
    formatEther(balance), 
    walletClient.chain.nativeCurrency.symbol
  );

  // console.log(`scripts -> ${CONTRACT_NAME} -> Deploy -> deploying contract`);
  const tokenContract = await viem.deployContract(CONTRACT_NAME as never, [
    proposals.map((prop) => toHex(prop, { size: 32 }))
  ]);
  console.log(`scripts -> ${CONTRACT_NAME} -> Deploy -> contract deployed to`, tokenContract.address);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
