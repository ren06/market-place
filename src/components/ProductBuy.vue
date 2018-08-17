<template>
    <div>
        <h4>{{ getUserRole }}</h4>
        <p><u>Product {{ currentProduct.description }} of Store {{ currentStore.description }} </u><button v-on:click="back()">Back</button></p>     
        <div> {{ infoMessage }} </div>
        <div class="wrapper"> 
            <div class="row"></div> 
              <div class="box">Description</div>
              <div class="box"></div>
              <div class="box">{{ currentProduct.description }}</div>
            <div class="row"></div>                 
              <div class="box">Price</div>
              <div class="box"></div>
              <div class="box">{{ currentProduct.priceEth }}</div>
            <div class="row"></div>                 
              <div class="box">Quantity available</div>
              <div class="box"></div>
              <div class="box">{{ currentProduct.quantity }}</div>     
            <div class="row"></div>
              <div class="box">Quantity</div>
              <div class="box"><input v-model="cartQuantity"></div>                 
              <div class="box"><button v-on:click="buyProduct(currentProduct, cartQuantity)">Buy</button></div>
        </div>
       
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import router from '../router';

export default {
  mounted () {
    //console.log('StoreOwner.vue Mounted');
    //this.$store.dispatch('storeOwnerState/ACTION_SET_PRODUCTS', null, {root: true});
  },
  data() {
    return {
      cartQuantity: 1
    }
  },  
  computed: {
    ...mapState('storeOwnerState', ['currentStore', 'currentProduct']),
    ...mapState(['infoMessage']),
    ...mapGetters(['getUserRole']),
    ...mapGetters('storeOwnerState', ['getProducts', 'getCurrentStoreProducts']),
    description: {
      get () {
        return this.$store.state.storeOwnerState.currentProduct.description;
      },
      set (value) {
        this.UPDATE_FIELD_CURRENT_PRODUCT({ name: 'description', value })
      }
    },
    price: {
      get () {
        return this.$store.state.storeOwnerState.currentProduct.price;
      },
      set (value) {
        this.UPDATE_FIELD_CURRENT_PRODUCT({ name: 'price', value })
      }
    },
    quantity: {
      get () {
        return this.$store.state.storeOwnerState.currentProduct.quantity;
      },
      set (value) {
        this.UPDATE_FIELD_CURRENT_PRODUCT({ name: 'quantity', value })
      }
    }
  },  
  methods: {
    ...mapMutations('storeOwnerState', ['UPDATE_FIELD_CURRENT_PRODUCT']),
    ...mapMutations(['SET_INFO_MESSAGE']),
    ...mapActions([
      'storeOwnerState/ACTION_BUY_PRODUCT'
    ]),
    buyProduct: function (product, quantity) {
      this.$store.dispatch('storeOwnerState/ACTION_BUY_PRODUCT', { product, quantity });
    },
    back: function() {
      //clear 
      this.SET_INFO_MESSAGE('');
      router.replace({ name: 'public-store' });
    }
  }
}
</script>

<style scoped>
.wrapper {
  display: grid;
  /* grid-template-columns: repeat(3, minmax(50px, 1fr)); */
  grid-template-columns: repeat(5, 1fr)
  /* background-color: #fff;
  color: #444;*/
  /* max-width: 800px;  */
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(5, 1fr)
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
