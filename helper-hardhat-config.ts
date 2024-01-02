type NetworkType = 'local' | 'testnet' | 'mainnet';

interface NetworkConfig {
  type: NetworkType;
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}

// Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
const networkConfig: { [key: string]: NetworkConfig } = {
  // Local Development
  localhost: {
    type: 'local',
  },
  hardhat: {
    type: 'local',
  },
  // Sepolia
  sepolia: {
    type: 'testnet',
    ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
    blockConfirmations: 5,
  },
};

export function getEthUsdPriceFeedAddress(
  networkName: string,
): string | undefined {
  const network = networkConfig[networkName];
  return network?.ethUsdPriceFeed;
}

export function getBlockConfirmations(networkName: string): number | undefined {
  const network = networkConfig[networkName];
  return network?.blockConfirmations;
}

export function getNetworkType(networkName: string): NetworkType | undefined {
  const network = networkConfig[networkName];
  return network?.type;
}
