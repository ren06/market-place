var MarketPlace = artifacts.require('./MarketPlace.sol');
let web3 = require('web3') 

module.exports = function (deployer, network, accounts) {
  const _storeOwnerAccount1 = accounts[1];

  deployer.then(() => MarketPlace.deployed()).then(async function(contract, err) {
    if (err) {
      console.log('Error getting contract', err);
    } else {
      // console.log('*** Making withdrawals ***');

      // //Withdraw 0.5 ETH from store 0 
      // let amount = web3.utils.toBN(web3.utils.toWei('0.5', 'ether')).toString();
      // console.log(amount);
      // await contract.storeOwnerWithdraw(0, amount, {from: _storeOwnerAccount1, gas: 200000})

      // console.log('MIGRATION 6 COMPLETE');  
    }
  }).catch((err) => console.log(err));
};
