<template>
    <div>
        <h4>{{ getUserRole }}</h4>
        <p>Products for Store {{ currentStore.description }} <button v-on:click="back()">Go Back</button></p>
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
            <div class="box"><button v-on:click="buyProduct(product)">Buy</button></div>
          </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import router from '../router';

export default {
  mounted () {
    //console.log('PublicStore.vue Mounted');
    const currentStoreOwnerAddress = this.$store.state.storeOwnerState.currentStore.storeOwnerAddress;
    console.log('current store owner in PublicStore.vue', currentStoreOwnerAddress)
    this.$store.dispatch('storeOwnerState/ACTION_SET_PRODUCTS', currentStoreOwnerAddress, {root: true});
  },
  data() {
    return {
    }
  },  
  computed: {
    ...mapState('storeOwnerState', ['currentStore']),
    ...mapGetters(['getUserRole']),
    ...mapGetters('storeOwnerState', ['getProducts', 'getCurrentStoreProducts'])
  },  
  methods: {
    ...mapMutations('storeOwnerState', ['SET_CURRENT_PRODUCT']
    ),
    ...mapActions([
      'storeOwnerState/ACTION_SET_PRODUCTS', 'storeOwnerState/ACTION_ADD_STORE'
    ]
    ),
    // addProduct: function (storeName) {
    //   console.log('inside Method addProduct', status);
    //   const payload = {description: 'My Product', price: Math.floor(Math.random() * 10) + 1, quantity: Math.floor(Math.random() * 10) + 1};
    //   this.$store.dispatch('storeOwnerState/ACTION_ADD_PRODUCT', payload);
    // },
    buyProduct: function (product) {
      this.SET_CURRENT_PRODUCT(product);
      router.replace({ name: 'buy-product' });
    },
    back: function() {
      router.replace({ name: 'home' });
    }    
  }
}
</script>

<style scoped>
.wrapper {
  display: grid;
  /* grid-template-columns: repeat(3, minmax(50px, 1fr)); */
  grid-template-columns: repeat(6, 1fr)
  /* background-color: #fff;
  color: #444;*/
  /* max-width: 800px;  */
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(6, 1fr)
}

/* div:nth-child(4) { grid-row-start: 2; }
div:nth-child(5) { grid-row-start: 3; } */

.box {
  /* background-color: #444;
  color: #fff; */
  /* border-radius: 5px; */
  padding: 20px;
  font-size: 50%;
}
</style>
