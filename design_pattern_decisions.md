There is not a specific format for writing it up, but you need to make it clear what your app does, how it does and why you decided to do it that way. Show your understanding of the topics that we covered in the course, show off what you have learned in the context of your application

Features
********
The application follows closely the specified requirements.

The workflow would be the following after deploying a brand new contract:
- A user lands on the application and click "Register as store owner"
- An administrator activate that user as as store owner
- The store owner can now see a page where they can create new store.
- In a store page the store owner can add products (name, price, quantity).
- These products can be updated and deleted.
- A user (who is neither an administrator or store owner) can see the lists of stores availables (all stores created by all stores owner)
- After selecting a store the user can select a product and buy it. At this point the ETH sent will be transfered to the balance of the store)
- A store owner on their home page can see the total amount they own through all their stores. They have to go to the page store to withdraw its amount

Admin features:
- The contract owner can add a new administrator
- An administrator can deactivate a store owner
- The contract owner can pause and resume the contract


Pattern
*******
The most challenging part was to design a relationship model similar to what you'd do with a relational database. 
In order to implement relationships between objects: StoreOwner 0 <--> * Stores 0 <--> * Products I used a specific CRUD design: "Data Storage With Sequential Access, Random Access and Delete".
In a nutshell with the use of a mapping, it is impossible to know the keys without checking if they exist individually. This causes problem when listing all the entries of a mapping, or keeping tracks of insert and deletion. To do so you need to maintain a parallel array that contains all the existing keys. For more information please check https://medium.com/@robhitchens/solidity-crud-part-2-ed8d8b4f74ec as this is exaclty the pattern I used (it supports insert and deletion). In my case it is more complicated than the exemple since we have more imbricated objects (StoreOwer, Stores, Products) 

I've implemented a circuit breaker with the use of Pausable.sol
There are some owner only 

I am using an enum for role access to quickly know the current role of a user (used by UI), according to where its address is stored (in which mapping) in the contract
