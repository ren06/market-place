
/* eslint-disable camelcase */
const MarketPlace = artifacts.require('MarketPlace')

contract('MarketPlace', function(accounts) {
  const admin1 = accounts[0]
  const storeOwner1 = accounts[6]
  const storeOwner2 = accounts[7]
  const guest = accounts[8]

  //product setup
  const store0_product0_price = web3.toWei('0.1', 'ether');
  const store0_product0_newPrice = web3.toWei('1.2', 'ether');
  const store0_product1_price = web3.toWei('0.25', 'ether');
  const store0_product2_price = web3.toWei('0.5', 'ether');
  const store1_product0_price = web3.toWei('0.35', 'ether');

  const productTotalQuantity0 = 10;
  const productTotalnewQuantity0 = 12;
  const productTotalQuantity1 = 20;
  const productTotalQuantity2 = 30;
  const productTotalQuantity3 = 40;

  const productBuyQuantity0 = 3;
  const productBuyQuantity1 = 5;
  const productBuyQuantity2 = 10;
  
  let totalBoughtAllStores = 0;
  
  /*
    Functions to dispay current state and help debugging/checking data is correct
  */
  async function listStoreOwners() {
    const marketPlace = await MarketPlace.deployed();
    console.log('*** List All Store Owners ***');
    let storeOwnerCount = await marketPlace.getStoreOwnersCount.call()
    let res = ''
    if (storeOwnerCount.toNumber() === 0) {
      console.log('No store owners');
    }
    for (let i = 0; i < storeOwnerCount; i++) {
      let result = await marketPlace.getStoreOwnerAtIndex.call(i)
      res = res + `${result[0]} ${result[1]} ${result[3]} ${result[4]} |`
    }
    console.log(res);
  }

  async function listStores(storeOwnerAddress) {
    const marketPlace = await MarketPlace.deployed();
    console.log(`*** List Store(s) of ${storeOwnerAddress.substring(0, 10)}... ***`);
    let storesCount = await marketPlace.getStoresCount.call(storeOwnerAddress)
    let res = ''
    let total = 0;
    for (let i = 0; i < storesCount; i++) {
      let result = await marketPlace.getStoreAtIndex.call(storeOwnerAddress, i);
      res = res + `${result[0]} ${result[1]} ${result[2]} ${result[3]} |`;
      total += result[3].toNumber();
    }
    console.log(res);
    return total;
  }

  async function listProducts(storeOwnerAddress, storeIndex) {
    const marketPlace = await MarketPlace.deployed();
    console.log(`*** List Product(s) of ${storeOwnerAddress.substring(0, 10)}... / store No. ${storeIndex} ***`);      
    let productCount = await marketPlace.getProductsCount.call(storeOwnerAddress, storeIndex)
    let res = ''
    for (let i = 0; i < productCount; i++) {
      let result = await marketPlace.getProductAt.call(storeOwnerAddress, storeIndex, i)
      res = res + `${result[0]} ${result[1]} ${result[2]} ${result[3]} |`
    }
    console.log(res);
  }

  //INIT THE CONTRACT
  before('Initialise 2 store owners and approve 1', async function () {
    //to generate a clean state: new()
    //To use same instant in each unit tests: deployed()
    const marketPlace = await MarketPlace.deployed()

    // const AllEvents = await marketPlace.allEvents();
    // AllEvents.watch(function(error, log) { 
    //   if (!error) { console.log(log.event, log.args); }
    // }); 

    await marketPlace.requestStoreOwner('Jack Daniels', {from: storeOwner1})
    await marketPlace.requestStoreOwner('Joe Bloggs', {from: storeOwner2})

    await marketPlace.activateStoreOwner(storeOwner1, {from: admin1})
    
    await listStoreOwners()
  })

  it('Should check user access', async() => {
    const marketPlace = await MarketPlace.deployed();
   
    //check roles enum Roles { Guest 0, Administrator 1, StoreOwner 2, ActiveStoreOwner 3 }
    let result = await marketPlace.getUserRole.call({from: guest})
    //console.log('Guest', result.toNumber());
    assert.equal(result.toNumber(), 0, 'guest is not an Guest ' + result);    
   
    result = await marketPlace.getUserRole.call({from: admin1})    
    assert.equal(result.toNumber(), 1, 'admin1 is not an Administrator ' + result);
  
    result = await marketPlace.getUserRole.call({from: storeOwner2})    
    assert.equal(result.toNumber(), 2, 'storeOwner2 is not an inactive StoreOwner ' + result);
   
    result = await marketPlace.getUserRole.call({from: storeOwner1})
    assert.equal(result.toNumber(), 3, 'storeOwner1 is not an active StoreOwner ' + result);
  })

  it('There should be 1 active store owners out of 2, change his name', async() => {
    const marketPlace = await MarketPlace.deployed();
    const expected = 1;
    let activeStoreOwner = 0;
    let storeOwnerCount = await marketPlace.getStoreOwnersCount.call();
    //console.log('stores owners:', storeOwnerCount.toNumber());

    for (let i = 0; i < storeOwnerCount.toNumber(); i++) {
      let result = await marketPlace.getStoreOwnerAtIndex.call(i)
      if (result[3] === true) {
        console.log('Active store owner:', result[1]);
        activeStoreOwner++;
      }
    }
    assert.equal(activeStoreOwner, expected, `Number of active store owner not expected`);
  })

  it('Should update a store owner name, retrieve its info and check it is updated', async() => {
    const marketPlace = await MarketPlace.deployed();
    const newName = 'Jack Daniel';
    
    await marketPlace.updateStoreOwner(newName, {from: storeOwner1});
    const storeOwner = await marketPlace.getStoreOwnerAtAddress.call(storeOwner1);

    assert.equal(storeOwner[1], newName, `The name was not updated properly`);
  })

  it('There should be one admin by defaut (contract owner)', async() => {    
    const expected = 1;
    const marketPlace = await MarketPlace.deployed();
    let result = await marketPlace.getAdministratorsCount.call({from: admin1})

    assert.equal(result.toNumber(), expected, 'Number of admin not expected');
  })

  it('Should delete a store owner and add it again', async() => {    
    const marketPlace = await MarketPlace.deployed();
 
    await marketPlace.deleteStoreOwner(storeOwner1, {from: admin1})
 
    await marketPlace.requestStoreOwner('Jane Doe', {from: storeOwner1})
    await marketPlace.activateStoreOwner(storeOwner1, {from: admin1})
 
    await listStoreOwners()
  })

  it('Should Add 2 stores and some products, remove one product', async() => {
    const marketPlace = await MarketPlace.deployed();
    
    await marketPlace.addStore('Store0', {from: storeOwner1})
    await marketPlace.addStore('Store1', {from: storeOwner1})
    
    await marketPlace.addProduct(0, 'Product0', store0_product0_price, productTotalQuantity0, {from: storeOwner1})
    await marketPlace.addProduct(0, 'Product1', store0_product1_price, productTotalQuantity1, {from: storeOwner1})
    await marketPlace.addProduct(0, 'Product2', store0_product2_price, productTotalQuantity2, {from: storeOwner1})
    //await listStoreOwners();
    //await listProducts(storeOwner1, 0)

    let productCount = await marketPlace.getProductsCount.call(storeOwner1, 0);

    assert.equal(productCount.toNumber(), 3, 'The number of products is not correct')

    //function getProductAt(address storeOwnerAddress, uint storeIndex, uint productIndex) public view returns(uint, string, uint, uint){
    let result = await marketPlace.getProductAt.call(storeOwner1, 0, 0)
    assert.equal(result[2].toNumber(), store0_product0_price, 'The product price is wrong');
    
    await marketPlace.deleteProduct(0, 1, {gas: 500000, from: storeOwner1});

    productCount = await marketPlace.getProductsCount.call(storeOwner1, 0);
    assert.equal(productCount.toNumber(), 2, 'The number of products is not correct')

    await marketPlace.addProduct(0, 'Product4', store0_product2_price, productTotalQuantity3, {from: storeOwner1})

    productCount = await marketPlace.getProductsCount.call(storeOwner1, 0);
    assert.equal(productCount.toNumber(), 3, 'The number of products is not correct')

    await marketPlace.updateProduct(0, 0, 'Product0_Updated', store0_product0_newPrice, productTotalnewQuantity0, {from: storeOwner1})

    //Check update worked
    result = await marketPlace.getProductAt.call(storeOwner1, 0, 0)

    assert.equal(result[1], 'Product0_Updated', 'The description was not updated')
    assert.equal(result[2].toNumber(), store0_product0_newPrice, 'The price was not updated')
    assert.equal(result[3].toNumber(), productTotalnewQuantity0, 'The quantity was not updated')
  })

  it('Should buy several products, test quantity and check store owner balance', async() => {
    const marketPlace = await MarketPlace.deployed();
    
    await listProducts(storeOwner1, 0)

    //Buy product 0 of Store 0
    const value = web3.toBigNumber(store0_product0_newPrice * productBuyQuantity0);
    let totalBought = (store0_product0_newPrice * productBuyQuantity0);
    await marketPlace.buyProduct(storeOwner1, 0, 0, productBuyQuantity0, {from: guest, value: value});
    
    //Buy product 1 of Store 0
    let value2 = web3.toBigNumber(store0_product1_price * productBuyQuantity1);
    await marketPlace.buyProduct(storeOwner1, 0, 1, productBuyQuantity1, {from: guest, value: value2});    
  
    let total = await listStores(storeOwner1);
    totalBought += (store0_product1_price * productBuyQuantity1);
    assert.equal(total, totalBought, `The total purchase price is wrong}`);
      
    //Try buying too much product 1
    const quantityFail = productTotalQuantity1 + 1; //more than stock
    const valueFail = web3.toBigNumber(store0_product1_price * quantityFail);
    
    //Should fail
    await marketPlace.buyProduct(storeOwner1, 0, 1, quantityFail, {from: guest, value: valueFail}).then(() => {
      totalBought += (valueFail * quantityFail); //should not happen
      assert(false, true, `Buying product should have failed since there are no product left`)      
    }
    ).catch(() => {
      //console.log('Expected Error not enough products');
    });    

    await listProducts(storeOwner1, 0)

    //Buy the reminder of stock of  Product 1 of Store0
    const quantity = productTotalQuantity1 - productBuyQuantity1;
    let product = await marketPlace.getProductAt.call(storeOwner1, 0, 1)
    assert.equal(product[3].toNumber(), quantity, 'The stock is not right');

    const value3 = web3.toBigNumber(store0_product1_price * quantity);
    await marketPlace.buyProduct(storeOwner1, 0, 1, quantity, {from: guest, value: value3});
    
    //Check balance of all stores
    totalBought += (store0_product1_price * quantity);
    const totalStore1 = await listStores(storeOwner1);

    assert.equal(totalStore1, totalBought, `Current balance of storeOwner1 does not match purchase`);

    totalBoughtAllStores = totalBought;

    //check quantity 0
    product = await marketPlace.getProductAt.call(storeOwner1, 0, 1)
    assert.equal(product[3].toNumber(), 0, 'The stock is not 0');
  })

  it('Should perform 2 Withdraw and verify it is not possible to withdraw more once balance is 0', async() => {  
    const marketPlace = await MarketPlace.deployed();
  
    await marketPlace.addProduct(1, 'Store1Product0', store1_product0_price, productTotalQuantity3, {from: storeOwner1})

    //Buy product 1 of Store 1
    const value = web3.toBigNumber(store1_product0_price * productBuyQuantity2);
    const totalBought = (store1_product0_price * productBuyQuantity2);
    await marketPlace.buyProduct(storeOwner1, 1, 0, productBuyQuantity2, {from: guest, value: value});

    //get balance of store 1
    // function getStoreAtIndex(address storeOwnerAddress, uint index) public view 
    //returns(uint _index, string _description, uint _numberProducts, uint _balance, address _storeOwner){
    let store1 = await marketPlace.getStoreAtIndex(storeOwner1, 1);
    const store1BalanceBn = store1[3];
    const store1Balance = store1BalanceBn.toNumber();
    assert.equal(totalBought, store1Balance, `Balance does not match purchase`);

    //Add to all purchases made in store0 (previous test)
    totalBoughtAllStores += totalBought;

    //Get balance of all stores
    const totalAllStores = await listStores(storeOwner1);

    assert.equal(totalAllStores, totalBoughtAllStores, `Balance does not match all stores purchases`);

    //get current account balance
    const initialAccountValue = web3.fromWei(web3.eth.getBalance(storeOwner1)); 
    console.log('Store balance:', web3.fromWei(store1Balance), 'ether');
    console.log('StoreOwner balance before withdraw:', initialAccountValue.toNumber())

    //Perform withdrawal of balance of store 1, in 2 times
    await marketPlace.storeOwnerWithdraw(1, store1BalanceBn / 2, {from: storeOwner1});
    await marketPlace.storeOwnerWithdraw(1, store1BalanceBn / 2, {from: storeOwner1});

    const accountValue = web3.fromWei(web3.eth.getBalance(storeOwner1));
    console.log('StoreOwner balance after withdraw:', accountValue.toNumber())
    
    assert(initialAccountValue + store1Balance, accountValue, 'The store owner did not receive the expected withdrawal amount');

    //shoud fail
    try {
      await marketPlace.storeOwnerWithdraw(1, 1000, {from: storeOwner1}); //1000 wei
      assert(false, true, `The withdraw should have failed since its balance should be 0`)
    } catch (e) {        
    }
  })
});
