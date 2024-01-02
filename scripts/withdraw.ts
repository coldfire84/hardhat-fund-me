import { deployments, ethers, getNamedAccounts } from 'hardhat';

async function main() {
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const fundMeDeployment = await deployments.get('FundMe');
  const fundMe = await ethers.getContractAt(
    'FundMe',
    fundMeDeployment.address,
    signer, // connect contract to 'deployer' account
  );
  console.log(`Got contract FundMe at ${fundMeDeployment.address}`);
  console.log('Withdrawing from contract...');
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait();
  console.log('Got it back!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
