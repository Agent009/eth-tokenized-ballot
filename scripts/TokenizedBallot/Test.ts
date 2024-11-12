import { viem } from "hardhat";
import { toHex, parseEther } from "viem";

const TOKEN_CONTRACT_NAME = "BallotToken";
const BALLOT_CONTRACT_NAME = "TokenizedBallot";
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
const MINT_AMOUNT = parseEther("100");

async function main() {
    const publicClient = await viem.getPublicClient();
    const [deployer, acc1] = await viem.getWalletClients();
    const deployerAccount = deployer!.account;
    const deployerAddress = deployerAccount.address;
    const acc1Account = acc1!.account;
    const acc1Address = acc1Account.address;
    // Deploy the token contract
    const token = await viem.deployContract(TOKEN_CONTRACT_NAME);
    let msgPrefix = `scripts -> ${TOKEN_CONTRACT_NAME} -> Test`;
    console.log(`${msgPrefix} -> deployed token contract to`, token.address);
    // Mint tokens for the first user
    const mintTokens = await token.write.mint([deployerAddress, MINT_AMOUNT]);
    await publicClient.waitForTransactionReceipt({ hash: mintTokens });
    console.log(`${msgPrefix} -> minted ${MINT_AMOUNT.toString()} decimal units to user 1: ${deployerAddress}`);
    // Get balance
    const balanceDeployer = await token.read.balanceOf([deployerAddress]);
    console.log(`${msgPrefix} -> balance of user 1 ${deployerAddress}: ${balanceDeployer}`);
    // Get the current and target block numbers
    let currentBlockNumber = await publicClient.getBlockNumber();
    const targetBlockNumber = currentBlockNumber + 1n;
    console.log(`${msgPrefix} -> current block`, currentBlockNumber, "target block", targetBlockNumber);
    
    // Deploy the tokenized ballot contract
    msgPrefix = `scripts -> ${BALLOT_CONTRACT_NAME} -> Test`;
    const ballot = await viem.deployContract(BALLOT_CONTRACT_NAME, [
        PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
        token.address,
        targetBlockNumber,
    ]);
    currentBlockNumber = await publicClient.getBlockNumber();
    console.log(`${msgPrefix} -> deployed ballot contract address`, ballot.address, "block", currentBlockNumber);
    // Mint tokens for the second user
    const mintTokens2 = await token.write.mint([acc1Address, MINT_AMOUNT]);
    await publicClient.waitForTransactionReceipt({ hash: mintTokens2 });
    currentBlockNumber = await publicClient.getBlockNumber();
    console.log(`${msgPrefix} -> minted ${MINT_AMOUNT.toString()} decimal units to user 2: ${acc1Address}`, "block", currentBlockNumber);

    // Getting voting power
    console.log(`${msgPrefix} -> getting voting power for user 1...`);
    const votingPower = await ballot.read.getVotePower([deployerAddress]);
    console.log(`${msgPrefix} -> Voting power of user 1 ${deployerAddress}: ${votingPower}`);

    const delegateTx = await token.write.delegate([acc1Address], { account: deployerAccount });
    await publicClient.waitForTransactionReceipt({ hash: delegateTx });
    currentBlockNumber = await publicClient.getBlockNumber();
    console.log(`${msgPrefix} -> delegated voting power to user 2 ${acc1Address}`, "block", currentBlockNumber);
    console.log(`${msgPrefix} -> getting voting power for user 2...`);
    const votingPowerAcc1 = await ballot.read.getVotePower([acc1Address]);
    console.log(`${msgPrefix} -> Voting power of user 2 ${acc1Address}: ${votingPowerAcc1}`);

    // Voting
    console.log(`${msgPrefix} -> Voting...`);
    const proposalIndex = 0n; // The index of the proposal you want to vote for
    const amountToVote = votingPower / 2n;
    const votingTx = await ballot.write.vote(
        [proposalIndex, amountToVote],
        { account: deployerAccount }
    );
    await publicClient.waitForTransactionReceipt({ hash: votingTx });
    currentBlockNumber = await publicClient.getBlockNumber();
    console.log(`${msgPrefix} -> voted ${amountToVote} on proposal ${proposalIndex}`, "tx", votingTx, "block", currentBlockNumber);

    const [winningProposal, winner] = await Promise.all([
        ballot.read.winningProposal(),
        ballot.read.winnerName()
    ]);
    console.log(`${msgPrefix} -> winning proposal`, winningProposal, "winner", winner);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
