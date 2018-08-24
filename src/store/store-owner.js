import router from '../router';
import web3 from 'web3';

let LogStoreOwnerWithdraw = null;
let LogUserBuyProduct = null;
let LogStoreOwnerUpdateProduct = null;
let LogStoreOwnerDeleteProduct = null;
let LogStoreOwnerAddProduct = null;
let LogStoreOwnerAddStore = null;

const storeOwnerStateModule = {
  namespaced: true,
  state: {    
    currentStoreOwner: null,
    stores: [],
    currentStore: null,
    currentStoreProducts: [],
    currentProduct: null
  },
  getters: {    
    getStores: (state) => {
      return state.stores;
    },
    getCurrentStoreOwner: (state, rootState) => {
      if (state.currentStoreOwner) {
        return state.currentStoreOwner;
      } else {
        return {name: 'Store Owner', address: rootState.account};
      }
    },    
    getCurrentStoreProducts: (state) => {      
      return state.currentStoreProducts;
    },
    getTotalBalance: (state) => {
      let total = 0;
      for (const store of state.stores) {
        total += store.balanceWei;
      }
      return web3.utils.fromWei(total.toString(), 'ether');
    }
  },
  mutations: {
    SET_PRODUCTS: (state, { products, storeOwnerAddress, storeIndex }) => {
      console.log('inside SET_PRODUCTS');
      //clear the array first
      while (state.currentStoreProducts.length > 0) {
        state.currentStoreProducts.pop();
      }
      for (const product of products) {
        state.currentStoreProducts.push({
          index: product[0].toNumber(), 
          description: product[1],
          priceEth: web3.utils.fromWei(product[2].toString(), 'ether'), //.toNumber()
          priceWei: product[2].toString(),
          quantity: product[3].toNumber(),
          id: product[4].toNumber(),
          storeOwnerAddress: storeOwnerAddress,
          storeIndex: storeIndex
        });
      }
      console.log('state.currentStoreProducts number:', state.currentStoreProducts.length);
    },
    SET_STORES: (state, payload) => {
      console.log('inside SET_STORES', payload);
      //clear the array first (only way for Vue to refresh properly)
      while (state.stores.length > 0) {
        state.stores.pop();
      }
      for (const store of payload) {
        state.stores.push({index: store[0].toNumber(), 
          description: store[1], 
          numberProducts: store[2].toNumber(), 
          balanceWei: store[3].toNumber(),
          balanceEth: web3.utils.fromWei(store[3].toNumber().toString(), 'ether')
        });
      }
    },
    SET_CURRENT_STORE: (state, currentStore) => {
      console.log('inside SET_CURRENT_STORE', currentStore.description);
      state.currentStore = currentStore;
    },
    SET_CURRENT_PRODUCT: (state, currentProduct) => {
      console.log('inside SET_CURRENT_PRODUCT', currentProduct.description);
      state.currentProduct = currentProduct;
    },
    SET_CURRENT_STORE_OWNER: (state, currentStoreOwner) => {
      console.log('inside SET_CURRENT_STORE_OWNER', currentStoreOwner.name);
      state.currentStoreOwner = currentStoreOwner;
    },    
    UPDATE_FIELD_CURRENT_PRODUCT: (state, field) => {
      console.log('inside UPDATE_FIELD_CURRENT_PRODUCT');
      state.currentProduct[field.name] = field.value;
    }
  },
  actions: {
    ACTION_WITHDRAW: ({commit, rootState, state}, {storeIndex, withdrawAmount}) => {
      console.log('inside ACTION_WITHDRAW')        
      rootState.MarketPlace.deployed().then((contract) => {
        // console.log(`Buying ${quantity} product(s) of Owner ${product.storeOwnerAddress} Store ${product.storeIndex} Product ${product.index}`);        
      
        const withdrawAmountWei = web3.utils.toBN(web3.utils.toWei(withdrawAmount.toString(), 'ether')).toString();
        console.log(storeIndex, withdrawAmountWei);
        contract.storeOwnerWithdraw(storeIndex, withdrawAmountWei, {from: rootState.account, gas: 100000}).then((result) => {
          console.log('storeOwnerWithdraw function call mined', result);
        }).catch((err) => {
          commit('SET_INFO_MESSAGE', 'Error Withdrawing', { root: true })          
          console.log(err);
        });
  
        if (!LogStoreOwnerWithdraw) {
          LogStoreOwnerWithdraw = contract.LogStoreOwnerWithdraw();
    
          LogStoreOwnerWithdraw.watch(function(error, result) {
            if (error) {
              console.log(error);
            } else {              
              console.log('LogStoreOwnerWithdraw event caught', result);
              commit('SET_INFO_MESSAGE', 'Withdrawing completed!', { root: true });
              commit('SET_IS_LOADER_VISIBLE', false, { root: true });
              let store = state.currentStore;
              const balanceLeft = result.args.balanceLeft; //BigNumber
              store.balanceWei = balanceLeft.toNumber();
              store.balanceEth = web3.utils.fromWei(balanceLeft.toString(), 'ether');
              commit('SET_CURRENT_STORE', store);
            }
          });
        }
      });      
    },
    ACTION_SET_CURRENT_STORE_OWNER: ({commit, rootState, state}) => {
      console.log('inside ACTION_SET_CURRENT_STORE_OWNER', rootState.account)
      rootState.MarketPlace.deployed().then((contract) => {
        contract.getStoreOwnerAtAddress(rootState.account).then((result) => {
          const storeOwner = { 
            index: result[0],
            name: result[1],
            addr: result[2],
            isActive: result[3],
            numberStores: result[4]
          };
          commit('SET_CURRENT_STORE_OWNER', storeOwner);
        }).catch((err) => {
          console.log(err);
        });
      });  
    },      
    /**** PRODUCTS ****/
    ACTION_BUY_PRODUCT: ({commit, rootState, state}, { product, quantity }) => {
      console.log('inside ACTION_BUY_PRODUCT')        
      rootState.MarketPlace.deployed().then((contract) => {
        console.log(`Buying ${quantity} product(s) of Owner ${product.storeOwnerAddress} Store ${product.storeIndex} Product ${product.index}`);        
        console.log(product.priceWei, quantity);
        const totalValue = web3.utils.toBN(product.priceWei * quantity);
        
        contract.buyProduct(product.storeOwnerAddress, product.storeIndex, product.index, quantity, 
          {from: rootState.account, value: totalValue, gas: 200000}).then((result) => {
          console.log('buyProduct function call mined', result);
        }).catch((err) => {
          commit('SET_INFO_MESSAGE', 'Error buying Prodcut', { root: true })
          //rootState.commit('SET_INFO_MESSAGE', 'Error buying Prodcut');
          console.log(err);
        });

        if (!LogUserBuyProduct) {
          LogUserBuyProduct = contract.LogUserBuyProduct();

          LogUserBuyProduct.watch(function(error, result) {
            if (error) {
              console.log(error);
            } else {              
              console.log('LogUserBuyProduct event caught', result);
              product.quantity = Number(result.args.quantityLeft);
              
              //update quantity
              commit('SET_CURRENT_PRODUCT', product);
              //tell user the purchase went fine
              commit('SET_INFO_MESSAGE', `${quantity} ${product.description} bought successfuly!`, { root: true });
              commit('SET_IS_LOADER_VISIBLE', false, { root: true });
            }
          });
        }
      });      
    },
    ACTION_UPDATE_PRODUCT: ({dispatch, rootState, state, commit}) => {
      console.log('inside ACTION_UPDATE_PRODUCT')     
      rootState.MarketPlace.deployed().then((contract) => {
        console.log('updating Product with:', state.currentStore.index, state.currentProduct.index, state.currentProduct.description, 
          state.currentProduct.priceEth, state.currentProduct.quantity);
        const priceWei = web3.utils.toWei(state.currentProduct.priceEth.toString(), 'ether');
        contract.updateProduct(state.currentStore.index, state.currentProduct.index, state.currentProduct.description, 
          priceWei, state.currentProduct.quantity, { gas: 100000, from: rootState.account }).then((result) => {
          console.log('updateProduct function call mined', result);
        }).catch((err) => {
          console.log(err);
        });

        if (!LogStoreOwnerUpdateProduct) {
          LogStoreOwnerUpdateProduct = contract.LogStoreOwnerUpdateProduct();

          LogStoreOwnerUpdateProduct.watch(function(error, result) {
            if (error) {
              console.log(error);
            } else {
              console.log('LogStoreOwnerUpdateProduct event caught', result);
              commit('SET_INFO_MESSAGE', 'Product updated!', { root: true })                
              dispatch('ACTION_SET_PRODUCTS', rootState.account);
              commit('SET_IS_LOADER_VISIBLE', false, { root: true });              
              //router.replace({ name: 'store-owner-store' });
            }
          });
        }
      });  
    },    
    ACTION_DELETE_PRODUCT: ({dispatch, rootState, state, commit}) => {
      console.log('inside ACTION_DELETE_PRODUCT')     
      rootState.MarketPlace.deployed().then((contract) => {
        // deleteProduct(uint storeIndex, uint productIndex) 
        contract.deleteProduct(state.currentStore.index, state.currentProduct.index, { gas: 100000, from: rootState.account }).then((result) => {
          console.log('deleteProduct function call mined', result);
        }).catch((err) => {
          console.log(err);
        });

        if (!LogStoreOwnerDeleteProduct) {
          LogStoreOwnerDeleteProduct = contract.LogStoreOwnerDeleteProduct();
          LogStoreOwnerDeleteProduct.watch(function(error, result) {
            if (error) {
              console.log(error);
            } else {
              console.log('LogStoreOwnerDeleteProduct event caught', result);
              dispatch('ACTION_SET_PRODUCTS', rootState.account);
              commit('SET_IS_LOADER_VISIBLE', false, { root: true });
              router.replace({ name: 'store-owner-store' });
            }
          });
        }
      });  
    },      
    ACTION_ADD_PRODUCT: ({dispatch, rootState, state, commit}, payload) => {
      console.log('inside ACTION_ADD_PRODUCT')     
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

        if (!LogStoreOwnerAddProduct) {
          LogStoreOwnerAddProduct = contract.LogStoreOwnerAddProduct();
          LogStoreOwnerAddProduct.watch(function(error, result) {
            if (error) {
              console.log(error);
            } else {
              console.log('LogStoreOwnerAddProduct event caught', result);
              commit('SET_IS_LOADER_VISIBLE', false, { root: true });
              dispatch('ACTION_SET_PRODUCTS', rootState.account);
            }
          });
        }
      });
    },    
    ACTION_SET_PRODUCTS: ({commit, rootState, state}, storeOwnerAddress) => {
      console.log('inside ACTION_SET_PRODUCTS', storeOwnerAddress);
      rootState.MarketPlace.deployed().then((contract) => {
        //function getProductsCount(address storeOwnerAddress, uint storeIndex) public view returns(uint){
        console.log('current store:', state.currentStore.index);
        contract.getProductsCount.call(storeOwnerAddress, state.currentStore.index).then(count => {
          let promises = [];
  
          for (let i = 0; i < count; i++) {
            //function getProductAt(address storeOwnerAddress, uint storeIndex, uint productIndex) public view returns(uint, string, uint){
            promises.push(contract.getProductAt.call(storeOwnerAddress, state.currentStore.index, i));
          }
  
          Promise.all(promises).then(function(products) {
            console.log('PRODUCTS found:', products.length);
            commit('SET_PRODUCTS', { products, storeOwnerAddress, storeIndex: state.currentStore.index });
          }).catch((err) => { console.log(err); });    
        });
      });  
    },
    /**** STORES ****/
    ACTION_ADD_STORE: ({dispatch, rootState, commit}, storeName) => {
      console.log('inside ACTION_ADD_STORE')     
      //function addStore(string description) public isActiveStoreOwner returns (uint storeIndex){   
      console.log(storeName);
      rootState.MarketPlace.deployed().then((contract) => {
        contract.addStore(storeName, { from: rootState.account, gas: 1000000 }).then((result) => {
          console.log('addStore function call mined', result);
        }).catch((err) => {
          console.log(err);
          console.log('Is the Store Owner Active?');
        });

        if (!LogStoreOwnerAddStore) {
          LogStoreOwnerAddStore = contract.LogStoreOwnerAddStore();
          LogStoreOwnerAddStore.watch(function(error, result) {
            if (error) {
              console.log(error);
            } else {
              console.log('LogStoreOwnerAddStore event caught', result);
              commit('SET_IS_LOADER_VISIBLE', false, { root: true });              
              dispatch('ACTION_SET_STORES');
            }
          });
        }
      });  
    },    
    ACTION_SET_STORES: ({commit, rootState}) => {
      console.log('inside ACTION_SET_STORES')        
      rootState.MarketPlace.deployed().then((contract) => {
        console.log('param:', rootState.account)
        contract.getStoresCount.call(rootState.account, {from: rootState.account}).then(count => {
          let promises = [];
          console.log('Number of stores:', count.toNumber());
          for (let i = 0; i < count; i++) {
            console.log('adding index', i);  
            promises.push(contract.getStoreAtIndex.call(rootState.account, i, {from: rootState.account}));
          }

          Promise.all(promises).then(function(results) {
            console.log(results);
            commit('SET_STORES', results);
          }).catch((err) => { console.log(err); });    
        });
      });  
    }
  }
};

export default storeOwnerStateModule;
