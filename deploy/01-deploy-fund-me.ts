import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  getBlockConfirmations,
  getEthUsdPriceFeedAddress,
  getNetworkType,
} from '../helper-hardhat-config';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verify-contract';

// No need for main function/ calling of the main function
const deploy: DeployFunction = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts(); // uses named 'deployer' account from hardhat.config.ts 'namedAccounts'
  // Get ChainLink price feed address based on network
  let ethUsdPriceFeedAddress = getEthUsdPriceFeedAddress(network.name);
  // If we're on a development network, use a mock price feed
  if (!ethUsdPriceFeedAddress && getNetworkType(network.name) === 'local') {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  }
  // Throw error if no ETH/USD price feed address at this point
  if (!ethUsdPriceFeedAddress) {
    throw new Error('Undefined ETH/USD price feed address/ unknown network');
  }
  // Deploy and verify contract
  const args = [ethUsdPriceFeedAddress];
  log('----------------------------------------------------');
  log(
    'Price feed address for network: ' +
      network.name +
      ' is: ' +
      ethUsdPriceFeedAddress,
  );
  log('Deploying FundMe and waiting for confirmations...');
  const result = await deploy('FundMe', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: getBlockConfirmations(network.name) || 1,
  });
  log(`Contract deployed to ${result.address}`);
  log('----------------------------------------------------');
  // Verify only if not on a development network
  if (getNetworkType(network.name) !== 'local') {
    log('----------------------------------------------------');
    log('Verifying contract on Etherscan...');
    await verifyContract(result.address, args);
  }
};
deploy.tags = ['all', 'FundMe'];
export default deploy;
