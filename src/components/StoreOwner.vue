<template>
    <div>
        <p>Welcome {{ getCurrentStoreOwner.name }} <span style="font-size: 50%; vertical-align:middle;">({{ account }}) </span></p>
        <div v-if="getUserRole == 'Active Store Owner'">          
          <p style="font-size: 70%">Total Balance {{ getTotalBalance }} ETH</p>
          <p style="font-size: 90%">My Stores</p>
          <div style="position:relative">
            <input size="20" v-model="newStore">
            <button v-show="!isLoaderVisible" class="btn" v-on:click="addStore(newStore)">Add new store</button>
            <img class="loaderImg" v-show="isLoaderVisible" src="@/assets/loader.svg" />
          </div>          
          <p>
          <div class="wrapper"> 
            <div class="box">Index</div>
            <div class="box">Description</div>
            <div class="box">No. Products</div>
            <div class="box">Balance</div>
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
        <div v-else>Please wait for the administrator to approve your Store Owner request!</div>        
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import router from '../router';

export default {
  data() {
    return {
      newStore: 'New Store'
    }
  }, 
  created() {
    console.log('StoreOwner.vue Mounted');
    this.$store.dispatch('storeOwnerState/ACTION_SET_STORES');
  },
  computed: {
    ...mapState(['infoMessage', 'isLoaderVisible', 'account']),
    ...mapGetters(['getUserRole']),
    ...mapGetters('storeOwnerState', ['getStores', 'getTotalBalance', 'getCurrentStoreOwner'])
  },  
  methods: {
    ...mapMutations(['storeOwnerState/SET_CURRENT_STORE']),
    ...mapMutations(['SET_INFO_MESSAGE', 'SET_IS_LOADER_VISIBLE']),    
    ...mapActions(['storeOwnerState/ACTION_SET_STORES', 'storeOwnerState/ACTION_ADD_STORE']),
    addStore: function (storeName) {
      this.SET_IS_LOADER_VISIBLE(true);      
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
  grid-template-columns: repeat(5, 1fr)
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(5, 1fr)
}

.box {
  padding: 20px;
  font-size: 50%;
}
</style>
