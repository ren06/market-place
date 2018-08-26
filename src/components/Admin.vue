<template>
    <div>
        <p>{{ getUserRole }} Menu <span style="font-size: 50%; vertical-align:middle;">({{ account }}) </span></p>
        <p style="font-size: 80%;"> Store Owners </p>
        <div class="wrapper">
          <div class="box">Index</div>
          <div class="box">Name</div>
          <div class="box">Address</div>
          <div class="box">No. Stores</div>
          <div class="box">Status</div>
          <div class="box"></div>
          <div class="row" v-for="(storeOwner, index) in getStoreOwners" v-bind:key="index">
            <div class="box">{{ storeOwner.index }}</div>
            <div class="box">{{ storeOwner.name }}</div>
            <div class="box">{{ storeOwner.address }}</div>
            <div class="box">{{ storeOwner.numberStores }}</div>
            <div class="" style="position:relative">
              <button v-show="!isLoaderVisible" class="btn" v-on:click="toggleStoreOwnerStatus(storeOwner.address, storeOwner.active)"> {{ storeOwner.active? 'Deactivate' : 'Activate' }}</button>
              <img class="loaderImg2" align="middle" v-show="isLoaderVisible" src="@/assets/loader.svg" />
            </div>
           </div>
        </div>
        <p style="font-size: 80%;">Administrators</p>
        <div style="position:relative">
          <input size="40" v-model="newAdminAddress">
          <button v-show="!isLoaderVisible" class="btn" v-on:click="addAdministrator(newAdminAddress)">Add Administrator</button>
          <img class="loaderImg" v-show="isLoaderVisible" src="@/assets/loader.svg" />
        </div>
        <div class="wrapper2">
          <div class="box">Address</div>
          <div class="box">Is owner?</div>
          <div class="box"></div>
          <div class="row2" v-for="(admin, index) in administrators" v-bind:key="index">
            <!-- <div class="box">{{ admin.index }}</div> -->
            <div class="box">{{ admin.address }}</div>
            <div class="box">{{ admin.isOwner }}</div>
            <div v-if="admin.isOwner" class="" style="position:relative">
                <button v-show="!isLoaderVisible" class="btn" v-on:click="toggleContractState()"> {{ isContractPaused? 'Unpause' : 'Pause' }}</button>
                <img class="loaderImg2" align="middle" v-show="isLoaderVisible" src="@/assets/loader.svg" />
            </div>
          </div>
        </div>        
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';

export default {
  mounted () {
    console.log('Admin.vue Mounted');
    this.$store.dispatch('ACTION_SET_STORE_OWNERS');
    this.$store.dispatch('ACTION_SET_ADMINISTRATORS');
    this.$store.dispatch('ACTION_SET_IS_CONTRACT_PAUSED');
  },
  data() {
    return {
      newAdminAddress: '0x1100647062f4c3fEf846C5bd4acA8F8a260F93ec'
    }
  },  
  computed: {
    ...mapState(['administrators', 'isLoaderVisible', 'account', 'isContractPaused']),
    ...mapGetters(['getUserRole', 'getStoreOwners'])
  },  
  methods: {
    ...mapMutations(['SET_IS_LOADER_VISIBLE']),    
    ...mapActions(['ACTION_SET_STORE_OWNER_STATUS', 'ACTION_SET_ADMINISTRATORS', 'ACTION_ADD_ADMINISTRATOR', 'ACTION_TOGGLE_CONTRACT_STATUS']),
    toggleStoreOwnerStatus: function (storeOwnerAddress, status) {
      this.SET_IS_LOADER_VISIBLE(true);
      this.ACTION_SET_STORE_OWNER_STATUS({storeOwnerAddress, status});
    },
    toggleContractState: function () {
      this.SET_IS_LOADER_VISIBLE(true);
      this.ACTION_TOGGLE_CONTRACT_STATUS({status});
    },
    addAdministrator: function(newAdminAddress) {
      this.ACTION_ADD_ADMINISTRATOR(newAdminAddress);
      this.SET_IS_LOADER_VISIBLE(true);
      newAdminAddress = '';
    }
  }
}
</script>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: 50px 250px 400px 50px 100px 40px
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 50px 250px 400px 50px 100px 40px
}

.wrapper2 {
  display: grid;
  grid-template-columns: 1fr 150px 1fr
}

.row2 {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 150px 1fr
}

.box {
  padding: 20px;
  font-size: 50%;
}

</style>
