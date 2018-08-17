var MarketPlace = artifacts.require('./MarketPlace.sol');

module.exports = function (deployer, network, accounts) {
  deployer.deploy(MarketPlace);
};
