import { viem } from "hardhat";
import { sepolia } from "viem/chains";
import {
  bootstrap,
  checkAddress,
  checkParameters,
  checkNumber,
  ballotTokenContractAddress
} from "@scripts/utils";

const CONTRACT_NAME = "BallotToken";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> Mint`;

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
  console.log(`${MSG_PREFIX} -> target`, targetAddress, "amount", mintAmount);

  // Fetch the contract
  const { publicClient, walletClient } = await bootstrap(MSG_PREFIX, sepolia);

  // Get the proposal details
  const contract = await viem.getContractAt(CONTRACT_NAME, ballotTokenContractAddress, {
    client: {
      public: publicClient,
      wallet: walletClient
    }
  });
  const mintTx = await await contract.write.mint([targetAddress, BigInt(mintAmount as string)]);
  const mintReceipt = await publicClient.waitForTransactionReceipt({hash: mintTx});
  console.log(`${MSG_PREFIX} -> mintReceipt`, mintReceipt);

  const balanceBN = await contract.read.balanceOf([targetAddress]);
  console.log(
    `${MSG_PREFIX} -> target has ${balanceBN.toString()} decimal units of ${CONTRACT_NAME}`
  );
  const votes = await contract.read.getVotes([targetAddress]);
  console.log(`${MSG_PREFIX} -> target has ${votes.toString()} units of voting power.`);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
