import { deployments, ethers, network, getNamedAccounts } from 'hardhat';
import { FundMe } from '../../typechain-types';
import { expect } from 'chai';
import { getNetworkType } from '../../helper-hardhat-config';

// Timeout needed on testnet is LONG, this is set in hardhat.config.ts

getNetworkType(network.name) !== 'local'
  ? describe.skip
  : describe('FundMe Unit Tests', async () => {
      const sendValue = ethers.parseEther('0.1');
      let contract: FundMe;
      let deployer: string;
      let priceFeedAddress: string;

      beforeEach(async () => {
        // Always deploy the contract, using hardhat deploy, in order to benefit from mocks
        await deployments.fixture(['all']);
        ({ deployer } = await getNamedAccounts());
        // Store FundMe contract
        const fundMeDeployment = await deployments.get('FundMe');
        contract = await ethers.getContractAt(
          'FundMe',
          fundMeDeployment.address,
        );
        // Store mockv3Aggregator contract if needed
        const mockv3AggregatorDeployment =
          await deployments.get('MockV3Aggregator');
        // mockv3Aggregator = await ethers.getContractAt(
        //     "MockV3Aggregator",
        //     mockv3AggregatorDeployment.address
        // );
        priceFeedAddress = mockv3AggregatorDeployment.address;
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

      describe(`fund`, async () => {
        it(`should fail when insufficient ETH sent`, async () => {
          await expect(contract.fund()).to.be.revertedWithCustomError(
            contract,
            'FundMe__InsufficientEth',
          );
        });

        it(`should update balance with correct amount`, async () => {
          const contractAddress = await contract.getAddress();
          const previousBalance =
            await ethers.provider.getBalance(contractAddress);
          await contract.fund({ value: sendValue });
          const currentBalance =
            await ethers.provider.getBalance(contractAddress);
          expect(currentBalance).to.equal(previousBalance + sendValue);
        });

        it(`should add funder to funders array`, async () => {
          const fundTx = await contract.fund({ value: sendValue });
          await fundTx.wait();
          expect(await contract.getFunder(0)).to.equal(deployer);
        });

        it(`should update funders/ amount mapper with correct amount`, async () => {
          await contract.fund({ value: sendValue });
          const response = await contract.getAddressToAmountFunded(deployer);
          expect(response.toString()).to.equal(sendValue.toString());
        });
      });

      describe(`withdraw`, async () => {
        beforeEach(async () => {
          await contract.fund({ value: sendValue });
        });

        it(`should withdraw all funds when there is a single funder`, async () => {
          // Setup
          expect((await contract.getFunders()).length).to.equal(1);
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

        it(`should withdraw all funds when there are multiple funders`, async () => {
          // Setup
          const accounts = await ethers.getSigners();
          const numFunders = 6;
          for (let i = 1; i < 6; i++) {
            // connect to contract using different signer and send funds
            await contract.connect(accounts[i]).fund({ value: sendValue });
          }
          expect((await contract.getFunders()).length).to.equal(numFunders);
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
          // Check that all funders have 0 amount funded in the mapping
          for (let i = 1; i < numFunders; i++) {
            expect(
              await contract.getAddressToAmountFunded(accounts[i].address),
            ).to.equal(0);
          }
        });

        it(`should revert when caller is not owner`, async () => {
          // Setup
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          // Bind a contract to a different signer
          const attackerConnectedContract = contract.connect(attacker);
          // Test
          await expect(
            attackerConnectedContract.withdraw(),
          ).to.be.revertedWithCustomError(contract, 'FundMe__NotOwner');
        });
      });
    });
