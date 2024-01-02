// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity ^0.8.19;
// 2. Imports
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { PriceConverter } from "./PriceConverterUtility.sol";

// 3. Interfaces, Libraries, Contracts
error FundMe__NotOwner();
error FundMe__InsufficientEth(string message);
error FundMe__WithdrawlFailed();

// NatSpec Comments
/**
 * @title A sample Funding Contract
 * @author Patrick Collins
 * @notice This contract is for creating a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    // using PriceConverter for uint256; // can extend uint256 via a library, or use utility library

    // State variables
    uint256 public constant MINIMUM_USD = 50 * 10**18;
    address private immutable OWNER;
    address[] private funders;
    mapping(address => uint256) private addressToAmountFunded;
    AggregatorV3Interface private priceFeed;

    // Events (we have none!)

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == i_owner);
        if (msg.sender != OWNER) revert FundMe__NotOwner();
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    // @notice parameterized constructor for price feed address
    constructor(address feedAddress) {
        priceFeed = AggregatorV3Interface(feedAddress);
        OWNER = msg.sender;
    }

    /// @notice Funds our contract based on the ETH/USD price
    function fund() public payable {
        uint256 valueInUsd = PriceConverter.getConversionRate(msg.value, priceFeed);
        if (valueInUsd < MINIMUM_USD) revert FundMe__InsufficientEth("You need to spend more ETH!");
        // require(PriceConverterUtility.getConversionRate(msg.value, s_priceFeed) >= MINIMUM_USD, 
        // "You need to spend more ETH!"
        // );
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);        
    }

    function withdraw() public onlyOwner {
        // read from storage ONCE to save gas/ iterate in-memory
        address[] memory inMemoryFunders = funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < inMemoryFunders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // reset funders array when we're done
        funders = new address[](0);
        // Transfer vs call vs Send
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = OWNER.call{value: address(this).balance}("");
        // require(success);
        if (!success) revert FundMe__WithdrawlFailed();
    }

    /** @notice Gets the amount that an address has funded
     *  @param fundingAddress the address of the funder
     *  @return the amount funded
     */
    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return addressToAmountFunded[fundingAddress];
    }

    // function getVersion() public view returns (uint256) {
    //     return s_priceFeed.version();
    // }

    function getFunders() public view returns (address[] memory) {
        return funders;
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getOwner() public view returns (address) {
        return OWNER;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }

    // Test only
    // function getConversionRate(uint256 ethAmount) public view returns (uint256) {
    //     return PriceConverterUtility.getConversionRate(ethAmount, s_priceFeed);
    // }

    // Test only
    // function isEnoughEth(uint256 ethAmount) public view returns (bool) {
    //     return PriceConverterUtility.getConversionRate(ethAmount, s_priceFeed) >= MINIMUM_USD;
    // }
}