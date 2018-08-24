const MarketPlace = artifacts.require('MarketPlace')

contract('MarketPlace', function(accounts) {
  const owner = accounts[0]
  const admin1 = accounts[1]
  const admin2 = accounts[2]
  const admin3 = accounts[3]
  const admin4 = accounts[4]

  async function listAdministrators(truncateAddress = false) {
    const marketPlace = await MarketPlace.deployed();
    console.log('*** List All Administrators ***');
    let adminCount = await marketPlace.getAdministratorsCount.call();
    let res = ''
    let indexes = ''
    if (adminCount.toNumber() === 0) {
      console.log('No admin - impossible at least owner');
    }
    for (let i = 0; i < adminCount; i++) {
      //(uint _index, string _name, address _addr, bool _isActive, uint _numberStores
      let result = await marketPlace.getAdministratorAtIndex.call(i)
      let address = result[1]
      if (truncateAddress) {
        address = address.substring(0, 10) + '...'
      }
      res = res + `${result[0]} ${address}  ${result[2]} |`
      let index = await marketPlace.administratorIndexes.call(i) + ' |  ';
      if (truncateAddress) {
        index = index.substring(0, 10) + '...'
      }       
      indexes = indexes + index + '|'
    }
    console.log(res);
    console.log('Idxs:', indexes);
  }  

  it('Should only be the contract owner that can delete another admin', async() => {
    const marketPlace = await MarketPlace.deployed();
    let success = 0;
    const expected = 5;

    //add admin1 as administrator
    await marketPlace.addAdministrator(admin1, {from: owner});
    success++;

    //add admin2 as administrator
    await marketPlace.addAdministrator(admin2, {from: admin1});
    success++;    

    //expect to fail since admin1 is not the owner
    try {
      await marketPlace.deleteAdministrator(admin2, {from: admin1});
      success++;
    } catch (err) {  
    }

    //expect to pass
    await marketPlace.deleteAdministrator(admin2, {from: owner});
    success++;

    //add again admin2 as administrator    
    await marketPlace.addAdministrator(admin3, {from: admin1});
    success++;

    //add again admin2 as administrator
    await marketPlace.addAdministrator(admin2, {from: admin1});
    success++;       

    await listAdministrators(true);
   
    assert.equal(success, expected, `Error when deleting and adding an administrator`);
  })  

  it('Should verify that the contract is pausable by owner', async() => {
    const marketPlace = await MarketPlace.deployed();
    const expected = 1;
    let success = 0;

    // const AllEvents = await marketPlace.allEvents();
    // AllEvents.watch(function(error, log) { 
    //   if (!error) { console.log(log.event, log.args); }
    // });

    //should fail
    try {
      await marketPlace.pause({from: admin1});
      success++;
    } catch (err) { 
    }

    //should be ok
    await marketPlace.pause({from: owner});
    success++;

    assert.equal(success, expected, `Error when calling the method pause`);
  })

  it('Should check that a function that requires whenNotPaused cannot run anymore', async() => {
    const marketPlace = await MarketPlace.deployed();
    const expected = 0;
    let success = 0;
    
    //add admin4 as administrator - should throw since contract is paused
    try {
      await marketPlace.addAdministrator(admin4, {from: admin1});
      success++;
    } catch (err) { 
    }
    
    assert.equal(success, expected, `Error should not be able to call function`);
  })

  it('Should Unpause and execute a function', async() => {
    const marketPlace = await MarketPlace.deployed();
    const expected = 2;
    let success = 0;

    //should fail
    try {
      await marketPlace.unpause({from: admin1});
      success++;
      assert.equal(true, false, `Unpausing should have failed since it is not the owner who ran it`);
    } catch (err) { 
      //console.log('Error unpausing - as expected admin1 is not owner')
    }

    await marketPlace.unpause({from: owner});
    success++;

    await marketPlace.addAdministrator(admin4, {from: admin1});
    success++;
    
    assert.equal(success, expected, `Unpausing and executing method addAdministrator failed`);
  })
});
