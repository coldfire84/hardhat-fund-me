import { ethers, getNamedAccounts, deployments } from 'hardhat';

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
  console.log('Funding contract...');
  const transactionResponse = await fundMe.fund({
    value: ethers.parseEther('0.05'),
  });
  await transactionResponse.wait();
  console.log('Funded!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
