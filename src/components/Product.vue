<template>
    <div>
        <p>{{ getCurrentStoreOwner.name }} >> {{ currentStore.description }} >> Product {{ currentProduct.index }} <button v-on:click="back()">Go Back</button></p>
        <div class="infoMessage"> {{ infoMessage }} </div>
        <div class="wrapper"> 
            <div class="row"></div> 
                <div class="box">Description</div><div class="box"><input size="20" v-model="description"></div>
            <div class="row"></div>                 
                <div class="box">Price</div><div class="box"><input size="3" v-model="price"></div>
            <div class="row"></div>                 
                <div class="box">Quantity</div><div class="box"><input size="4" v-model="quantity"></div>            
        </div>
        <div style="margin: 0 auto; width: 100%; text-align: center;">
          <button v-show="!isLoaderVisible" class="btn" v-on:click="saveProduct()">Save</button>
          <img class="loaderImg" style="position: static" v-show="isLoaderVisible" src="@/assets/loader.svg" />
          <button v-show="!isLoaderVisible" class="btn" v-on:click="deleteProduct(newProductDescription, newProductPrice, newProductQuantity)">Delete</button>
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
    }
  },  
  computed: {
    ...mapState('storeOwnerState', ['currentStore', 'currentProduct']),
    ...mapState(['infoMessage', 'isLoaderVisible']),    
    ...mapGetters(['getUserRole']),
    ...mapGetters('storeOwnerState', ['getProducts', 'getCurrentStoreProducts', 'getCurrentStoreOwner']),  
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
        return this.$store.state.storeOwnerState.currentProduct.priceEth;
      },
      set (value) {
        this.UPDATE_FIELD_CURRENT_PRODUCT({ name: 'priceEth', value })
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
      'storeOwnerState/ACTION_SET_PRODUCTS', 'storeOwnerState/ACTION_ADD_STORE', 
      'storeOwnerState/ACTION_DELETE_PRODUCT', 'storeOwnerState/ACTION_UPDATE_PRODUCT'
    ]),
    deleteProduct: function () {
      this.SET_INFO_MESSAGE('');
      this.SET_IS_LOADER_VISIBLE(true);
      this.$store.dispatch('storeOwnerState/ACTION_DELETE_PRODUCT');      
    },
    saveProduct: function () {
      this.SET_INFO_MESSAGE('');
      this.SET_IS_LOADER_VISIBLE(true);
      this.$store.dispatch('storeOwnerState/ACTION_UPDATE_PRODUCT');      
    },
    back: function() {
      this.SET_INFO_MESSAGE('');
      router.replace({ name: 'store-owner-store' });
    }
  }
}
</script>

<style scoped>

.wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr)
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, 1fr)
}

.box {
  padding: 20px;
  font-size: 50%;
}
</style>
