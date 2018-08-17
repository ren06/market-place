var MarketPlace = artifacts.require('./MarketPlace.sol');
let web3 = require('web3') 

module.exports = function (deployer, network, accounts) {
  const _adminAccount = accounts[0];
  const _storeOwnerAccount1 = accounts[1];

  deployer.then(() => MarketPlace.deployed()).then(async function(contract, err) {
    if (err) {
      console.log('Error getting contract', err);
    } else {
      console.log('*** Creating a 1st Store Owner with 2 stores with products ***');   
      //Owner1
      await contract.requestStoreOwner('John Smith', {from: _storeOwnerAccount1});
     
      await contract.activateStoreOwner(_storeOwnerAccount1, {from: _adminAccount});
     
      await contract.addStore('Jeans Store', { from: _storeOwnerAccount1 });
      
      await contract.addProduct(0, `Levi's`, web3.utils.toWei('0.3', 'ether'), 50, { from: _storeOwnerAccount1 })
      await contract.addProduct(0, `Nudie Jeans`, web3.utils.toWei('0.5', 'ether'), 30, { from: _storeOwnerAccount1 });
      await contract.addProduct(0, `Edwin`, web3.utils.toWei('1', 'ether'), 20, { from: _storeOwnerAccount1 });

      await contract.addStore('Shoes Store', { from: _storeOwnerAccount1 });

      await contract.addProduct(1, `Nike`, web3.utils.toWei('0.5', 'ether'), 50, { from: _storeOwnerAccount1 })
      await contract.addProduct(1, `Converse`, web3.utils.toWei('0.3', 'ether'), 15, { from: _storeOwnerAccount1 });
      await contract.addProduct(1, `Reebok`, web3.utils.toWei('0.6', 'ether'), 75, { from: _storeOwnerAccount1 });
      await contract.addProduct(1, `Adidas`, web3.utils.toWei('0.5', 'ether'), 30, { from: _storeOwnerAccount1 });
      console.log('*** MIGRATION 3 COMPLETE ***');
    }
  }).catch((err) => console.log(err));
};
