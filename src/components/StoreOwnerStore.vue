<template>
    <div>
        <p>{{ getCurrentStoreOwner.name }} > {{ currentStore.description }} <button v-on:click="back()">Go Back</button></p>
        <div style="position:relative; font-size: 50%" >
          Balance {{ currentStore.balanceEth }} ETH
          <input size="4" v-model="withdrawAmount">
          <button v-show="!isLoaderVisible" class="btn" v-on:click="withdraw(currentStore.index, withdrawAmount)"> Withdraw</button>
          <img class="loaderImg" v-show="isLoaderVisible" src="@/assets/loader.svg" />          
        </div>
        <p>
        <p style="font-size: 90%">Products</p>          
        <div class="infoMessage"> {{ infoMessage }} </div>
        <div style="position:relative; font-size: 50%">
          Descr. <input size="20" v-model="newProductDescription">
          Price <input size="3" v-model="newProductPrice"> ETH
          Quantity <input size="4" v-model="newProductQuantity">
          <button v-show="!isLoaderVisible" class="btn" v-on:click="addProduct(newProductDescription, newProductPrice, newProductQuantity)">Add new product</button>
          <img class="loaderImg" v-show="isLoaderVisible" src="@/assets/loader.svg" />
        </div>
        <p>      
        <div class="wrapper"> 
          <div class="box">Id</div>
          <div class="box">Index</div>
          <div class="box">Description</div>
          <div class="box">Price</div>
          <div class="box">Quantity</div>          
          <div class="box"></div>
          <div class="row" v-for="(product, ind) in getCurrentStoreProducts " v-bind:key="ind">
            <div class="box">{{ product.id }}</div>
            <div class="box">{{ product.index }}</div>
            <div class="box">{{ product.description }}</div>
            <div class="box">{{ product.priceEth }} ETH</div>
            <div class="box">{{ product.quantity }}</div>
            <div class="box"><button v-on:click="manageProduct(product)">Manage Product</button></div>
          </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import router from '../router';

export default {
  mounted () {
    console.log('StoreOwnerStore.vue Mounted');
    const storeOwnerAddress = this.$store.state.account;
    this.$store.dispatch('storeOwnerState/ACTION_SET_PRODUCTS', storeOwnerAddress, {root: true});
  },
  data() {
    return {
      withdrawAmount: 1,
      newProductDescription: 'New Product',
      newProductPrice: 0.1,
      newProductQuantity: 10
    }
  },
  computed: {
    ...mapState('storeOwnerState', ['currentStore']),
    ...mapState(['infoMessage', 'isLoaderVisible']),
    ...mapGetters(['getUserRole']),
    ...mapGetters('storeOwnerState', ['getProducts', 'getCurrentStoreProducts', 'getCurrentStoreOwner'])
  },  
  methods: {
    ...mapMutations('storeOwnerState', ['SET_CURRENT_PRODUCT']),
    ...mapMutations(['SET_INFO_MESSAGE', 'SET_IS_LOADER_VISIBLE']),        
    ...mapActions(['storeOwnerState/ACTION_SET_PRODUCTS', 'storeOwnerState/ACTION_ADD_STORE']),
    addProduct: function (newProductDescription, newProductPrice, newProductQuantity) {
      console.log('inside Method addProduct', status);
      this.SET_IS_LOADER_VISIBLE(true);            
      const payload = {description: newProductDescription, price: newProductPrice, quantity: newProductQuantity};
      this.$store.dispatch('storeOwnerState/ACTION_ADD_PRODUCT', payload);
    },
    manageProduct: function (product) {
      this.SET_CURRENT_PRODUCT(product);
      router.replace({ name: 'product' });
    },
    back: function() {
      this.SET_INFO_MESSAGE('');
      router.replace({ name: 'store-owner' });
    },
    withdraw: function (storeIndex, withdrawAmount) {
      this.SET_IS_LOADER_VISIBLE(true);
      this.SET_INFO_MESSAGE('');
      this.$store.dispatch('storeOwnerState/ACTION_WITHDRAW', {storeIndex, withdrawAmount});
    } 
  }
}
</script>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: repeat(6, 1fr)
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(6, 1fr)
}

.box {
  padding: 20px;
  font-size: 50%;
}
</style>
