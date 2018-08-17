<template>
    <div>
        <h4>{{ getUserRole }}</h4>
        <p><u>Product {{ currentProduct.index }} of Store {{ currentStore.description }} </u><button v-on:click="back()">Back</button></p>
        <button v-on:click="saveProduct()">Save</button>
        <div class="wrapper"> 
            <div class="row"></div> 
                <div class="box">Description</div><div class="box"><input v-model="description"></div>
            <div class="row"></div>                 
                <div class="box">Price</div><div class="box"><input v-model="price"></div>
            <div class="row"></div>                 
                <div class="box">Quantity</div><div class="box"><input v-model="quantity"></div>            
        </div>
        <button v-on:click="deleteProduct()">Delete</button>
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
    ...mapActions([
      'storeOwnerState/ACTION_SET_PRODUCTS', 'storeOwnerState/ACTION_ADD_STORE', 
      'storeOwnerState/ACTION_DELETE_PRODUCT', 'storeOwnerState/ACTION_UPDATE_PRODUCT'
    ]),
    deleteProduct: function () {
      this.$store.dispatch('storeOwnerState/ACTION_DELETE_PRODUCT');      
    },
    saveProduct: function () {
      this.$store.dispatch('storeOwnerState/ACTION_UPDATE_PRODUCT');      
    },
    back: function() {
      router.replace({ name: 'store-owner-store' });
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
