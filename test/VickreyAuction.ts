import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("VickreyAuction", function () {
  it("Testing vickrey auction", async function () {;

    const Auction = await hre.ethers.getContractFactory("VickreyAuction");
    // Correctness Test
    const biddingPeriod = 100;
    const revealPeriod = 100;
    const biddingEndTime = (await time.latest()) + biddingPeriod + 10;
    const revealTime = biddingEndTime + revealPeriod + 10;
    const secret = ethers.utils.formatBytes32String("secret");

    const [
        beneficiary, 
        bidder1, 
        bidder2,
        bidder3,
        bidder4,
        bidder5,
    ] = await ethers.getSigners();

    const auction = await Auction.deploy(0, biddingPeriod, revealPeriod + biddingPeriod, beneficiary.address);

    // bidding phase
    await auction.connect(bidder1).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ 30, false, secret ]), {value: 100});
    await auction.connect(bidder1).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ 50, true, secret ]), {value: 100});
    await auction.connect(bidder1).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ 70, true, secret ]), {value: 100});

    await auction.connect(bidder2).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ 25, false, secret ]), {value: 100});
    await auction.connect(bidder2).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ 30, false, secret ]), {value: 100});
    await auction.connect(bidder2).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ 35, false, secret ]), {value: 100});

    // bidding close
    await time.increaseTo(biddingEndTime);

    await auction.connect(bidder1).reveal([30, 50, 70], [false, true, true], [secret, secret, secret]);
    await auction.connect(bidder2).reveal([25, 30, 35], [false, false, false], [secret, secret, secret]);

    // reveal
    await time.increaseTo(revealTime);
    await auction.auctionEnd();
    expect(await auction.highestBid()).to.equal(35);

    // withdraw phase
    await auction.connect(bidder1).withdraw();
    await auction.connect(bidder2).withdraw();

    // Multiple random test
    const testRound = 20;
    for (var i = 1; i <= testRound; i++) {
      const biddingPeriod = 100;
      const revealPeriod = 100;
      const biddingEndTime = (await time.latest()) + biddingPeriod + 10;
      const revealTime = biddingEndTime + revealPeriod + 10;
      const secret = ethers.utils.formatBytes32String("secret");

      const [
          beneficiary, 
          bidder1, 
          bidder2,
          bidder3,
          bidder4,
          bidder5,
      ] = await ethers.getSigners();

      const auction = await Auction.deploy(0, biddingPeriod, revealPeriod + biddingPeriod, beneficiary.address);

      // bidding phase
      var value1 = [Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100)];
      var fake1 = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
      await auction.connect(bidder1).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value1[0], fake1[0], secret ]), {value: 100});
      await auction.connect(bidder1).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value1[1], fake1[1], secret ]), {value: 100});
      await auction.connect(bidder1).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value1[2], fake1[2], secret ]), {value: 100});

      var value2 = [Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100)];
      var fake2 = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
      await auction.connect(bidder2).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value2[0], fake2[0], secret ]), {value: 100});
      await auction.connect(bidder2).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value2[1], fake2[1], secret ]), {value: 100});
      await auction.connect(bidder2).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value2[2], fake2[2], secret ]), {value: 100});

      var value3 = [Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100)];
      var fake3 = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
      await auction.connect(bidder3).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value3[0], fake3[0], secret ]), {value: 100});
      await auction.connect(bidder3).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value3[1], fake3[1], secret ]), {value: 100});
      await auction.connect(bidder3).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value3[2], fake3[2], secret ]), {value: 100});

      var value4 = [Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100)];
      var fake4 = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
      await auction.connect(bidder4).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value4[0], fake4[0], secret ]), {value: 100});
      await auction.connect(bidder4).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value4[1], fake4[1], secret ]), {value: 100});
      await auction.connect(bidder4).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value4[2], fake4[2], secret ]), {value: 100});

      var value5 = [Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100)];
      var fake5 = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
      await auction.connect(bidder5).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value5[0], fake5[0], secret ]), {value: 100});
      await auction.connect(bidder5).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value5[1], fake5[1], secret ]), {value: 100});
      await auction.connect(bidder5).bid(ethers.utils.solidityKeccak256([ "uint", "bool", "bytes32" ], [ value5[2], fake5[2], secret ]), {value: 100});

      // bidding close
      await time.increaseTo(biddingEndTime);

      await auction.connect(bidder1).reveal(value1, fake1, [secret, secret, secret]);
      await auction.connect(bidder2).reveal(value2, fake2, [secret, secret, secret]);
      await auction.connect(bidder3).reveal(value3, fake3, [secret, secret, secret]);
      await auction.connect(bidder4).reveal(value4, fake4, [secret, secret, secret]);
      await auction.connect(bidder5).reveal(value5, fake5, [secret, secret, secret]);

      // reveal
      await time.increaseTo(revealTime);
      await auction.auctionEnd();

      // withdraw phase
      await auction.connect(bidder1).withdraw();
      await auction.connect(bidder2).withdraw();
      await auction.connect(bidder3).withdraw();
      await auction.connect(bidder4).withdraw();
      await auction.connect(bidder5).withdraw();
    }
  });
});