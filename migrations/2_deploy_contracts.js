const DummyContract = artifacts.require("DummyContract");

module.exports = (deployer, network, accounts) => {
  deployer.deploy(DummyContract).then(async dummyContract => {
    await Promise.all([
      dummyContract.dummyFx1(accounts[1], 100),
      dummyContract.dummyFx1(accounts[1], 200),
      dummyContract.dummyFx1(accounts[1], 300),
      dummyContract.dummyFx1(accounts[2], 400),
      dummyContract.dummyFx1(accounts[2], 500)
    ]);
  });
};
