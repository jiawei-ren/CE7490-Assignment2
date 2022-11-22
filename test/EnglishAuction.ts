import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("EnglishAuction", function () {
  it("Testing English auction", async function () {;

    const Auction = await hre.ethers.getContractFactory("EnglishAuction");
    
    
    // Correctness test
    const biddingPeriod = 100;
    const biddingEndTime = (await time.latest()) + biddingPeriod + 10;

    const [
        beneficiary, 
        bidder1, 
        bidder2,
        bidder3,
        bidder4,
    ] = await ethers.getSigners();

    const auction = await Auction.deploy(0, biddingPeriod, beneficiary.address);

    // bidding phase
    await auction.connect(bidder1).bid({value: 10});
    await auction.connect(bidder2).bid({value: 20});
    await auction.connect(bidder3).bid({value: 30});
    await expect(auction.connect(bidder4).bid({value: 10})).to.be.reverted; //lower than highest bid

    // bidding ends
    await expect(auction.auctionEnd()).to.be.reverted; //too early
    await time.increaseTo(biddingEndTime);
    await auction.auctionEnd();
    expect(await auction.highestBid()).to.equal(30);

    // withdraw phase
    await auction.connect(bidder1).withdraw();
    await auction.connect(bidder2).withdraw();
    await auction.connect(bidder3).withdraw();
    
    // Multiple random test
    const testRound = 20;
    for (var i = 1; i <= testRound; i++) {
      const biddingPeriod = 100;
      const biddingEndTime = (await time.latest()) + biddingPeriod + 10;

      const [
          beneficiary, 
          bidder1, 
          bidder2,
          bidder3,
          bidder4,
          bidder5,
      ] = await ethers.getSigners();

      const auction = await Auction.deploy(0, biddingPeriod, beneficiary.address);

      var curMax = 0;

      // bidding phase
      var value1 = Math.ceil(Math.random() * 1000);
      var value2 = Math.ceil(Math.random() * 1000);
      var value3 = Math.ceil(Math.random() * 1000);
      var value4 = Math.ceil(Math.random() * 1000);
      var value5 = Math.ceil(Math.random() * 1000);

      if (value1 > curMax) {
        await auction.connect(bidder1).bid({value: value1});
        curMax = value1;
      }
      else {
        await expect(auction.connect(bidder1).bid({value: value1})).to.be.reverted;
      }

      if (value2 > curMax) {
        await auction.connect(bidder1).bid({value: value2});
        curMax = value2;
      }
      else {
        await expect(auction.connect(bidder2).bid({value: value2})).to.be.reverted;
      }

      if (value3 > curMax) {
        await auction.connect(bidder3).bid({value: value3});
        curMax = value3;
      }
      else {
        await expect(auction.connect(bidder3).bid({value: value3})).to.be.reverted;
      }

      if (value4 > curMax) {
        await auction.connect(bidder4).bid({value: value4});
        curMax = value4;
      }
      else {
        await expect(auction.connect(bidder4).bid({value: value4})).to.be.reverted;
      }

      if (value5 > curMax) {
        await auction.connect(bidder5).bid({value: value5});
        curMax = value5;
      }
      else {
        await expect(auction.connect(bidder5).bid({value: value5})).to.be.reverted;
      }

      // bidding ends
      await time.increaseTo(biddingEndTime);
      await auction.auctionEnd();
      expect(await auction.highestBid()).to.equal(curMax);

      // withdraw phase
      await auction.connect(bidder1).withdraw();
      await auction.connect(bidder2).withdraw();
      await auction.connect(bidder3).withdraw();
      await auction.connect(bidder4).withdraw();
      await auction.connect(bidder5).withdraw();
    }
    
  });
});