import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { FundMe } from '../../typechain-types';
import { expect } from 'chai';
import {
  getEthUsdPriceFeedAddress,
  getNetworkType,
} from '../../helper-hardhat-config';

// Timeout needed on testnet is LONG, this is set in hardhat.config.ts

getNetworkType(network.name) !== 'testnet'
  ? describe.skip
  : describe('FundMe Staging Tests', async () => {
      const sendValue = ethers.parseEther('0.1');
      const priceFeedAddress = getEthUsdPriceFeedAddress(network.name);
      let contract: FundMe;
      let deployer: string;

      before(async () => {
        // We don't need to deploy, as we're using the deployed contract on TestNet
        // await deployments.fixture(['FundMe']);
        ({ deployer } = await getNamedAccounts());
        const fundMeDeployment = await deployments.get('FundMe');
        contract = await ethers.getContractAt(
          'FundMe',
          fundMeDeployment.address,
        );
      });

      describe(`constructor`, async () => {
        it(`should set price feed address to supplied value`, async () => {
          const contractFeedAddress = await contract.getPriceFeed();
          expect(contractFeedAddress).to.equal(priceFeedAddress);
        });

        it(`should set owner to deployer`, async () => {
          const contractOwner = await contract.getOwner();
          expect(contractOwner).to.equal(deployer);
        });
      });

      describe('fund', async () => {
        it(`should allow funders to fund`, async () => {
          expect((await contract.getFunders()).length).to.equal(0);
          const fundTx = await contract.fund({ value: sendValue });
          await fundTx.wait();
          expect(await contract.getFunder(0)).to.equal(deployer);
          expect((await contract.getFunders()).length).to.equal(1);
        });
      });

      describe('withdraw', async () => {
        it(`should allow owner to withdraw`, async () => {
          // Setup
          const contractAddress = await contract.getAddress();
          const startingContractBalance =
            await ethers.provider.getBalance(contractAddress);
          const startingDeployerBalance =
            await ethers.provider.getBalance(deployer);
          // Test
          const transactionResponse = await contract.withdraw();
          const transactionReceipt = await transactionResponse.wait();
          if (!transactionReceipt) throw new Error('No transaction receipt');
          // Calculate gas cost as this will need to be deducted from the deployer's balance
          const gasCost =
            transactionReceipt.gasPrice * transactionReceipt.gasUsed;
          expect(await ethers.provider.getBalance(contractAddress)).to.equal(0);
          expect(await ethers.provider.getBalance(deployer)).to.equal(
            startingDeployerBalance - gasCost + startingContractBalance,
          );
          expect((await contract.getFunders()).length).to.equal(0);
        });
      });

      // describe('getConversionRate', async () => {
      //   it.only(`should return correct conversion rate`, async () => {
      //     // msg.value of 0.1ETH is 100000000000000000
      //     const conversionRate = await contract.getConversionRate(sendValue);
      //     console.log("conversionRate: ", conversionRate);
      //     // expect(conversionRate).to.equal(1);
      //   });
      // })

      // describe('isEnoughEth', async () => {
      //   it(`should return true w/ 0.1 ETH`, async () => {
      //     // msg.value of 0.1ETH is 100000000000000000
      //     const conversionRate = await contract.isEnoughEth(sendValue);
      //     console.log("conversionRate: ", conversionRate);
      //     // expect(conversionRate).to.equal(1);
      //   });
      // })
    });
