# market-place

Installation steps

pre-requisites: Node, Metamask, Truffle and Ganache are installed

Import a few accounts into your Metamask to simulate different users (Admin, Store Owner, User)

1) Copy code
git clone "https://github.com/ren06/market-place.git"

2) Install dependencies
npm install

3 )Deploy contract
truffle migrate

4)Run the Vue.js app
npm run dev

If you're testing locally with Ganache don't forget to clear the transaction history (otherwise you will get an error about the wrong nonce)

Note: if you want to have some data already created, copy the files in "migrations_data" into "migration". Don't do this if you want to run unit tests.

 
