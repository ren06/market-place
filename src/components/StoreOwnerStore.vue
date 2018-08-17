<template>
    <div>
        <h4>{{ getCurrentStoreOwner.name }} >> {{ currentStore.description }} <button v-on:click="back()">Back</button></h4>        
        <h5>Balance {{ currentStore.balanceEth }} ETH <input v-model="withdrawAmount"><button v-on:click="withdraw(currentStore.index, withdrawAmount)"> Withdraw</button></h5>
        <div> {{ infoMessage }} </div>
        <button v-on:click="addProduct()">Add new product</button>
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
      withdrawAmount: 0
    }
  },
  computed: {
    ...mapState('storeOwnerState', ['currentStore']),
    ...mapState(['infoMessage']),
    ...mapGetters(['getUserRole']),
    ...mapGetters('storeOwnerState', ['getProducts', 'getCurrentStoreProducts', 'getCurrentStoreOwner'])
  },  
  methods: {
    ...mapMutations('storeOwnerState', ['SET_CURRENT_PRODUCT']
    ),
    ...mapActions([
      'storeOwnerState/ACTION_SET_PRODUCTS', 'storeOwnerState/ACTION_ADD_STORE'
    ]
    ),
    addProduct: function (storeName) {
      console.log('inside Method addProduct', status);
      const payload = {description: 'My Product', price: Math.floor(Math.random() * 10) + 1, quantity: Math.floor(Math.random() * 10) + 1};
      this.$store.dispatch('storeOwnerState/ACTION_ADD_PRODUCT', payload);
    },
    manageProduct: function (product) {
      this.SET_CURRENT_PRODUCT(product);
      router.replace({ name: 'product' });
    },
    back: function() {
      router.replace({ name: 'store-owner' });
    },
    withdraw: function (storeIndex, withdrawAmount) {  
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
