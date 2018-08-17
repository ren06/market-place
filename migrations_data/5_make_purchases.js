var MarketPlace = artifacts.require('./MarketPlace.sol');
let web3 = require('web3') 

module.exports = function (deployer, network, accounts) {
  
  const _storeOwnerAccount1 = accounts[1];
  const _shopperAccount1 = accounts[3];
  const _shopperAccount2 = accounts[4];

  deployer.then(() => MarketPlace.deployed()).then(async function(contract, err) {
    if (err) {
      console.log('Error getting contract', err);
    } else {
      console.log('*** Making purchases ***');

      //Buy product 0 of store 0 of store owner 1
      let storeIndex = 0;
      let productIndex = 0;
      let result = await contract.getProductAt.call(_storeOwnerAccount1, storeIndex, productIndex);
      let productPrice = result[2];
      let productQuantity = 3;
      let value = web3.utils.toBN(productPrice * productQuantity).toString();
      console.log(value);
      await contract.buyProduct(_storeOwnerAccount1, storeIndex, productIndex, productQuantity, 
        {from: _shopperAccount1, value: value, gas: 200000})

      //Buy product 1 of store 1 of store owner 1  
      storeIndex = 1;
      productIndex = 1;
      result = await contract.getProductAt.call(_storeOwnerAccount1, storeIndex, productIndex);
      productPrice = result[2];
      productQuantity = 4;
      value = web3.utils.toBN(productPrice * productQuantity).toString();
      console.log(value);
      await contract.buyProduct(_storeOwnerAccount1, storeIndex, productIndex, productQuantity, 
        {from: _shopperAccount1, value: value, gas: 200000})           
      
      // //Buy product 0 of store 0 of store owner 2        
      // storeIndex = 0;
      // productIndex = 0;
      // result = await contract.getProductAt.call(_storeOwnerAccount2, storeIndex, productIndex);
      // productPrice = result[2];
      // productQuantity = 3;
      // value = web3.utils.toBN(productPrice * productQuantity).toString();
      // console.log(value);
      // await contract.buyProduct(_storeOwnerAccount2, storeIndex, productIndex, productQuantity, 
      //   {from: _shopperAccount2, value: value, gas: 200000})        

      console.log('MIGRATION 5 COMPLETE');  
    }
  }).catch((err) => console.log(err));
};
