import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { getNetworkType } from '../helper-hardhat-config';

const DECIMALS = '18';
const INITIAL_PRICE = '2000000000000000000000'; // 2000 USD

// No need for main function/ calling of the main function
const deploy: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  // If we are on a local development network, we need to deploy mocks!
  if (getNetworkType(network.name) === 'local') {
    log('Development network detected, deploying mocks...');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE], // constructor arguments, identified from source code/ GitHub
    });
    log('Mocks Deployed!');
    log('----------------------------------');
    log(
      "You are deploying to a local network, you'll need a local network running to interact",
    );
    log(
      'Please run `yarn hardhat console` to interact with the deployed smart contracts!',
    );
    log('----------------------------------');
  } else {
    log('Network not a development network, no need to deploy mocks');
  }
};
export default deploy;
deploy.tags = ['all', 'mocks'];
