<template>
    <div>
        <h4>{{ getUserRole }} Menu</h4>
        <h5> Store Owners </h5>
        <div class="wrapper">
          <div class="box">Index</div>
          <div class="box">Name</div>
          <div class="box">Address</div>
          <div class="box">No. Stores</div>
          <div class="box">Status</div>
          <div class="row" v-for="(storeOwner, index) in getStoreOwners" v-bind:key="index">
            <div class="box">{{ storeOwner.index }}</div>
            <div class="box">{{ storeOwner.name }}</div>
            <div class="box">{{ storeOwner.address }}</div>
            <div class="box">{{ storeOwner.numberStores }}</div>
            <div class="box"><button v-on:click="toggleStoreOwnerStatus(storeOwner.address, storeOwner.active)"> {{ storeOwner.active? 'Deactivate' : 'Activate' }}</button></div>
           </div>
        </div>
        <h5> Administrators </h5>
        <input v-model="newAdminAddress"><button v-on:click="addAdministrator(newAdminAddress)">Add Administrator</button>
        <div class="wrapper2">
          <div class="box">Address</div>
          <div class="box">Status</div>
          <div class="row2" v-for="(admin, index) in administrators" v-bind:key="index">
            <div class="box">{{ admin.address }}</div>
            <div class="box">{{ admin.isOwner }}</div>
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
  },
  data() {
    return {
      newAdminAddress: ''
    }
  },  
  computed: {
    ...mapState(['administrators']),
    ...mapGetters(['getUserRole', 'getStoreOwners'])
  },  
  methods: {
    ...mapMutations([]),    
    ...mapActions(['ACTION_SET_STORE_OWNER_STATUS', 'ACTION_SET_ADMINISTRATORS']),
    toggleStoreOwnerStatus: function (storeOwnerAddress, status) {
      this.ACTION_SET_STORE_OWNER_STATUS({storeOwnerAddress, status});
    },
    addAdministrator: function(newAdminAddress) {
      this.ACTION_ADD_ADMINISTRATOR(newAdminAddress);
      newAdminAddress = '';
    }
  }
}
</script>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: 50px 250px 400px 50px 100px
}

.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 50px 250px 400px 50px 100px
}

.wrapper2 {
  display: grid;
  grid-template-columns: 1fr 1fr
}

.row2 {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr
}

.box {
  padding: 20px;
  font-size: 50%;
}
</style>
