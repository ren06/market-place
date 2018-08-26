Given the market place exercice is pretty straight forward in terms of logic (except implementing a CRUD pattern) I could only identify three things to avoid common attacks described in the course:

- Integer Overflow and Underflow:
The MarketPlace contract was vulnerable to Integer Overflow and Underflow (when setting balance in buyProduct and withdraw). In order to avoid any potential proble I used the SafeMath library.

- Reentrancy:
When the store owner witdraws ETH from the balance of their account another withdraw could in theory happen if the first withdraw did not finish. To make sure this cannot happen, the expected withdrawal final balance is et before doing the actual withdraw.

- Transaction-Ordering Dependence (TOD) / Front Running attack:
The store owner cannot change the price/quantity of a product to make it more expensive. Indeed the buyProduct function will always check that the sent amount is equals to : quantity * product price. Therefore is the product price/quantity is changed in the same block, the buyProduct function will throw.