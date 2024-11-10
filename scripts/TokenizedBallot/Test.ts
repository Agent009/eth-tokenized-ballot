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
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> token contract address`, token.address);
    // Mint tokens for the first user
    const mintTokens = await token.write.mint([deployerAddress, MINT_AMOUNT]);
    await publicClient.waitForTransactionReceipt({ hash: mintTokens });
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> minted ${MINT_AMOUNT.toString()} decimal units to user 1 account: ${deployerAddress}`);
    // Get balance
    const balanceDeployer = await token.read.balanceOf([deployerAddress]);
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> balance of user 1 ${deployerAddress}: ${balanceDeployer}`);
    // Get the current and target block numbers
    const currentBlockNumber = await publicClient.getBlockNumber();
    const targetBlockNumber = currentBlockNumber + 1n;
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> Current block number`, currentBlockNumber);
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> Target block number`, targetBlockNumber);
    
    // Deploy the tokenized ballot contract
    const ballot = await viem.deployContract(BALLOT_CONTRACT_NAME, [
        PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
        token.address,
        targetBlockNumber,
    ]);
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> tokenized ballot contract address`, ballot.address);
    // Mint tokens for the second user
    const mintTokens2 = await token.write.mint([acc1Address, MINT_AMOUNT]);
    await publicClient.waitForTransactionReceipt({ hash: mintTokens2 });
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> minted ${MINT_AMOUNT.toString()} decimal units to user 2 account: ${acc1Address}`);

    // Getting voting power
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> getting voting power for user 1...`);
    const votingPower = await ballot.read.getVotePower([deployerAddress]);
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> Voting power of user 1 ${deployerAddress}: ${votingPower}`);

    const delegateTx = await token.write.delegate([
        acc1Address],
        { account: deployerAccount }
    );
    await publicClient.waitForTransactionReceipt({ hash: delegateTx });
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> delegated voting power to user 1 ${deployerAddress}`);

    // Voting
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> Voting...`);
    const proposalIndex = 0n; // The index of the proposal you want to vote for
    const amountToVote = votingPower / 2n;
    const votingTx = await ballot.write.vote(
        [proposalIndex, amountToVote],
        { account: deployerAccount }
    );
    await publicClient.waitForTransactionReceipt({ hash: votingTx });
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> vote transaction hash: ${votingTx}`);

    const winningProposal = await ballot.read.winningProposal();
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> winning proposal: ${winningProposal}`);

    const winner = await ballot.read.winnerName();
    console.log(`${TOKEN_CONTRACT_NAME} -> TokenizedScript -> winner: ${winner}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
