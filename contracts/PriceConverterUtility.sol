// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**  
 * @notice Uses ChainLink oracle to convert ETH to USD
*/
library PriceConverter {
  // ETH has 18 decimals in msg.value
  uint256 private constant ETH_DECIMALS = 1000000000000000000;

  function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed)
    internal
    view
    returns (uint256)
  {
    // Get the latest ETH/USD via Chainlink oracle; 8 decimal places as non-ETH pair
    (, int256 ethPrice, , , ) = priceFeed.latestRoundData();
    // Convert ethPrice to 18 decimal places, multiply by ethAmount, divide by 18 decimal places
    uint256 ethAmountInUsd = (uint256(ethPrice * 10000000000) * ethAmount) / ETH_DECIMALS;
    return ethAmountInUsd;
  }
}