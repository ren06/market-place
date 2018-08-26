import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Admin from '@/components/Admin';
import StoreOwner from '@/components/StoreOwner';
import StoreOwnerStore from '@/components/StoreOwnerStore';
import PublicStore from '@/components/PublicStore';
import Product from '@/components/Product';
import ProductBuy from '@/components/ProductBuy';
import NoMetamask from '@/components/NoMetamask';
import store from '../store';

//to make sure the account is set before executing any contract calls
const checkAccountSet = (to, from, next) => {
  //console.log('inside checkAccountSet', store.state.account);
  function proceed () {
    if (store.state.account) {
      next();
    }
  }
  if (!store.state.account) {
    store.watch((state) => store.state.account, (value) => {
      if (value === true) {
        proceed();
      }
    });
  } else {
    proceed();
  }
}

const checkCurrentStoreSet = (to, from, next) => {
  console.log('inside checkCurrentStoreSet', store.state.storeOwnerState.currentStore);
  function proceed () {
    if (store.state.storeOwnerState.currentStore) {
      next();
    }
  }
  if (!store.state.storeOwnerState.currentStore) {
    store.watch((state) => store.state.storeOwnerState.currentStore, (value) => {
      if (value === true) {
        proceed();
      }
    });
  } else {
    proceed();
  }
}

const checkCurrentProductSet = (to, from, next) => {
  console.log('inside checkCurrentProductSet', store.state.storeOwnerState.currentProduct);
  function proceed () {
    if (store.state.storeOwnerState.currentProduct) {
      next();
    }
  }
  if (!store.state.storeOwnerState.currentProduct) {
    store.watch((state) => store.state.storeOwnerState.currentProduct, (value) => {
      if (value === true) {
        proceed();
      }
    });
  } else {
    proceed();
  }
}

Vue.use(Router);

/* eslint-disable */
export default new Router({
   routes: [
    {   //Active Store Owner homepage
        path: '/store-owner',
        name: 'store-owner',
        // beforeEnter: checkCurrentStoreOwnerSet,
        beforeEnter: checkAccountSet,
        component: StoreOwner
    },       
    {   //Guest home page 
        path: '/',
        name: 'home',
        beforeEnter: checkAccountSet,
        component: Home
    },
    {   //Admin home page
        path: '/admin',
        name: 'admin',
        component: Admin
    },    
    {
        path: '/store-owner-store',
        name: 'store-owner-store',
        beforeEnter: checkCurrentStoreSet,
        component: StoreOwnerStore
    },
    {
        path: '/public-store',
        name: 'public-store',
        beforeEnter: checkCurrentStoreSet,
        component: PublicStore
    },         
    {  //Product Page (store owner)
      path: '/product',
      name: 'product',
      beforeEnter: checkCurrentProductSet,
      component: Product
    },
    {  //Product Page (shopper)
      path: '/buy-product',
      name: 'buy-product',
      beforeEnter: checkCurrentProductSet,
      component: ProductBuy
    },
    {  //No Metamask
        path: '/no-metamask',
        name: 'no-metamask',
        component: NoMetamask
      },    
  ]
});
