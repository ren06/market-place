const MarketPlace = artifacts.require('MarketPlace')

contract('MarketPlace', function(accounts) {
  //const owner = accounts[0]
  const admin1 = accounts[0]
  const admin2 = accounts[5]
  const storeOwner1 = accounts[6]
  const storeOwner2 = accounts[7]
  const guest = accounts[8]

  async function listStoreOwners() {
    const marketPlace = await MarketPlace.deployed();
    console.log('*** List All Store Owners ***');
    let storeOwnerCount = await marketPlace.getStoreOwnersCount.call()
    let res = ''
    if (storeOwnerCount.toNumber() === 0) {
      console.log('No store owners');
    }
    for (let i = 0; i < storeOwnerCount; i++) {
      //(uint _index, string _name, address _addr, bool _isActive, uint _numberStores
      let result = await marketPlace.getStoreOwnerAtIndex.call(i, {from: admin1})
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
      //uint _index, string _description, uint _numberProducts, uint _balance
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
    let productCount = await marketPlace.getProductsCount.call(storeOwnerAddress, storeIndex, {from: guest})
    let res = ''
    for (let i = 0; i < productCount; i++) {
      //(product.index, product.description, product.price, product.quantity, product.id);
      let result = await marketPlace.getProductAt.call(storeOwnerAddress, storeIndex, i, {from: guest})
      res = res + `${result[0]} ${result[1]} ${result[2]} ${result[3]} |`
    }
    console.log(res);
  }

  //INIT THE CONTRACT
  before('1. Initialise 2 store owners and approve 1', async function () {
    console.log('1')  
    //to generate a clean state: new()
    //To use same instant in each unit tests: deployed()
    const marketPlace = await MarketPlace.deployed()

    const AllEvents = await marketPlace.allEvents();
    AllEvents.watch(function(error, log) { 
      if (!error) { console.log(log.event, log.args); }
    }); 

    await marketPlace.requestStoreOwner('Jack Daniels', {from: storeOwner1})
    await marketPlace.requestStoreOwner('Joe Bloggs', {from: storeOwner2})

    await marketPlace.activateStoreOwner(storeOwner1, {from: admin1})
    //await marketPlace.activateStoreOwner(storeOwner2, {from: admin1})

    await listStoreOwners()
  })

  it('2. should check user access', async() => {
    console.log('2')  
    const marketPlace = await MarketPlace.deployed();
   
    //check roles enum Roles { Guest 0, Administrator 1, StoreOwner 2, ActiveStoreOwner 3 }
    let result = await marketPlace.getUserRole.call({from: guest})
    console.log('Guest', result.toNumber());
    assert.equal(result.toNumber(), 0, 'guest is not an Guest ' + result);    
   
    result = await marketPlace.getUserRole.call({from: admin1})
    console.log('Admin1', result.toNumber());
    assert.equal(result.toNumber(), 1, 'admin1 is not an Administrator ' + result);
  
    result = await marketPlace.getUserRole.call({from: storeOwner2})
    console.log('StoreOwner2', result.toNumber());
    assert.equal(result.toNumber(), 2, 'storeOwner2 is not an inactive StoreOwner ' + result);
   
    result = await marketPlace.getUserRole.call({from: storeOwner1})
    console.log('StoreOwner1', result.toNumber());
    assert.equal(result.toNumber(), 3, 'storeOwner1 is not an active StoreOwner ' + result);
  })

  it('3. should be 1 active store owners', async() => {
    console.log(('3'))
    const marketPlace = await MarketPlace.deployed();
    const expected = 1;
    let activeStoreOwner = 0;
    let storeOwnerCount = await marketPlace.getStoreOwnersCount.call();
    console.log('stores owners:', storeOwnerCount.toNumber());

    for (let i = 0; i < storeOwnerCount.toNumber(); i++) {
      let result = await marketPlace.getStoreOwnerAtIndex.call(i)
      if (result[3] === true) {
        console.log('Active store owner:', result[1]);
        activeStoreOwner++;
      }
    }
    assert.equal(activeStoreOwner, expected, `There must be ${expected} active store owner, there are '+ ${storeOwnerCount}`);
  })

  it('4. add one administrator', async() => {
    console.log('4')
    const expected = 2;

    const marketPlace = await MarketPlace.deployed();
     
    await marketPlace.addAdministrator(admin2, {from: admin1});
    let adminCount = await marketPlace.getAdministratorsCount.call();

    assert.equal(adminCount, expected, `There must be ${expected} administrators, there are '+ ${adminCount}`);
  })  

  //   it('5 should have first admin set to contract owner', async() => {
  //     console.log('5')
  //     const expected = 2;
  //     const marketPlace = await MarketPlace.deployed();
  //     let result = await marketPlace.getAdministratorsCount.call({from: admin1})

  //     assert.equal(result.toNumber(), expected, 'The admin count is not 1, it is ' + result.toNumber());
  //     result = await marketPlace.getAdministratorAtIndex.call(0, {from: admin1})

  //     assert.equal(result[0], 0, 'The index is not 0, it is ' + result[0]);
  //     assert.equal(result[1].toString(), owner, 'The admin1 is not owner of contract, it is' + result[1].toString())
  //   })

  it('6 should delete a store owner and add it again', async() => {
    console.log('6')
    const marketPlace = await MarketPlace.deployed();
    //list keys before removal
    await listStoreOwners()
    await marketPlace.deleteStoreOwner(storeOwner1, {from: admin1})
    //list key after removal
    await listStoreOwners()
    await marketPlace.requestStoreOwner('Jane Doe', {from: storeOwner1})
    await marketPlace.activateStoreOwner(storeOwner1, {from: admin1})
    //list key after readdition
    await listStoreOwners()
  })

  it('7 Add store and add a product, remove it', async() => {
    console.log('7')
    const marketPlace = await MarketPlace.deployed();
    const productPrice = web3.toWei('1', 'ether');
    const productPrice2 = web3.toWei('0.2', 'ether');
    const productQuantity = 30;
    const productQuantity2 = 20;

    await marketPlace.addStore('Store1', {from: storeOwner1})
    await marketPlace.addStore('Store2', {from: storeOwner1})
    //uint storeIndex, string description, uint price, uint quantity
    await marketPlace.addProduct(0, 'Product1', productPrice, productQuantity, {from: storeOwner1})
    await marketPlace.addProduct(0, 'Product2', productPrice2, productQuantity2, {from: storeOwner1})
    await marketPlace.addProduct(0, 'Product3', productPrice, productQuantity, {from: storeOwner1})
    await listStoreOwners();
    await listProducts(storeOwner1, 0)
    //function getProductAt(address storeOwnerAddress, uint storeIndex, uint productIndex) public view returns(uint, string, uint, uint){
    let result = await marketPlace.getProductAt.call(storeOwner1, 0, 0, {from: guest})
    //console.log(result[2].toNumber());
    assert.equal(result[2].toNumber(), productPrice.toNumber(), 'The product price must be ' + productPrice + ' , it is ' + result[2]);
    
    await marketPlace.deleteProduct(0, 1, {gas: 50000, from: storeOwner1});
    await listProducts(storeOwner1, 0);

    await marketPlace.addProduct(0, 'Product4', productPrice, productQuantity, {from: storeOwner1})

    await marketPlace.updateProduct(0, 0, 'Product1_Updated', productPrice, productQuantity, {from: storeOwner1})
    await listProducts(storeOwner1, 0);
    await listStores(storeOwner1);
  })

  it('8 Buy products', async() => {  
    console.log('8')
    const marketPlace = await MarketPlace.deployed();
    let totalBought = 0;
    const productPrice = web3.toWei('1', 'ether');
    const productPrice2 = web3.toWei('0.2', 'ether');
    console.log(productPrice)

    //Buy product 1
    const quantity = 5;
    const value = web3.toBigNumber(productPrice * quantity);
    console.log(value.toString())
    totalBought += (productPrice * quantity);
    await marketPlace.buyProduct(storeOwner1, 0, 0, quantity, {from: guest, value: value.toString()});
    
    // //Buy product 2
    // let quantity2 = 10;
    // let value2 = web3.toBigNumber(productPrice2 * quantity2);
    // await marketPlace.buyProduct(storeOwner1, 0, 1, quantity2, {from: guest, value: value2});    
  
    // let total = await listStores(storeOwner1);
    // totalBought += (productPrice2 * quantity2);
    // assert.equal(total, totalBought, `The total price must be ${totalBought}, it is + ${total}`);
      
    // //Buy More product 2
    // quantity2 = 11;
    // value2 = web3.toBigNumber(productPrice2 * quantity2);
  
    // await marketPlace.buyProduct(storeOwner1, 0, 1, quantity2, {from: guest, value: value2}).catch(() => {
    //   console.log('Error not enough products');
    // });    

    // quantity2 = 10;
    // value2 = web3.toBigNumber(productPrice2 * quantity2);
  
    // await marketPlace.buyProduct(storeOwner1, 0, 1, quantity2, {from: guest, value: value2});
    
    // total = await listStores(storeOwner1);
    // totalBought += (productPrice2 * quantity2);
    // assert.equal(total, totalBought, `The total price must be ${totalBought}, it is + ${total}`);
  })
});
