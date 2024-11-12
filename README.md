# Tokenized Ballot

Based on [OpenZeppelin ERC20Votes](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#ERC20Votes).

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
```

## BallotToken

This contract holds the tokens that are used in the ballot.

### Testing

```bash
npm run token:deploy:test # deploy locally for testing purposes
```

### Deployment

To begin, deploy the contract:

```bash
npm run token:deploy # deploy to testnet
```

Then, store the token contract address in the `BALLOT_TOKEN_SEPOLIA` environment variable for consequent operations.

### Minting

```bash
npm run token:mint TARGET_ADDRESS MINT_AMOUNT
```

For example:

```bash
npm run token:mint 0x0B5455BaC0f3795b5927f37BC545c3eAE08c8b4a 1000000000000000000000
```

## TokenizedBallot

This contract offers the tokenized ballot functionality.
You must have the `BallotToken` contract deployed in order to utilise this properly.

### Testing

```bash
npm run ballot:deploy:test # deploy locally for testing purposes
```

### Deployment

Run the following command, replacing `TOKEN_CONTRACT_ADDRESS` with the `BALLOT_TOKEN_SEPOLIA` environment variable value, the `BLOCK_NO` with the block to pick the winning votes from, and then a list of proposal names separated by spaces.

```bash
npm run ballot:deploy TOKEN_CONTRACT_ADDRESS BLOCK_NO PROPOSAL_1 PROPOSAL_2 ...  # deploy to testnet
```

If `env` is provided as the `TOKEN_CONTRACT_ADDRESS`, then the address is automatically taken from the `BALLOT_TOKEN_SEPOLIA` environment variable.

```bash
npm run ballot:deploy env 3 PROPOSAL_1 PROPOSAL_2 ... 
```

### Delegate

### Vote

### Other Scripts

```bash
npm run ballot:get-proposal PROPOSAL_INDEX BALLOT_CONTRACT_ADDRESS
npm run ballot:get-winning-proposal BALLOT_CONTRACT_ADDRESS
```

For example:

```bash
npm run ballot:get-proposal 0
npm run ballot:get-winning-proposal
```
