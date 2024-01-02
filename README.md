# Hardhat Fund Me
TypeScript, Solidity 0.8.19 FundMe contract with Chainlink Price Feed, based upon: https://github.com/PatrickAlphaC/hardhat-fund-me-fcc

# Getting Started

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`


## Quickstart

### Setup Development Environment

Clone the repository and install dependencies:
```
git clone --branch typescript https://github.com/coldfire84/hardhat-fund-me
cd hardhat-fund-me
yarn
yarn typechain
```

### Create .env file
Use the supplied .env.template file to create a new .env file.

Mandatory environment variables:
- SEPOLIA_URL: an Alchemy RPC endpoint (or other Node as a Service), sign-up here: [Alchemy](https://alchemy.com/)

Optional environment variables:
- ETHERSCAN_API_KEY: used to verify contracts on Etherscan, sign-up here: [Etherscan](https://etherscan.io)
- COINMARKETCAP_API_KEY: used for gas price estimation in FIAT, sign-up here: [Coin Market Cap](https://coinmarketcap.com)

### Encrypt Account Private Key

Storing Private Keys in a .env file is a bad idea.

One option is to encrypt your private key, and decrypt on-demand. This repository is setup to allow either 
- **(strongly recommended)** decryption using a password supplied at runtime or stored in the .env file, via `PRIVATE_KEY_PASSWORD` environment variable
- direct usage of the provate key via a `PRIVATE_KEY` environment variable (will flag a warning in the console)

You can encrypt a private key using the commands below:
```
export PRIVATE_KEY=<Wallet Private Key>
export PRIVATE_KEY_PASSWORD=<Desired Private Key Password>
yarn hardhat run scripts/encrypt-key.ts
export PRIVATE_KEY=
export PRIVATE_KEY_PASSWORD=
history -c
```
Alternatively, you can also store these keys in a third-party Key Management Service.


# Useage

## Deployment Scripts

`hardhat-deploy` will execute scripts in order (based upon file name), it will also track deployed contracts and skip them if they've already been deployed.

### Local Deployment
Execute deployment using the command `yarn hardhat deploy` to deploy to the local hardhat network.

### Testnet Deployment

You'll need to ensure you have testnet ETH and LINK
- for test ETH use [sepoliafaucet.com](https://sepoliafaucet.com/)
- for test LINK use [faucets.chain.link](https://faucets.chain.link/)

Execute deployment using the command: 
```
export PRIVATE_KEY_PASSWORD=<Desired Private Key Password> && yarn hardhat deploy` --network <network>
```
Where `<network>` is the name of the network you want to deploy to, e.g. 'sepolia'.


## Testing

```
yarn hardhat test
```

### Test Coverage

```
yarn hardhat coverage
```

## Linting

```
yarn lint
```

# Contract Interactions

## Scripts

After deploy to a testnet or local net, you can run the scripts. 

```
yarn hardhat run scripts/fund.ts
```

or
```
yarn hardhat run scripts/withdraw.ts
```

## Estimate gas

You can estimate how much gas things cost by running:

```
export REPORT_GAS=true && yarn hardhat test
```

And you'll see and output file called `gas-report.txt`

### Estimate gas cost in USD

To get a USD estimation of gas cost, you'll need a `COINMARKETCAP_API_KEY` environment variable. You can get one for free from [CoinMarketCap](https://pro.coinmarketcap.com/signup). 

Then, uncomment the line `coinmarketcap: COINMARKETCAP_API_KEY,` in `hardhat.config.ts` to get the USD estimation. Just note, everytime you run your tests it will use an API call, so it might make sense to have using coinmarketcap disabled until you need it. You can disable it by just commenting the line back out. 


## Verify on Etherscan

If you deploy to a testnet or mainnet, you can verify it if you get an [API Key](https://etherscan.io/myapikey) from Etherscan and set it as an environemnt variable named `ETHERSCAN_API_KEY`. You can pop it into your `.env` file as seen in the `.env.example`.

In it's current state, if you have your api key set, it will auto verify contracts!

However, you can manually verify with:

```
yarn hardhat verify --constructor-args <arguments> DEPLOYED_CONTRACT_ADDRESS
```