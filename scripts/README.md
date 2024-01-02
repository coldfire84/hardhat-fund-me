# Scripts
Use scripts to interact with contracts after they've been deployed.

## Encrypt-Key
Execute the script using the commands: 
```
PRIVATE_KEY=<Wallet Private Key>
PRIVATE_KEY_PASSWORD=<Desired Private Key Password>
yarn hardhat run scripts/encrypt-key.ts

# clear history
history -c
``` 

You can then supply the password only at runtime, using:
```
export PRIVATE_KEY_PASSWORD=<Desired Private Key Password>
yarn hardhat <command>
```

## Fund
> Note, you will need to supplied a private key password/ private key if using a non-local/ development network (e.g. any testnet/ mainnet)

Execute the script using the command `yarn hardhat run scripts/fund.ts`.

## Withdraw
> Note, you will need to supplied a private key password/ private key if using a non-local/ development network (e.g. any testnet/ mainnet)

Execute the script using the command `yarn hardhat run scripts/withdraw.ts`.