<template>
    <div>
        <p>Product <i>{{ currentProduct.description }} </i> of Store <i> {{ currentStore.description }}</i><button v-on:click="back()">Go Back</button></p>     
        <div class="infoMessage"> {{ infoMessage }} </div>
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
              <div class="box" style="position:relative">
                <button v-show="!isLoaderVisible" class="btn" v-on:click="buyProduct(currentProduct, cartQuantity)">Buy</button>
                <img class="loaderImg2" align="middle" v-show="isLoaderVisible" src="@/assets/loader.svg" />
              </div>              
              <!-- <div class="box"><button v-on:click="buyProduct(currentProduct, cartQuantity)">Buy</button></div> -->
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
    ...mapState(['infoMessage', 'isLoaderVisible']),
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
    ...mapMutations(['SET_INFO_MESSAGE', 'SET_IS_LOADER_VISIBLE']),
    ...mapActions([
      'storeOwnerState/ACTION_BUY_PRODUCT'
    ]),
    buyProduct: function (product, quantity) {
      this.SET_INFO_MESSAGE('');
      this.SET_IS_LOADER_VISIBLE(true);
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
  grid-template-columns: repeat(3, 1fr)
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr)
}

.box {
  padding: 20px;
  font-size: 50%;
}
</style>
