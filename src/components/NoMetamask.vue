<template>
  <div >
    <p v-if="isMetamaskInstalled">Please log-in to Metamask!</p>
    <div v-else>
      <p>Please install Metamask!</p>
      <p style="font-size: 50%">You must use Firefox or Chrome and install Metamask at <a href="https://metamask.io/">https://metamask.io </a></p> 
    </div> 
 </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'NoMetamask',
  computed: {
    ...mapState(['isMetamaskInstalled'])
  }
};
</script>

<style scoped></style>
