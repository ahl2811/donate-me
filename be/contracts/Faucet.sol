// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.8;

// Import this file to use console.log
import "hardhat/console.sol";

error NotOwner();

contract Faucet {
    mapping(address => uint256) addressToAmountFunded;
    uint256 public constant MINIMUM_ETH = 1;
    address public immutable i_owner;

    event funded(uint256 amount, address from);

    constructor() {
        i_owner = msg.sender; // The user that deployed the contract
    }

    function fund() public payable {
        // require(msg.value >= MINIMUM_ETH, "You need to spend more ETH");

        address funderAddress = msg.sender;
        addressToAmountFunded[funderAddress] += msg.value;

        emit funded(msg.value, msg.sender);
    }

    function checkExistFunder(address funderAddress)
        internal
        view
        returns (bool)
    {
        return
            abi.encodePacked(addressToAmountFunded[funderAddress]).length > 0
                ? true
                : false;
    }

    function getFundedAmount() external view returns (uint256) {
        address funderAddress = msg.sender;
        return
            checkExistFunder(funderAddress)
                ? addressToAmountFunded[funderAddress]
                : 0;
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert NotOwner();
        _;
    }

    function withdraw() external payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
}

// Concepts didn't cover yet:
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
