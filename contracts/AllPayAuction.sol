// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
contract AllPayAuction {

    struct Bid {
        bytes32 blindedMessage;
        uint value;
    }

    address payable public beneficiary;
    uint public auctionBeginTime;
    uint public biddingEndTime;
    uint public auctionEndTime;
    address public highestBidder;
    uint public highestBid;
    uint public sumBids;

    mapping(address => uint) pendingReturns;
    mapping(address => Bid[]) allBids;
    bool ended;
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    error AuctionNotYetBegan();
    error BiddingAlreadyEnded();
    error AuctionAlreadyEnded();
    error BiddingNotYetEnded();
    error AuctionNotYetEnded();
    error BidNotHighEnough(uint highestBid);
    error AuctionEndAlreadyCalled();

    constructor(
        uint beginTime,
        uint biddingTime,
        uint endTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        auctionBeginTime = block.timestamp + beginTime;
        biddingEndTime = block.timestamp + biddingTime;
        auctionEndTime = block.timestamp + endTime;
    }

    function bid(bytes32 blindedMessage)
        external
        payable
    {
        if (block.timestamp < auctionBeginTime)
            revert AuctionNotYetBegan();
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();
        if (block.timestamp > biddingEndTime)
            revert BiddingAlreadyEnded();
        
        allBids[msg.sender].push(Bid({
            blindedMessage: blindedMessage,
            value: msg.value
        }));
    }

    function reveal(
        uint [] calldata values,
        bool[] calldata fakes,
        bytes32[] calldata secrets
    )
        external
    {
        if (block.timestamp < biddingEndTime)
            revert BiddingNotYetEnded();
        if (block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();
        uint length = allBids[msg.sender].length;
        require(values.length == length);
        require(fakes.length == length);
        require(secrets.length == length);

        uint refund = 0;
        uint currentMax = 0;
        for (uint i = 0; i < length; i++) {
            Bid storage currenctBid = allBids[msg.sender][i];
            uint value = values[i];
            bool fake = fakes[i];
            bytes32 secret = secrets[i];
            if (currenctBid.blindedMessage != keccak256(abi.encodePacked(value, fake, secret))) {
                continue;
            }
            refund += currenctBid.value;
            if (!fake) {
                executeBid(msg.sender, value);
                if (value >= currentMax) currentMax = value;
            }
            currenctBid.blindedMessage = bytes32(0);
        }
        refund -= currentMax;
        sumBids += currentMax;
        payable(msg.sender).transfer(refund);
    }

    function auctionEnd() external {
        if (block.timestamp < auctionEndTime)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionEndAlreadyCalled();
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        beneficiary.transfer(sumBids);
    }

    function executeBid(address bidder, uint value) internal {
        if (value <= highestBid) return;
        highestBidder = bidder;
        highestBid = value;
    }
}