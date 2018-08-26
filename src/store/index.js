import Vue from 'vue';
import Vuex from 'vuex';
import Web3 from 'web3';
import axios from 'axios';
import {getNetIdString, getEtherscanAddress} from '../utils';
import truffleContract from 'truffle-contract';
import router from '../router';
import marketPlaceJson from '../../build/contracts/MarketPlace.json';
import storeOwnerState from './store-owner';

const MarketPlace = truffleContract(marketPlaceJson);
//Declaring events to register them only once
let LogAdminAddAdmin = null;
let LogStoreOwnerStatusChanged = null;
let LogStoreOwnerRequest = null;
let Pause = null;
let Unpause = null;

Vue.use(Vuex);

/* eslint-disable */
const store = new Vuex.Store({
  modules: {
    storeOwnerState,
  },
  state: {
    userRole: null, //0 Guest, 1 Administrator, 2 Inactive Store Ower, 3 Active Store Owner
    isMetamaskInstalled: true,
    account: null,
    currentNetwork: null,
    accountBalance: null,
    MarketPlace: null,
    web3: null,
    currentUsdPrice: null,
    etherscanBase: null,
    administrators: [],
    isContractPaused: null,
    //UI stuff
    currentValue: '',
    storeOwners: [],
    stores: [],
    infoMessage: '',
    isLoaderVisible: false
  },
  getters: {
    getStores: (state) => {
      return state.stores;
    },
    getStoreOwners: (state) => {
        //console.log('Inside getStoreOwners');
        return state.storeOwners;
    },
    getUserRole: (state) => {
        //console.log('Inside getUserRole');
        switch(state.userRole) {
            case 0: return 'Guest';
            case 1: return 'Administrator';
            case 2: return 'Inactive Store Owner';
            case 3: return 'Active Store Owner';
            default: return 'Unknown';
        }
    },
    getAccountBalance: (state) => {
      return state.accountBalance;
    },
    getContractAddress: (state) => {
      if (state.MarketPlace) {
        state.MarketPlace.deployed().then((contract) => {
          return contract.address;
        }).catch((err) => {
          console.log(err);
          return "Contract address not set";
        });
      } else { return "Contract address not set";}
    },    
  },
  mutations: {
    SET_IS_METAMASK_INSTALLED: (state, value) => {
      state.isMetamaskInstalled = value;
    },
    SET_IS_LOADER_VISIBLE: (state, value) => {
      state.isLoaderVisible = value;
    },
    SET_ADMINISTRATORS: (state, administrators) => {
      //clear array first
      while (state.administrators.length > 0) {
        state.administrators.pop();
      }      
      state.administrators = administrators;
    },    
    resetState: (state) => {
        console.log('Reset store owner state');
        state.storeOwnerState.currentStoreOwner = null;
        state.storeOwnerState.stores = [];
        state.storeOwnerState.currentStore = null;
        state.storeOwnerState.currentStoreProducts = [];
        state.storeOwnerState.currentProduct = null;
        state.storeOwnerState.currentStoreOwner = null;
    },
    SET_INFO_MESSAGE: (state, message) => {
      state.infoMessage = message;
    },
    SET_STORE_OWNERS: (state, payload) => {
        //clear the array first
        while (state.storeOwners.length > 0) {
          state.storeOwners.pop();
        }
        for(const owner of payload) {
          state.storeOwners.push({
            index: owner[0].toNumber(), 
            name: owner[1], 
            address: owner[2], 
            active: owner[3], 
            numberStores: owner[4].toNumber()
          });
        }
    },  
    SET_ALL_STORES: (state, stores) => {
      while (state.stores.length > 0) {
        state.stores.pop();
      }
      state.stores = stores;
    },
    SET_USER_ROLE: (state, userRole) => {
      state.userRole = userRole;
    },   
    SET_ACCOUNT: (state, {account, accountBalance}) => {
      state.account = account;
      state.accountBalance = accountBalance;
      console.log('Account set to ', account)
    },
    SET_CURRENT_NETWORK: (state, currentNetwork) => {
      state.currentNetwork = currentNetwork;
    },
    SET_USD_PRICE: (state, currentUsdPrice) => {
      state.currentUsdPrice = currentUsdPrice;
    },
    SET_ETHERSCAN_NETWORK: (state, etherscanBase) => {
      state.etherscanBase = etherscanBase;
    },
    SET_WEB3: (state, web3) => {
      state.web3 = web3;
    },
    SET_CONTRACT: (state, MarketPlace) => {
      state.MarketPlace = MarketPlace;
    },
    SET_IS_CONTRACT_PAUSED: (state, isContractPaused) => {
        state.isContractPaused = isContractPaused;
    }
  },
  //Calling mutations directly in the component is for synchronous events.
  //Should you need asyncronous functionality, you use Actions.
  actions: {
    ACTION_ADD_ADMINISTRATOR : ({ commit, state, dispatch }, newAdminAddress) => {
      console.log('inside ACTION_ADD_ADMINISTRATOR')     

      state.MarketPlace.deployed().then((contract) => {

        //Register event once
        if(!LogAdminAddAdmin){
          console.log('registering LogAdminAddAdmin');
          LogAdminAddAdmin = contract.LogAdminAddAdmin();

          LogAdminAddAdmin.watch(function(error, result){
            if (error) {
              console.log(error);
            } else {
              console.log('LogAdminAddAdmin event caught', result);
              //refresh content
              console.log('New admin:', result.args.adminAddress);
              commit('SET_IS_LOADER_VISIBLE', false);
              dispatch('ACTION_SET_ADMINISTRATORS');
            }
          });
        }

        contract.addAdministrator(newAdminAddress,
          { from: state.account, gas: 1000000 }).then((result) => {
          console.log('addProduct function call mined', result);
        }).catch((err) => {
          console.log(err);
        });

      });    
    },
    ACTION_SET_ADMINISTRATORS: ({ commit, state, dispatch }) => {
      state.MarketPlace.deployed().then((contract) => { 
        contract.getAdministratorsCount.call().then(count => {
            let promises = [];

            for(let i=0; i < count; i++){
                promises.push(contract.getAdministratorAtIndex.call(i));
            }

            Promise.all(promises).then(function(administrators) {
              let allAdministrators = []
              for(const admin of administrators) {
                console.log(admin);
                allAdministrators.push({
                  index: admin[0],
                  address: admin[1],
                  isOwner: admin[2]
                });
              }
              commit('SET_ADMINISTRATORS', allAdministrators);
            }).catch((err) => { console.log(err); });    
        });
      });  
    },    
    ACTION_TOGGLE_CONTRACT_STATUS: ({ commit, state, dispatch }) => {
        console.log('inside ACTION_TOGGLE_CONTRACT_STATUS')
        state.MarketPlace.deployed().then((contract) => {
            contract.paused.call().then(isPaused => {
                //UNPAUSE contract
                if(isPaused){
                    if (!Unpause) {
                        Unpause = contract.Pause();
                        Unpause.watch(function(error, result) {
                          if (error) {
                            console.log(error);
                          } else {
                            console.log('Unpause event caught', result);
                            commit('SET_IS_CONTRACT_PAUSED', false);
                          }
                        });
                    }

                    contract.unpause({from: state.account}).then((result) => {
                        console.log('buyProduct function call mined', result);
                        commit('SET_IS_CONTRACT_PAUSED', false);
                        commit('SET_IS_LOADER_VISIBLE', false);
                      })
                }
                else{
                    //PAUSE Contract
                    if (!Pause) {
                        Pause = contract.Pause();
                        Pause.watch(function(error, result) {
                          if (error) {
                            console.log(error);
                          } else {
                            console.log('Pause event caught', result);
                            commit('SET_IS_CONTRACT_PAUSED', true);
                            commit('SET_IS_LOADER_VISIBLE', false);
                          }
                        });
                    }

                    contract.pause({from: state.account}).then((result) => {
                        console.log('buyProduct function call mined', result);
                        commit('SET_IS_CONTRACT_PAUSED', false);
                    })
                }
            });
        });
    },
    ACTION_SET_IS_CONTRACT_PAUSED: ({ commit, state, dispatch }, value) => {
        console.log('inside ACTION_SET_IS_CONTRACT_PAUSED')
        state.MarketPlace.deployed().then((contract) => {
            contract.paused.call().then(isPaused => {
                console.log('Contract paused?:', isPaused);
                commit('SET_IS_CONTRACT_PAUSED', isPaused);
            });
        });
    },
    ACTION_SET_ALL_STORES: ({ commit, state, dispatch }, value) => {
      console.log('inside ACTION_SET_ALL_STORES')  

      //loop through all user store and all their stores    
      state.MarketPlace.deployed().then((contract) => {
       
        //get number of store owners
        contract.getStoreOwnersCount.call().then(count => {
          let promises = [];
          for(let i=0; i < count.toNumber(); i++){
            promises.push(contract.getStoreOwnerAtIndex.call(i));
          }
          //for each store owner found, get their stores
          Promise.all(promises).then(function(storeOwners) {
            console.log('storeOwners', storeOwners)
            promises = [];
            let numberStores;
            let storeOwnerAddress;
            let allStores = []
            //Init all promises
            for(let i=0; i < storeOwners.length; i++){
              console.log('getting stores of Owner', storeOwners[i][1]);
              numberStores = storeOwners[i][4].toNumber();
              console.log('number stores:', numberStores);
              storeOwnerAddress = storeOwners[i][2]
              for(let j=0; j < numberStores; j++){ //4 is the number of stores 
                promises.push(contract.getStoreAtIndex.call(storeOwnerAddress, j)); //address is 2nd element
              }
            }

            console.log('Number of promises', promises.length);
            Promise.all(promises).then(function(stores) {
              console.log('Stores found', stores.length);
                for(const store of stores) {
                  allStores.push({
                    index: store[0].toNumber(), 
                    description: store[1], 
                    numberProducts: store[2].toNumber(), 
                    balanceWei: store[3].toNumber(),
                    balanceEth: web3.utils.fromWei(store[3].toNumber().toString(), 'ether'),
                    storeOwnerAddress: store[4], 
                  });
                }

              console.log('Commiting stores', allStores);
              commit('SET_ALL_STORES', allStores);                 
            
            }).catch((err) => { console.log(err); });                
          }).catch((err) => { console.log(err); });    
        });
      });    
    },    
    ACTION_SET_STORE_OWNER_STATUS: ({commit, state, dispatch}, payload) => {
      console.log('inside ACTION_SET_STORE_OWNER_STATUS', payload);
      let methodName = '';
      
      payload.status === false ? methodName = 'activateStoreOwner': methodName = 'deactivateStoreOwner';      
      state.MarketPlace.deployed().then((contract) => {
        contract[methodName](payload.storeOwnerAddress,{ from: state.account, gas: 1000000 }).then((result) => {
          console.log('block mined', result);
        }).catch((err) => {
          console.log(err);
        });

        if(!LogStoreOwnerStatusChanged){
          LogStoreOwnerStatusChanged = contract.LogStoreOwnerStatusChanged();
    
          LogStoreOwnerStatusChanged.watch(function(error, result){
            console.log('LogStoreOwnerStatusChanged caught', result);
            commit('SET_IS_LOADER_VISIBLE', false);
            dispatch('ACTION_SET_STORE_OWNERS');
          });
        }
      });  
    },    
    ACTION_SET_STORE_OWNERS: ({commit, state}) => {
      console.log('inside ACTION_SET_STORE_OWNERS')        
      state.MarketPlace.deployed().then((contract) => {
          contract.getStoreOwnersCount.call().then(count => {
              let promises = [];

              for(let i=0; i < count; i++){
                  promises.push(contract.getStoreOwnerAtIndex.call(i, {from: state.account}));
              }

              Promise.all(promises).then(function(results) {
                  console.log(results);
                  commit('SET_STORE_OWNERS', results);
              }).catch((err) => { console.log(err); });    
          });
      });  
    },
    ACTION_SET_USER_ROLE: ({commit, dispatch, state}) => {
        state.MarketPlace.deployed().then((contract) => {
            //for some reason '{from: state.account}' must be specified, otherwise it uses the contract owner (don't understand)
            contract.getUserRole.call({from: state.account}).then(result => {
              const roleId = result.toNumber();
                //perform router redirection for Role's homepage
                let routeName = null;
                switch(roleId) {
                    case 0: routeName = 'home'; break;
                    case 1: routeName = 'admin'; break;  
                    case 2: routeName = 'store-owner'; break;
                    case 3: routeName = 'store-owner'; dispatch('storeOwnerState/ACTION_SET_CURRENT_STORE_OWNER'); break;
                    default: routeName = '/'; break;
                }
                console.log('After use role set, navitaging to', routeName);
                router.push({ name: routeName });                
                commit('SET_USER_ROLE', roleId);
            });
        });    
    },
    ACTION_REQUEST_STORE_OWNER: ({ commit, state, dispatch }, name) => {
      console.log('inside ACTION_REQUEST_STORE_OWNER')
      state.MarketPlace.deployed().then((contract) => {

        contract.requestStoreOwner(name, { from: state.account }).then((result) => {
          console.log('block mined', result);
        }).catch((err) => {
          console.log(err);
        });
        if(!LogStoreOwnerRequest){
          LogStoreOwnerRequest = contract.LogStoreOwnerRequest();
          LogStoreOwnerRequest.watch(function(error, result){
              console.log('LogStoreOwnerRequest event caught', result);
              commit('SET_IS_LOADER_VISIBLE', false);
              dispatch('ACTION_SET_USER_ROLE');
          });
        }
      });      
    },         
    ACTION_GET_CURRENT_NETWORK: ({commit, dispatch, state}) => {
     
      getNetIdString()
        .then((currentNetwork) => {
          console.log('Current network:', currentNetwork);
          commit('SET_CURRENT_NETWORK', currentNetwork);
        });
      getEtherscanAddress()
        .then((etherscanBase) => {
          commit('SET_ETHERSCAN_NETWORK', etherscanBase);
        });
    },
    ACTION_GET_USD_PRICE: ({commit, dispatch, state}) => {
      axios.get('https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD')
        .then((response) => {
          let currentPriceInUSD = response.data[0].price_usd;
          commit('SET_USD_PRICE', currentPriceInUSD);
        }, (response) => {
          console.error(response);
        });
    },
    ACTION_INIT_APP: ({commit, dispatch, state}, web3) => {
      //dispatch('ACTION_GET_USD_PRICE');
    
      console.log(web3.version);
      console.log(web3.currentProvider);

      MarketPlace.setProvider(web3.currentProvider);
      console.log(MarketPlace.web3.version.api);

      //NOTE: it looks like Metamask and node modules are Web3 1.00-betaX 
      //but initialising the contract object with truffleContract passes it web3 0.20.x

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof MarketPlace.currentProvider.sendAsync !== "function") {
        MarketPlace.currentProvider.sendAsync = function () {
          return MarketPlace.currentProvider.send.apply(
            MarketPlace.currentProvider, arguments
          );
        };
      }

      // Set the web3 instance
      commit('SET_WEB3', web3);
      console.log('Web3 version', web3.version);
      commit('SET_CONTRACT', MarketPlace);

      // Find current network
      dispatch('ACTION_GET_CURRENT_NETWORK');

      web3.eth.getAccounts().then((accounts) => {
          
          let account = accounts[0];
          
          if(accounts.length == 0){
            //router.push({name: 'no-metamask', params: {isInstalled: true}});
            console.log('Metamask IS installed')
            commit('SET_IS_METAMASK_INSTALLED', true);
            router.push('no-metamask');
          }
          
          const setAccountAndBalance = (account) => {
            return web3.eth.getBalance(account).then((balance) => {
                let accountBalance = Web3.utils.fromWei(balance);
                // store the account details                
                commit('SET_ACCOUNT', {account, accountBalance});
                console.log('Dispatching ACTION_SET_USER_ROLE...');
                dispatch('ACTION_SET_USER_ROLE');                
              }).catch((err) => { console.log(err)});
          };

          const refreshHandler = () => {
            web3.eth.getAccounts().then((updatedAccounts) => {
                if (updatedAccounts[0] !== account) {
                  console.log(`Account changed from: ${account} to ${updatedAccounts[0]}`);
                  account = updatedAccounts[0];
                  commit('resetState');
                  router.push('/');
                  return setAccountAndBalance(account);
                }
            });
          };

          // Every second check if the main account has changed
          setInterval(refreshHandler, 1000);

          if (account) {
            return setAccountAndBalance(account);
          }
        }).catch(function (error) {
          console.log('ERROR - account locked', error);
          //Show the user the message to install Metamask
          console.log('No metamask installed')
          commit('SET_IS_METAMASK_INSTALLED', false);
          router.push('no-metamask');          
        });
    },
  }
});

export default store;
