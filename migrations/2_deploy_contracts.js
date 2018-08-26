var MarketPlace = artifacts.require('./MarketPlace.sol');
//var OracleETHPrice = artifacts.require('./OracleETHPrice.sol');

module.exports = function (deployer, network, accounts) {
  deployer.deploy(MarketPlace);
  //const amount = web3.toWei('1', 'ether');
  //deployer.deploy(OracleETHPrice, { from: accounts[9], gas: 6721975, value: amount });  
};
