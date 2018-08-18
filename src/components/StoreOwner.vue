<template>
    <div>
        <h4>Welcome {{ getCurrentStoreOwner.name }}</h4>
        <div v-if="getUserRole == 'Active Store Owner'">
          <p><u>My Stores</u></p>
          <p>Total Balance {{ getTotalBalance }} ETH</p>          
          <button v-on:click="addStore()">Add new store</button>
          <div class="wrapper"> 
            <div class="box">Index</div>
            <div class="box">Description</div>
            <div class="box">No. Products</div>
            <div class="box">Balance</div>
            <div class="box"></div>
            <div class="box"></div>
            <div class="row" v-for="(store, index) in getStores" v-bind:key="index">
              <div class="box">{{ store.index }}</div>
              <div class="box">{{ store.description }}</div>
              <div class="box">{{ store.numberProducts }}</div>
              <div class="box">{{ store.balanceEth }} ETH</div>
              <div class="box"><button v-on:click="manageStore(store)"> Manage Store</button></div>
            </div>
          </div>
        </div>
        <div v-else>Wait for the administrator to approve your Store Owner request</div>        
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import router from '../router';

export default {
  created() {
    console.log('StoreOwner.vue Mounted');
    this.$store.dispatch('storeOwnerState/ACTION_SET_STORES');
  },
  computed: {
    ...mapState([]),
    ...mapGetters(['getUserRole']),
    ...mapGetters('storeOwnerState', ['getStores', 'getTotalBalance', 'getCurrentStoreOwner'])
  },  
  methods: {
    ...mapMutations(['storeOwnerState/SET_CURRENT_STORE']),
    ...mapActions(['storeOwnerState/ACTION_SET_STORES', 'storeOwnerState/ACTION_ADD_STORE']),
    addStore: function (storeName) {
      storeName = 'My Store';
      this.$store.dispatch('storeOwnerState/ACTION_ADD_STORE', storeName);
    },
    manageStore: function (store) {
      this['storeOwnerState/SET_CURRENT_STORE'](store);
      router.replace({ name: 'store-owner-store' });
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
