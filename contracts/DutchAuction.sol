// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
contract DutchAuction {
    address payable public beneficiary;
    uint public auctionBeginTime;
    uint public auctionEndTime;
    uint public auctionDiscountRate;
    uint public auctionStartingPrice;
    uint public earliestBidTime;
    address public highestBidder;
    uint public highestBid;

    uint private constant waitTime = 600; // 10 minutes

    mapping(address => uint) pendingReturns;
    bool ended;
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    error AuctionNotYetBegan();
    error AuctionAlreadyEnded();
    error AuctionNotYetEnded();
    error AuctionEndAlreadyCalled();
    error BidNotHighEnough(uint highestBid);

    constructor(
        uint beginTime,
        uint endTime,
        uint discountRate,
        uint startingPrice,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        auctionBeginTime = block.timestamp + beginTime;
        auctionEndTime = block.timestamp + endTime;
        auctionDiscountRate = discountRate;
        auctionStartingPrice = startingPrice;
        require (startingPrice >= discountRate * (endTime - beginTime));
    }

    function getCurrentPrice() public view returns (uint price) {
        if (block.timestamp < auctionBeginTime)
            revert AuctionNotYetBegan();
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();
        uint timeElapsed = block.timestamp - auctionBeginTime;
        uint discount = auctionDiscountRate * timeElapsed;
        return auctionStartingPrice - discount;
    }

    function bid()
        external
        payable
    {
        if (block.timestamp < auctionBeginTime)
            revert AuctionNotYetBegan();
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();
        uint price = getCurrentPrice();
        if (msg.value < price)
            revert BidNotHighEnough(price);

        uint refund = msg.value - price;
        if (refund > 0) {
            pendingReturns[msg.sender] += refund;
        }
        highestBidder = msg.sender;
        highestBid = price;
        earliestBidTime = block.timestamp;
        emit HighestBidIncreased(msg.sender, price);
        auctionEnd();
    }

    function withdraw() external returns (bool success) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function auctionEnd() public {
        if (block.timestamp < auctionEndTime && highestBidder == address(0))
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionEndAlreadyCalled();
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        beneficiary.transfer(highestBid);
    }
}