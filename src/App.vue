<template>
  <div id="app">
    <div class="container">
      <div class="header">
        <h3>Market Place</h3> 
        <p style="font-size: 50%" >&nbsp; on {{ currentNetwork }}</p>
      </div>
      <div class="left"></div>
      <div class="content">
        <router-view></router-view>
      </div>
      <div class="right"></div>
      <div class="footer">Powered by the Ethereum blokchain 2018</div>
    </div>
  </div>
</template>

<script>
/* global web3:true */
import Web3 from 'web3';
import { mapState } from 'vuex';

export default {
  name: 'app',
  components: {
  },
  computed: {
    ...mapState(['currentNetwork'])
  },
  mounted () {
    console.log('App.vue Mounted');    
  },  
  beforeCreate() {
    let bootStrappedWeb3;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      bootStrappedWeb3 = new Web3(web3.currentProvider);
      console.log(bootStrappedWeb3.version);
    } else {
      console.log('No web3! You should consider trying MetaMask or an Ethereum browser');
      console.log('Falling back to using HTTP Provider');

      bootStrappedWeb3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/nbCbdzC6IG9CF6hmvAVQ'));
    }

    window.web3 = bootStrappedWeb3;

    console.log('Bootstrap the full app');
    this.$store.dispatch('ACTION_INIT_APP', bootStrappedWeb3);
  }
};
</script>

<style>
.btn {
  /* default for <button>, but useful for <a> */
  display: inline-block;
  text-align: center;
  text-decoration: none;
  min-width: 80px;
  /* create a small space when buttons wrap on 2 lines */
  margin: 2px 0;

  /* invisible border (will be colored on hover/focus) */
  border: solid 1px transparent;
  border-radius: 4px;

  /* size comes from text & padding (no width/height) */
  padding: 0.25em 0.5em;

  /* make sure colors have enough contrast! */
  color: #ffffff;
  background-color: #9555af;
}
.loaderImg {
  width: 30px;
  height: 30px;
  position:absolute; 
  bottom:0;      
}

.infoMessage {
  color:#9555af;
  font-size: 70%;
}

.loaderImg2 {
  width: 30px;
  height: 30px;
  bottom:0;      
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* color: #2c3e50; */
  margin-top: 10px;
  height: 100%;
}

.container {
  height: 100%;
  display: grid;
  grid-gap: 3px;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 70px auto 70px;
  grid-template-areas:
    'h h h h h h h h h h h h'
    'l c c c c c c c c c c r'
    'l f f f f f f f f f f r';
}

.header {
  grid-area: h;
  align-items: center;
  font-size: 2em;
}

.left {
  grid-area: l;
}

.content {
  grid-area: c;
  padding: 10px;
  font-size: 2em;
}

.right {
  grid-area: r;
}

.footer {
  grid-area: f;
  align-items: center;
  font-size: 1em;
}

/* .container {
    height: 100%;
    display: grid;
    grid-gap: 3px;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 40px auto 40px;
}

.header {
  grid-column: 2 / -1;
}

.menu {
  grid-row: 1 / 4
}

.content {
  grid-column: 2 / -1
}

.footer {
    grid-column: 2 / -1;
} */

/* .header {
    grid-column-start: 1;
    grid-column-end: 3;
}
.footer {
    grid-column: 1 / 3;
}
.container {
    display: grid;
    grid-gap: 3px;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 40px 200px 40px;
    grid-gap: 3px;
} */

/* basic */
.container > div {
  display: flex;
  justify-content: center;
  color:white;  /* font color*/
}

html,
body {
  box-sizing: border-box;
  /* background-color: #ffeead; */
  height: 100%;
  padding: 10px;
  margin: 0px;
}

.container > div:nth-child(1n) {
  background-color: #96ceb4;
}

.container > div:nth-child(3n) {
  background-color: #88d8b0;
}

.container > div:nth-child(2n) {
  background-color: #ff6f69;
}

.container > div:nth-child(4n) {
  background-color: #ffcc5c;
}
</style>
