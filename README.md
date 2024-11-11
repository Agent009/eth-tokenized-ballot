# Tokenized Ballot

Based on [OpenZeppelin ERC20Votes](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#ERC20Votes).

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
```

## TokenizedBallot

### Scripts

```bash
npm run token:deploy:test # deploy locally for testing purposes
npm run token:deploy # deploy to testnet
npm run ballot:deploy:test # deploy locally for testing purposes
npm run ballot:deploy # deploy to testnet
```

The process is to first deploy the ballot token contract:

```bash
npm run token:deploy
```

The token address should then be set in the `BALLOT_TOKEN_SEPOLIA` environment variable for easier future cross-referencing.

Next, the ballot contract needs to be deployed:

```bash
npm run ballot:deploy TOKEN_CONTRACT_ADDRESS BLOCK_NO PROPOSAL_1 PROPOSAL_2 ... 
```

If `env` is provided as the `TOKEN_CONTRACT_ADDRESS`, then the address is taken from the `BALLOT_TOKEN_SEPOLIA` environment variable.

```bash
npm run ballot:deploy env 3 PROPOSAL_1 PROPOSAL_2 ... 
```