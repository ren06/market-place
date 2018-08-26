# Features

The application follows closely the exercice requirements.

The workflow would be the following after deploying a brand new contract:
- A user lands on the application and click "Register as store owner"
- An administrator activate that user as as store owner
- The store owner can now see a page where they can create new store.
- In a store page the store owner can add products (name, price, quantity).
- These products can be updated and deleted.
- A user (who is neither an administrator or store owner) can see the lists of stores availables (ALL stores created by ALL stores owner)
- After selecting a store the user can select a product and buy it. At this point the ETH sent will be transfered to the balance of the store)
- A store owner on their home page can see the total amount they own through all their stores. They have to go to the page store (manage store) to withdraw its amount

Admin features:
- An administrator can add a new administrator
- Only the contract owner can delete am administrator
- An administrator can activate/deactivate a store owner
- The contract owner can pause and unpause the contract

# Patterns

## Solidity

The most challenging part was to design a relationship model similar to what you'd do with a relational database. 
In order to implement relationships between objects: StoreOwner 0 <--> * Stores 0 <--> * Products I used a specific CRUD design: "Data Storage With Sequential Access, Random Access and Delete".
In a nutshell with the use of a mapping, it is impossible to know the keys without checking if they exist individually. This causes problem when listing all the entries of a mapping, or keeping tracks of insert and deletion. To do so you need to maintain a parallel array that contains all the existing keys. For more information please check https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec as this is exaclty the pattern I used (it supports insert and deletion). In my case it is more complicated than the exemple since we have more imbricated objects (StoreOwer, Stores, Products) 

- The use of the withdrawl pattern has been implemented when the Store Owner withdraws their store balance
- I have used the library SafeMath to avoid integer overflows (installed via EthPM zeppelin)
- I've implemented a circuit breaker with the use of Pausable.sol (installed via EthPM zeppelin)

I've tried to use Oraclize (installed via EthPM oraclize-api) to fetch the price of ETH in USD (it was working with Remix on Rinkeby) but did not have the time to integrate it with the MarketPlace contract. I also tried ethereum-bridge to test Oraclize locally, but did not manage to get it fully working (ethereum-bridge was receiving and displaying the result, but the contract did not reflect it)

## UI

Metamask is used to interact with the blockchain to sign transaction. A message is displayed if no Metamask is detected, or if the user not logged in.

Vue.js has been used for the front end. I did not know Vue.js (or React/Angular) and I thought it would be a good challenge to learn it while doing this exercice.

When the application loads, the first things is to initalise the web3 instance and the contract instance. I am using Vuex to maintain the store state, and vue-router to show the right components to the right user role and the navigation to more components. The use of actions with Vuex was perfect to handle asynchronous interactions with the blockchain.

Changing Networks and Accounts withing Metamask should refresh the whole app, even though I've seen some bugs (in this case just refresh the browser page)
