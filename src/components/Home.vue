<template>
    <div>
        <p> Welcome! <span style="font-size: 50%; vertical-align:middle;">({{ account }}) </span></p> 
        <p style="font-size: 80%;">Please pick a Store or &nbsp;
          <button v-show="!isLoaderVisible" class="btn" style="vertical-align:middle; font-size: 70%;" v-on:click="registerStoreOwner(storeOwnerName)">Register as a store owner</button>
          <img class="loaderImg" style="position: static" v-show="isLoaderVisible" src="@/assets/loader.svg" />            
          <input v-model="storeOwnerName">
        </p>
        <div class="wrapper"> 
          <div class="box">Index</div>
          <div class="box">Description</div>
          <div class="box">No. Products</div>
          <div class="box"></div>
          <div class="row" v-for="(store, index) in getStores" v-bind:key="index">
              <div class="box">{{ store.index }}</div>
              <div class="box">{{ store.description }}</div>
              <div class="box">{{ store.numberProducts }}</div>
              <div class="box"><button v-on:click="viewProducts(store)">View Products</button></div>
          </div>
        </div>        
    </div>
</template>

<script>
/* eslint-disable */
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
import router from '../router';

//mapState simply maps store members, as component members for easy access. For example a component.
//can take 2 types of values: An Array with direct name mapping, or an object key/value pairs.
export default {
    mounted () {
        console.log('Home.vue Mounted, setting stores');
        this.$store.dispatch('ACTION_SET_ALL_STORES');
    },
    data() { //used by v-model
        return {
            storeOwnerName: 'Mr. StoreOwner'
        }
    },
    components: { },
    computed: {
        ...mapState(['requestStoreOwnerStatus', 'userRole', 'account', 'isLoaderVisible']),
        ...mapGetters(['getUserRole', 'getStores'])
    },
    methods: {
        ...mapMutations(['storeOwnerState/SET_CURRENT_STORE', 'SET_IS_LOADER_VISIBLE']),
        ...mapActions(['ACTION_REQUEST_STORE_OWNER']),
        registerStoreOwner: function (storeOwnerName) {
            this.SET_IS_LOADER_VISIBLE(true);
            console.log('inside Method registerStoreOwner')
            this.ACTION_REQUEST_STORE_OWNER(storeOwnerName);
        },
        viewProducts(store){
            console.log(store.description);
            this['storeOwnerState/SET_CURRENT_STORE'](store);
            router.replace({ name: 'public-store' });
        }
    }
}
</script>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr)
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr)
}

.box {
  padding: 20px;
  font-size: 50%;
}
</style>
