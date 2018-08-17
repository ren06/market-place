var MarketPlace = artifacts.require('./MarketPlace.sol');
let web3 = require('web3') 

module.exports = function (deployer, network, accounts) {
  const _adminAccount = accounts[0];
  const _storeOwnerAccount2 = accounts[2];

  deployer.then(() => MarketPlace.deployed()).then(async function(contract, err) {
    if (err) {
      console.log('Error getting contract', err);
    } else {
      console.log('*** Creating a 2nd Store Owner with 1 stores with 3 products ***');   

      await contract.requestStoreOwner('James Hill', {from: _storeOwnerAccount2});
      
      await contract.activateStoreOwner(_storeOwnerAccount2, {from: _adminAccount});
      
      await contract.addStore('Video Games Store', { from: _storeOwnerAccount2 })

      await contract.addProduct(0, `Dark Souls 3`, web3.utils.toWei('0.2', 'ether'), 100, { from: _storeOwnerAccount2 })
      await contract.addProduct(0, `Total War Shogun 2`, web3.utils.toWei('0.1', 'ether'), 200, { from: _storeOwnerAccount2 });
      await contract.addProduct(0, `XCOM 2`, web3.utils.toWei('0.25', 'ether'), 150, { from: _storeOwnerAccount2 });    
      console.log('MIGRATION 4 COMPLETE');  
    }
  }).catch((err) => console.log(err));
};
