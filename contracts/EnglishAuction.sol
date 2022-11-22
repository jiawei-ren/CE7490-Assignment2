// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
contract EnglishAuction {
    address payable public beneficiary;
    uint public auctionBeginTime;
    uint public auctionEndTime;
    address public highestBidder;
    uint public highestBid;

    mapping(address => uint) pendingReturns;
    bool ended;
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    error AuctionNotYetBegan();
    error AuctionAlreadyEnded();
    error AuctionNotYetEnded();
    error BidNotHighEnough(uint highestBid);
    error AuctionEndAlreadyCalled();

    constructor(
        uint beginTime,
        uint endTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        auctionBeginTime = block.timestamp + beginTime;
        auctionEndTime = block.timestamp + endTime;
    }

    function bid()
        external
        payable
    {
        if (block.timestamp < auctionBeginTime)
            revert AuctionNotYetBegan();
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();
        if (msg.value <= highestBid)
            revert BidNotHighEnough(highestBid);

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
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

    function auctionEnd() external {
        if (block.timestamp < auctionEndTime)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionEndAlreadyCalled();
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        beneficiary.transfer(highestBid);
    }
}