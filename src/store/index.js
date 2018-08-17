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

Vue.use(Vuex);

/* eslint-disable */
const store = new Vuex.Store({
  modules: {
    storeOwnerState,
  },
  state: {
    userRole: null, //0 Guest, 1 Administrator, 2 Inactive Store Ower, 3 Active Store Owner
    account: null,
    currentNetwork: null,
    accountBalance: null,
    MarketPlace: null,
    web3: null,
    currentUsdPrice: null,
    etherscanBase: null,
    administrators: [],
    //UI stuff
    currentValue: '',
    requestStoreOwnerStatus: '',
    storeOwners: [],
    stores: [],
    infoMessage: ''
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
  },
  //Calling mutations directly in the component is for synchronous events.
  //Should you need asyncronous functionality, you use Actions.
  actions: {
    ACTION_ADD_ADMINISTRATOR : ({ commit, state, dispatch }, newAdminAddress) => {
      console.log('inside ACTION_ADD_ADMINISTRATOR')     
      rootState.MarketPlace.deployed().then((contract) => {
        //addProduct(uint storeIndex, string description, uint price, uint quantity)
        console.log('current store index', state.currentStore.index, payload);
        const price = web3.utils.toWei(payload.price.toString(), 'ether');
        contract.addProduct(state.currentStore.index, payload.description, price, payload.quantity,
          { from: rootState.account, gas: 1000000 }).then((result) => {
          console.log('addProduct function call mined', result);
        }).catch((err) => {
          console.log(err);
        });
        const LogStoreOwnerAddProduct = contract.LogStoreOwnerAddProduct();
        LogStoreOwnerAddProduct.watch(function(error, result) {
          if (error) {
            console.log(error);
          } else {
            console.log('LogStoreOwnerAddProduct event caught', result);
            dispatch('ACTION_SET_PRODUCTS', rootState.account);
          }
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
                allAdministrators.push({
                  address: admin[1],
                  isOwner: false
                });
              }
              commit('SET_ADMINISTRATORS', allAdministrators);
            }).catch((err) => { console.log(err); });    
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
        contract[methodName](payload.storeOwnerAddress,{ from: state.account }).then((result) => {
          console.log('block mined', result);
        }).catch((err) => {
          console.log(err);
        });
        const LogStoreOwnerStatusChanged = contract.LogStoreOwnerStatusChanged();
  
        LogStoreOwnerStatusChanged.watch(function(error, result){
          console.log('LogStoreOwnerStatusChanged caught', result);
          dispatch('ACTION_SET_STORE_OWNERS');
        });
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
                    case 3: routeName = 'store-owner'; 
                      dispatch('storeOwnerState/ACTION_SET_CURRENT_STORE_OWNER');
                      break;
                    default: routeName = '/'; break;
                }
                console.log('After use role set, navitaging to', routeName);
                router.push({ name: routeName });                
                commit('SET_USER_ROLE', roleId);
            });
        });    
    },
    ACTION_REQUEST_STORE_OWNER: ({ commit, state, dispatch }, value) => {
      console.log('inside ACTION_REQUEST_STORE_OWNER')
      state.MarketPlace.deployed().then((contract) => {
        contract.requestStoreOwner("Renaud Theuillon", { from: state.account }).then((result) => {
          console.log('block mined', result);
        }).catch((err) => {
          console.log(err);
        });
        const LogStoreOwnerRequest = contract.LogStoreOwnerRequest();
        LogStoreOwnerRequest.watch(function(error, result){
            console.log('LogStoreOwnerRequest event caught', result);
            dispatch('ACTION_SET_USER_ROLE');
        });
      });      
    },         
    ACTION_GET_CURRENT_NETWORK: ({commit, dispatch, state}) => {
      getNetIdString()
        .then((currentNetwork) => {
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

      // NON-ASYNC action - set web3 provider on init
      MarketPlace.setProvider(web3.currentProvider);

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
      commit('SET_CONTRACT', MarketPlace);

      // Find current network
      dispatch('ACTION_GET_CURRENT_NETWORK');

      web3.eth.getAccounts().then((accounts) => {
          let account = accounts[0];

          const setAccountAndBalance = (account) => {
            return web3.eth.getBalance(account) .then((balance) => {
                let accountBalance = Web3.utils.fromWei(balance);
                // store the account details                
                commit('SET_ACCOUNT', {account, accountBalance});
                console.log('Dispatching ACTION_SET_USER_ROLE...');
                dispatch('ACTION_SET_USER_ROLE');
              });
          };

          const refreshHandler = () => {
            web3.eth.getAccounts().then((updatedAccounts) => {
                if (updatedAccounts[0] !== account) {
                  console.log(`Account changed from: ${account} to ${updatedAccounts[0]}`);
                  account = updatedAccounts[0];
                  commit('resetState');
                  return setAccountAndBalance(account);
                }
              });
          };

          // Every second check if the main account has changed
          setInterval(refreshHandler, 1000);

          if (account) {
            return setAccountAndBalance(account);
          }
        })
        .catch(function (error) {
          console.log('ERROR - account locked', error);
          // TODO handle locked metamask account
        });
    },
  }
});

export default store;
