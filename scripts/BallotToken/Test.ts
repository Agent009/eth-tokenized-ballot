import { viem } from "hardhat";
import { parseEther } from "@node_modules/viem";

const CONTRACT_NAME = "BallotToken";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> Test`;
const MINT_VALUE = parseEther("10");

/**
 * The main function orchestrates the deployment of a BallotToken contract, minting tokens,
 * checking voting power, self-delegating, and experimenting with token transfers.
 *
 * @remarks
 * This function uses the Hardhat EVM (Viem) to interact with the Ethereum blockchain.
 * It deploys the BallotToken contract, mints tokens to an account, checks the voting power of an account,
 * self-delegates the voting power, and transfers tokens between accounts.
 *
 * @returns {Promise<void>} - A promise that resolves when the main function completes.
 */
async function main(): Promise<void> {
  // Deploying contracts to HRE using Viem
  const publicClient = await viem.getPublicClient();
  // @ts-expect-error ignore
  const [deployer, acc1, acc2] = await viem.getWalletClients();
  const acc1Account = acc1!.account;
  const acc1Address = acc1Account.address;
  const acc2Account = acc2!.account;
  const acc2Address = acc2Account.address;
  const contract = await viem.deployContract(CONTRACT_NAME);
  let blockNo = await publicClient.getBlockNumber();
  console.log(`${MSG_PREFIX} -> Token contract deployed at ${contract.address}`, "block", blockNo);

  // Minting some tokens
  const mintTx = await contract.write.mint([acc1Address, MINT_VALUE]);
  await publicClient.waitForTransactionReceipt({ hash: mintTx });
  blockNo = await publicClient.getBlockNumber();
  console.log(`${MSG_PREFIX} -> Minted ${MINT_VALUE.toString()} decimal units to acc1`, "block", blockNo);
  const balanceBN = await contract.read.balanceOf([acc1Address]);
  console.log(`${MSG_PREFIX} -> acc1 has ${balanceBN.toString()} decimal units of BallotToken`);

  // Checking vote power
  const votes = await contract.read.getVotes([acc1Address]);
  console.log(`${MSG_PREFIX} -> acc1 has ${votes.toString()} units of voting power before self delegating`);

  // Self delegation transaction
  const delegateTx = await contract.write.delegate([acc1Address], { account: acc1Account });
  await publicClient.waitForTransactionReceipt({ hash: delegateTx });
  blockNo = await publicClient.getBlockNumber();
  const votesAfter = await contract.read.getVotes([acc1Address]);
  console.log(`${MSG_PREFIX} -> acc1 has ${votesAfter.toString()} units of voting power after self delegating`, "block", blockNo);

  // Experimenting a token transfer
  const transferTx = await contract.write.transfer([acc2Address, MINT_VALUE / 2n], { account: acc1Account });
  await publicClient.waitForTransactionReceipt({ hash: transferTx });
  blockNo = await publicClient.getBlockNumber();
  const votes1AfterTransfer = await contract.read.getVotes([acc1Address]);
  console.log(`${MSG_PREFIX} -> acc1 has ${votes1AfterTransfer.toString()} units of voting power after transferring`, "block", blockNo);
  const votes2AfterTransfer = await contract.read.getVotes([acc2Address]);
  console.log(`${MSG_PREFIX} -> acc2 has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer`);

  // Self delegation transaction
  const delegateTx2 = await contract.write.delegate([acc2Address], { account: acc2Account });
  await publicClient.waitForTransactionReceipt({ hash: delegateTx2 });
  blockNo = await publicClient.getBlockNumber();
  const votesAfter2 = await contract.read.getVotes([acc2Address]);
  console.log(`${MSG_PREFIX} -> acc2 has ${votesAfter2.toString()} units of voting power after self delegating`, "block", blockNo, "\n");

  // Checking past votes
  const lastBlockNumber = await publicClient.getBlockNumber();
  for (let index = lastBlockNumber - 1n; index > 0n; index--) {
    const pastVotes = await contract.read.getPastVotes([acc1Address, index]);
    console.log(`${MSG_PREFIX} -> acc1 had ${pastVotes.toString()} units of voting power at block ${index}`);
  }
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
