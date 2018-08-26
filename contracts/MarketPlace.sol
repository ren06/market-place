pragma solidity ^0.4.24;

import "../installed_contracts/zeppelin/contracts/lifecycle/Pausable.sol";
import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/zeppelin/contracts/math/SafeMath.sol";

contract MarketPlace is Ownable, Pausable {

    //SafeMath will protect the contract from overflow/underflow attacks
    using SafeMath for uint;

    //To easily identify user role
    enum Roles { Guest, Administrator, StoreOwner, ActiveStoreOwner }

    //Admin data
    struct Administrator {
        uint index;
        address addr;        
    }

    mapping (address => Administrator) private administrators;
    address[] public administratorIndexes;

    //Store Owner data
    struct StoreOwner {
        uint index;
        string name;
        address addr;
        mapping(uint=>Store) stores;
        uint[] storesIndexes;
        bool isActive;
    }

    mapping (address => StoreOwner) private storeOwners;
    address[] private storeOwnerIndexes;

    //Product data
    struct Product {
        uint index;
        uint id; //to be used for an external database that could store more info
        string description;
        uint price;
        uint quantity;
    }

    //counter that will increment by one every time a new product is created
    uint private productId; 

    //Store data
    struct Store {
        uint index;
        string description;
        mapping(uint=>Product) products;
        uint[] productIndexes;
        uint balance;
    }

    //Events Store Owners
    event LogStoreOwnerRequest(address storeOwnerAddress);
    event LogStoreOwnerStatusChanged(address storeOwnerAddress, bool status);
    event LogStoreOwnerDelete(address storeOwnerAddress);
    event LogStoreOwnerAddStore(address add, uint storeIndex, string description);
    event LogStoreOwnerAddProduct(
        address storeOwnerAddress, 
        uint storeIndex, 
        uint productIndex, 
        string description, 
        uint price, 
        uint quantity, 
        uint productId
    );
    event LogStoreOwnerDeleteProduct(address storeOwnerAddress, uint storeIndex, uint productIndex);
    event LogStoreOwnerUpdateProduct(
        address storeOwnerAddress,
        uint storeIndex,
        uint productIndex,
        string description,
        uint price,
        uint quantity
    );
    event LogStoreOwnerWithdraw(address storeOwnerAddress, uint storeIndex, uint amount, uint balanceLeft);
    //Event User
    event LogUserBuyProduct(address storeOwnerAddress, uint storeIndex, uint productIndex, uint quantityLeft);
    //Events Admin
    event LogAdminAddAdmin(address adminAddress);
    event LogAdministratorDelete(address adminAddress);

    /** @dev Check if given address is an administrator
      * @param administratorAddress The address to check.
      */
    modifier administratorExists(address administratorAddress) {
        require(administratorIndexes.length > 0, "No administrators");
        require(administratorIndexes[administrators[administratorAddress].index] == administratorAddress, "Not administrator");
        _;
    }

    /** @dev Check if message sender is an Administrator
      */
    modifier isAdministrator() {
        require(administratorIndexes.length > 0, "No administrators");
        require(administratorIndexes[administrators[msg.sender].index] == msg.sender, "Admin address does not match");
        _;
    }

    /** @dev Check if given address is a store owner
      * @param storeOwnerAddress The address to check.
      */
    modifier storeOwnerExists(address storeOwnerAddress) {
        require(storeOwnerIndexes.length > 0, "No storeOwner");
        require(storeOwnerIndexes[storeOwners[storeOwnerAddress].index] == storeOwnerAddress, "No store owner");
        _;
    }

    /** @dev Check if message sender is a store owner
      */
    modifier isStoreOwner() {
        require(storeOwnerIndexes.length > 0, "No storeOwner");
        require(storeOwnerIndexes[storeOwners[msg.sender].index] == msg.sender, "Not a storeOwner");
        _;
    }

    /** @dev Check if message sender is an active store owner
      */
    modifier isActiveStoreOwner() {
        require(storeOwnerIndexes.length > 0, "No storeOwner");
        require(storeOwnerIndexes[storeOwners[msg.sender].index] == msg.sender, "Not a storeOwner");
        require(storeOwners[msg.sender].isActive == true, "Not active storeOwner");
        _;
    }

    /** @dev Constructor - initialise the contract owner as administrator
      */
    constructor() public {
        //contract owner is the first administrator
        administrators[msg.sender].addr = msg.sender;
        administrators[msg.sender].index = administratorIndexes.push(msg.sender)-1;        
    }

    /** @dev Get the Role of the message sender
      * @return The role (Guest, Administrator, StoreOwner or ActiveStoreOwner)
      */    
    function getUserRole() public view returns(Roles) {
        
        if(administratorIndexes.length > 0 && administratorIndexes[administrators[msg.sender].index] == msg.sender) {
            return Roles.Administrator;
        }
        else if(storeOwnerIndexes.length > 0 && storeOwnerIndexes[storeOwners[msg.sender].index] == msg.sender) {
            //it's a store owner, check if active
            if(storeOwners[msg.sender].isActive == true){
                return Roles.ActiveStoreOwner;
            }
            else{
                return Roles.StoreOwner;
            }
        }
        else{
            return Roles.Guest;
        }
    }

    // Administrator functions

    /** @dev Activate an existing store owner (that made a request)
      * @param storeOwnerAddress The address of the store owner to activate.
      */ 
    function activateStoreOwner(address storeOwnerAddress) 
        public 
        storeOwnerExists(storeOwnerAddress) 
        isAdministrator 
        whenNotPaused
    {
        storeOwners[storeOwnerAddress].isActive = true;
        emit LogStoreOwnerStatusChanged(storeOwnerAddress, true);
    }

    /** @dev Deactivate an existing store owner (that made a request)
      * @param storeOwnerAddress The address of the store owner to deactivate.
      */     
    function deactivateStoreOwner(address storeOwnerAddress) 
        public 
        storeOwnerExists(storeOwnerAddress) 
        isAdministrator 
        whenNotPaused
    {
        storeOwners[storeOwnerAddress].isActive = false;
        emit LogStoreOwnerStatusChanged(storeOwnerAddress, false);
    }    

    /** @dev Add an administrator (can only be performed by an administrator)
      * @param adminAddress The address of the administrator to add.
      */       
    function addAdministrator(address adminAddress) public isAdministrator whenNotPaused {
        //if already exists throw an error
        if(administratorIndexes.length > 0 && administratorIndexes[administrators[adminAddress].index] == adminAddress){
            revert("Already a store admin");
        }

        administrators[adminAddress].addr = adminAddress;
        administrators[adminAddress].index = administratorIndexes.push(adminAddress)-1;

        emit LogAdminAddAdmin(adminAddress);
    }

    /** @dev Delete an administrator (can only be performed by the contract owner)
      * @param adminAddress The address of the administrator to remove.
      */          
    function deleteAdministrator(address adminAddress) public onlyOwner whenNotPaused {
        uint rowToDelete = administrators[adminAddress].index;
        address keyToMove = administratorIndexes[administratorIndexes.length-1];
        administratorIndexes[rowToDelete] = keyToMove;
        administrators[keyToMove].index = rowToDelete;
        administratorIndexes.length--;

        emit LogAdministratorDelete(adminAddress);
    }

    /** @dev Get the number of administrators
      * @return number of administrators
      */  
    function getAdministratorsCount() public view returns(uint _number){
        _number = administratorIndexes.length;
    }

    /** @dev Get administrator at given index
      * @param index index to get admin at 
      * @return _index retreved index
      * @return _addr admin address
      * @return _isOwner true if admin is contract owner
      */
    function getAdministratorAtIndex(uint index) public view returns(uint _index, address _addr, bool _isOwner) {
        address adminAddress = administratorIndexes[index];
        _index = administrators[adminAddress].index;
        _addr = administrators[adminAddress].addr;
        _isOwner = (adminAddress == owner);
    }

    /** @dev Delete a store owner (whether active or not)
      * @param storeOwnerAddress address of the store owner to be deleted
      */    
    function deleteStoreOwner(address storeOwnerAddress) 
        public 
        storeOwnerExists(storeOwnerAddress) 
        isAdministrator 
        whenNotPaused
    {
        //since we cannot delete a mapping, set to false
        storeOwners[storeOwnerAddress].isActive = false;

        uint rowToDelete = storeOwners[storeOwnerAddress].index;
        address keyToMove = storeOwnerIndexes[storeOwnerIndexes.length-1];
        storeOwnerIndexes[rowToDelete] = keyToMove;
        storeOwners[keyToMove].index = rowToDelete;
        storeOwnerIndexes.length--;

        emit LogStoreOwnerDelete(storeOwnerAddress);
    }

    /** @dev Add a store with a description
      * @param description description of the store
      * @return storeIndex the index of the newly created store
      */    
    function addStore(string description) public isActiveStoreOwner whenNotPaused returns (uint storeIndex) {
        storeIndex = storeOwners[msg.sender].storesIndexes.length;
        storeOwners[msg.sender].storesIndexes.push(storeIndex);

        storeOwners[msg.sender].stores[storeIndex].index = storeIndex;
        storeOwners[msg.sender].stores[storeIndex].description = description;

        emit LogStoreOwnerAddStore(msg.sender, storeIndex, description);
    }

    /** @dev Add a new product at the given store for message sender (must be store owner)
      * @param storeIndex index of the store to add the product to
      * @param description product description
      * @param price product price (in wei)
      * @param quantity product available quantity
      * @return productIndex the index of the newly created product
      */    
    function addProduct(uint storeIndex, string description, uint price, uint quantity) 
        public 
        isActiveStoreOwner 
        isStoreOwner 
        whenNotPaused 
        returns (uint productIndex) 
    {
        productIndex = storeOwners[msg.sender].stores[storeIndex].productIndexes.length;
        storeOwners[msg.sender].stores[storeIndex].productIndexes.push(productIndex);

        Product storage product = storeOwners[msg.sender].stores[storeIndex].products[productIndex];

        product.index = productIndex;
        product.description = description;
        product.price = price;
        product.quantity = quantity;
        product.id = productId;

        productId = productId + 1; //unique identifier for possible external Database that would contain more info (pictures)

        emit LogStoreOwnerAddProduct(msg.sender, storeIndex, productIndex, description, price, quantity, productId);
    }

    /** @dev Update a product at the given store for message sender (must be store owner)
      * @param storeIndex index of the store of the product to modify
      * @param description new product description
      * @param price new product price (in wei)
      * @param quantity new product available quantity
      */
    function updateProduct(uint storeIndex, uint productIndex, string description, uint price, uint quantity) 
        public 
        isActiveStoreOwner
        isStoreOwner 
        whenNotPaused
    {
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].description = description;
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].price = price;
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].quantity = quantity;

        emit LogStoreOwnerUpdateProduct(msg.sender, storeIndex, productIndex, description, price, quantity);
    }    

    /** @dev Get the number of products for given store owner and given store index
      * @param storeOwnerAddress address of the store owner
      * @param storeIndex index of the store
      * @return number of products
      */  
    function getProductsCount(address storeOwnerAddress, uint storeIndex) public view returns(uint){

        return storeOwners[storeOwnerAddress].stores[storeIndex].productIndexes.length;
    }

    /** @dev Get the product information for given store owner, store index and product index
      * @param storeOwnerAddress address of the store owner
      * @param storeIndex index of the store
      * @param productIndex index of the product      
      * @return product index
      * @return product description
      * @return product proice
      * @return product quantity
      * @return product unique id
      */ 
    function getProductAt(address storeOwnerAddress, uint storeIndex, uint productIndex) 
        public
        view
        returns(uint, string, uint, uint, uint)
    {
        Product memory product = storeOwners[storeOwnerAddress].stores[storeIndex].products[productIndex];

        return (product.index, product.description, product.price, product.quantity, product.id);
    }

    /** @dev Delete the product at given store (only by its store owner)
      * @param storeIndex index of the store of the product to delete
      * @param productIndex index of the product to delete
      */     
    function deleteProduct(uint storeIndex, uint productIndex) 
        public 
        isActiveStoreOwner
        isStoreOwner
        whenNotPaused
    {
        //to make the code more readable use variable
        uint[] storage productIndexes = storeOwners[msg.sender].stores[storeIndex].productIndexes;
        
        uint rowToDelete = storeOwners[msg.sender].stores[storeIndex].products[productIndex].index;
        uint keyToMove = productIndexes[productIndexes.length-1];
        
        productIndexes[rowToDelete] = keyToMove;
        storeOwners[msg.sender].stores[storeIndex].products[keyToMove].index = rowToDelete;
        productIndexes.length--;

        emit LogStoreOwnerDeleteProduct(msg.sender, storeIndex, productIndex);
    }

    /** @dev For a guest user, request to become a store owner with their address
      * @param name name of the store owner
      */     
    function requestStoreOwner(string name) public whenNotPaused {
        //if already exists throw
        if(storeOwnerIndexes.length > 0 && storeOwnerIndexes[storeOwners[msg.sender].index] == msg.sender){
            revert("Already a store owner");
        }

        storeOwners[msg.sender].name = name;
        storeOwners[msg.sender].addr = msg.sender;
        storeOwners[msg.sender].index = storeOwnerIndexes.push(msg.sender)-1;

        emit LogStoreOwnerRequest(msg.sender);
    }

    /** @dev Get the information about a store owner at given address
      * @param storeOwnerAddress address of store owner
      * @return _index index of store owner
      * @return _name name of store owner
      * @return _addr address of store owner
      * @return _isActive true is store owner active
      * @return _numberStores number of stores the store owner has
      */    
    function getStoreOwnerAtAddress(address storeOwnerAddress) 
        public 
        view
        returns(uint _index, string _name, address _addr, bool _isActive, uint _numberStores)
    {
        return (storeOwners[storeOwnerAddress].index,
        storeOwners[storeOwnerAddress].name,
        storeOwners[storeOwnerAddress].addr,
        storeOwners[storeOwnerAddress].isActive,
        storeOwners[storeOwnerAddress].storesIndexes.length);
    }    

    /** @dev Get the information about a store owner at given index
      * @param storeOwnerindex index of store owner
      * @return _index index of store owner
      * @return _name name of store owner
      * @return _addr address of store owner
      * @return _isActive true is store owner active
      * @return _numberStores number of stores the store owner has
      */ 
    function getStoreOwnerAtIndex(uint storeOwnerindex)
        public
        view
        returns(uint _index, string _name, address _addr, bool _isActive, uint _numberStores)
    {    
        return getStoreOwnerAtAddress(storeOwnerIndexes[storeOwnerindex]);
    }

    /** @dev Get the number of store owners
      * @return number of store owners
      */  
    function getStoreOwnersCount() public view returns(uint count) {
        count = storeOwnerIndexes.length;
    }

    /** @dev Get the information about a store at given index for given store owner
      * @param storeOwnerAddress address of store owner
      * @param storeIndex index of store
      * @return _index index of store owner
      * @return _name name of store owner
      * @return _addr address of store owner
      * @return _isActive true is store owner active
      * @return _numberStores number of stores the store owner has
      */ 
    function getStoreAtIndex(address storeOwnerAddress, uint storeIndex)
        public
        view 
        returns(uint _index, string _description, uint _numberProducts, uint _balance, address _storeOwner)
    {      
        return(storeOwners[storeOwnerAddress].stores[storeIndex].index,
               storeOwners[storeOwnerAddress].stores[storeIndex].description,
               storeOwners[storeOwnerAddress].stores[storeIndex].productIndexes.length,
               storeOwners[storeOwnerAddress].stores[storeIndex].balance,
               storeOwnerAddress
        );
    }

    /** @dev Get the number of stores for given store owber
      * @param storeOwnerAddress address of the store owner
      * @return number of stores
      */  
    function getStoresCount(address storeOwnerAddress) public view returns(uint number) {
        number = storeOwners[storeOwnerAddress].storesIndexes.length;
    }
 
    /** @dev Update a store owner (only the store owner can do it)
      * @param name the store owner new name
      */
    function updateStoreOwner(string name) public isActiveStoreOwner whenNotPaused {
        storeOwners[msg.sender].name = name;
    }

    /** @dev For a guest, buy a product from a given store that belongs to a given store owner
      * @param storeOwnerAddress address of the store owner 
      * @param storeIndex index of the store
      * @param productIndex index of the product
      * @param quantity quantity to buy            
      */  
    function buyProduct(address storeOwnerAddress, uint storeIndex, uint productIndex, uint quantity)  
        public
        whenNotPaused 
        payable
    {
        Product storage product = storeOwners[storeOwnerAddress].stores[storeIndex].products[productIndex];

        require(quantity <= product.quantity, "Not enough product");
        //check sent eth is what is expected
        require(msg.value == quantity.mul(product.price), "Not enought ETH sent");

        product.quantity = product.quantity.sub(quantity);    
        storeOwners[storeOwnerAddress].stores[storeIndex].balance = storeOwners[storeOwnerAddress].stores[storeIndex].balance.add(msg.value); 

        emit LogUserBuyProduct(storeOwnerAddress, storeIndex, product.index, product.quantity);
    } 

    /** @dev For a store owner, withdraw some ETH from one of their store (only store owner can do it)
      * @param storeIndex index of the store
      * @param amount amount to withdraw (in wei)        
      */  
    function storeOwnerWithdraw(uint storeIndex, uint amount) public isStoreOwner whenNotPaused {
        
        require(storeOwners[msg.sender].stores[storeIndex].balance >= amount, "Not enough funds");

        //Use of  withdrawal pattern / reentrancy: set the final balance before the payment is done
        storeOwners[msg.sender].stores[storeIndex].balance = storeOwners[msg.sender].stores[storeIndex].balance.sub(amount);
        msg.sender.transfer(amount);
  
        emit LogStoreOwnerWithdraw(msg.sender, storeIndex, amount, storeOwners[msg.sender].stores[storeIndex].balance);
    }
}
