import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("DutchAuction", function () {
  it("Testing dutch auction", async function () {;

    const Auction = await hre.ethers.getContractFactory("DutchAuction");

    // Correctness test
    const biddingPeriod = 100;
    const biddingSuccTime = (await time.latest()) + 20;

    const [
        beneficiary, 
        bidder1, 
        bidder2,
        bidder3,
    ] = await ethers.getSigners();

    const auction = await Auction.deploy(0, biddingPeriod, 10, 1000, beneficiary.address);

    // bidding phase
    await (time.increaseTo(biddingSuccTime));
    await expect(auction.connect(bidder1).bid({value: 10})).to.be.reverted; // lower than current value
    await auction.connect(bidder2).bid({value: 900});

    // bidding ends
    await expect(auction.auctionEnd()).to.be.reverted; // already called

    // withdraw phase
    await auction.connect(bidder1).withdraw();
    await auction.connect(bidder2).withdraw();
    await auction.connect(bidder3).withdraw();

    // Multiple random test
    const testRound = 20;
    for (var i = 1; i <= testRound; i++) {
        const biddingPeriod = 100;
        const biddingSuccTime = (await time.latest()) + 20;
    
        const [
            beneficiary, 
            bidder1, 
            bidder2,
            bidder3,
            bidder4,
            bidder5
        ] = await ethers.getSigners();
    
        const auction = await Auction.deploy(0, biddingPeriod, 10, 1000, beneficiary.address);
    
        // bidding phase
        await (time.increaseTo(biddingSuccTime));
        var value = auction.getCurrentPrice();

        var value1 = Math.ceil(Math.random() * 100) + 750;
        var value2 = Math.ceil(Math.random() * 100) + 750;
        var value3 = Math.ceil(Math.random() * 100) + 750;
        var value4 = Math.ceil(Math.random() * 100) + 750;
        var value5 = Math.ceil(Math.random() * 100) + 750;
        var flag = false;

        if (value1 > (await value).toNumber() && !flag) {
            await auction.connect(bidder1).bid({value: value1})
            flag = true;
        }
        else {
            await expect(auction.connect(bidder1).bid({value: value1})).to.be.reverted;
        }

        if (value2 > (await value).toNumber() && !flag) {
            await auction.connect(bidder1).bid({value: value2})
            flag = true;
        }
        else {
            await expect(auction.connect(bidder2).bid({value: value2})).to.be.reverted;
        }

        if (value3 > (await value).toNumber() && !flag) {
            await auction.connect(bidder3).bid({value: value3})
            flag = true;
        }
        else {
            await expect(auction.connect(bidder3).bid({value: value3})).to.be.reverted;
        }

        if (value4 > (await value).toNumber() && !flag) {
            await auction.connect(bidder4).bid({value: value4})
            flag = true;
        }
        else {
            await expect(auction.connect(bidder4).bid({value: value4})).to.be.reverted;
        }

        if (value5 > (await value).toNumber() && !flag) {
            await auction.connect(bidder5).bid({value: value5})
            flag = true;
        }
        else {
            await expect(auction.connect(bidder5).bid({value: value5})).to.be.reverted;
        }

        // await expect(auction.connect(bidder1).bid({value: 10})).to.be.reverted;
        // await auction.connect(bidder2).bid({value: 900});
    
        // await auction.auctionEnd();

        // withdraw phase
        await auction.connect(bidder1).withdraw();
        await auction.connect(bidder2).withdraw();
        await auction.connect(bidder3).withdraw();
        await auction.connect(bidder4).withdraw();
        await auction.connect(bidder5).withdraw();
    }
  });
});