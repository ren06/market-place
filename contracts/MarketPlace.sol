pragma solidity ^0.4.24;

contract MarketPlace {

    enum Roles { Guest, Administrator, StoreOwner, ActiveStoreOwner }

    //Admin Data
    struct Administrator{
        uint index;
        address addr;
    }

    mapping (address => Administrator) private administrators;
    address[] private administratorIndexes ; //use to list objects

    //Store Owner data
    struct StoreOwner{
        uint index;
        string name;
        address addr;
        mapping(uint=>Store) stores;
        uint[] storesIndexes;
        bool isActive;
    }

    mapping (address => StoreOwner) private storeOwners;
    address[] private storeOwnerIndexes; //use to list objects

    struct Product {
        uint index;
        uint id; //to identify external database
        string description;
        uint price;
        uint quantity;
    }

    uint private productId; //to identify a product in an external database

    struct Store {
        uint index;
        string description;
        mapping(uint=>Product) products;
        uint[] productIndexes;
        uint balance;
    }

    //Events Store Owners
    event LogStoreOwnerRequest();
    event LogStoreOwnerStatusChanged(bool status);
    event LogStoreOwnerDelete();
    event LogStoreOwnerAddStore();
    event LogStoreOwnerAddProduct();
    event LogStoreOwnerDeleteProduct();
    event LogStoreOwnerUpdateProduct();
    event LogStoreOwnerWithdraw(uint balanceLeft);
    //Events User
    event LogUserBuyProduct(uint quantityLeft);
    //Events Admin
    event LogAdminNewAdmin();

    //Check if a given address is Administrator
    modifier administratorExists(address administratorAddress){
        require(administratorIndexes.length > 0, "No administrators");
        require(administratorIndexes[administrators[administratorAddress].index] == administratorAddress, "Not administrator");
        _;
    }

    //Check if current account is Administrator
    modifier isAdministrator(){
        require(administratorIndexes.length > 0, "No administrators");
        require(administratorIndexes[administrators[msg.sender].index] == msg.sender, "Admin address does not match");
        _;
    }

    //Check if a given address is StoreOwner
    modifier storeOwnerExists(address storeOwnerAddress){
        require(storeOwnerIndexes.length > 0, "No storeOwner");
        require(storeOwnerIndexes[storeOwners[storeOwnerAddress].index] == storeOwnerAddress, "No store owner");
        _;
    }

    //Check if current account is StoreOwner
    modifier isStoreOwner(){
        require(storeOwnerIndexes.length > 0, "No storeOwner");
        require(storeOwnerIndexes[storeOwners[msg.sender].index] == msg.sender, "Not a storeOwner");
        _;
    }

    //Check if current account is ActiveStoreOwner
    modifier isActiveStoreOwner(){
        require(storeOwnerIndexes.length > 0, "No storeOwner");
        require(storeOwnerIndexes[storeOwners[msg.sender].index] == msg.sender, "Not a storeOwner");
        require(storeOwners[msg.sender].isActive == true, "Not active storeOwner");
        _;
    }

    constructor() public {

        //contract owner is the first administrator
        administrators[msg.sender].addr = msg.sender;
        administrators[msg.sender].index = administratorIndexes.push(msg.sender)-1;        
    }

    //Check the role of current account
    function getUserRole() public view returns(Roles) {
        
        if(administratorIndexes.length > 0 && administratorIndexes[administrators[msg.sender].index] == msg.sender) {
            return Roles.Administrator;
        }
        else if(storeOwnerIndexes.length > 0 && storeOwnerIndexes[storeOwners[msg.sender].index] == msg.sender) {
            //it's a store owber, check if active
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

    //ADMINISTRATORS
    function activateStoreOwner(address storeOwnerAddress) public storeOwnerExists(storeOwnerAddress) isAdministrator {

        storeOwners[storeOwnerAddress].isActive = true;
        emit LogStoreOwnerStatusChanged(true);
    }

    function deactivateStoreOwner(address storeOwnerAddress) public storeOwnerExists(storeOwnerAddress) isAdministrator {

        storeOwners[storeOwnerAddress].isActive = false;
        emit LogStoreOwnerStatusChanged(false);
    }    

    function addAdministrator(address adminAddress) public isAdministrator {
        // mapping (address => Administrator) private administrators;
        // address[] private administratorIndexes ; //use to list objects        
        //if already exists throw
        if(administratorIndexes.length > 0 && administratorIndexes[administrators[adminAddress].index] == adminAddress){
            revert("Already an admin");
        }

        administrators[adminAddress].addr = adminAddress;
        administrators[adminAddress].index = administratorIndexes.push(adminAddress) - 1;

        emit LogAdminNewAdmin();
    }

    function getAdministratorsCount() public view returns(uint number){
        number = administratorIndexes.length;
    }

    function getAdministratorAtIndex(uint index) public view returns(uint, address){
        address adminAddress = administratorIndexes[index];
        return (administrators[adminAddress].index, administrators[adminAddress].addr);
    }

    //delete a store owner (whether active or not)
    function deleteStoreOwner(address storeOwnerAddress) public storeOwnerExists(storeOwnerAddress) isAdministrator {

        //since we cannot delete a mapping, set to false
        storeOwners[storeOwnerAddress].isActive = false;

        uint rowToDelete = storeOwners[storeOwnerAddress].index;
        address keyToMove = storeOwnerIndexes[storeOwnerIndexes.length-1];
        storeOwnerIndexes[rowToDelete] = keyToMove;
        storeOwners[keyToMove].index = rowToDelete;
        storeOwnerIndexes.length--;

        emit LogStoreOwnerDelete();
    }

    function addStore(string description) public isActiveStoreOwner returns (uint storeIndex){

        storeIndex = storeOwners[msg.sender].storesIndexes.length;
        storeOwners[msg.sender].storesIndexes.push(storeIndex);

        storeOwners[msg.sender].stores[storeIndex].index = storeIndex;
        storeOwners[msg.sender].stores[storeIndex].description = description;

        emit LogStoreOwnerAddStore();
    }

    //Only store owner can add prodcut
    function addProduct(uint storeIndex, string description, uint price, uint quantity) public 
    isActiveStoreOwner isStoreOwner returns (uint productIndex) {

        productIndex = storeOwners[msg.sender].stores[storeIndex].productIndexes.length;
        storeOwners[msg.sender].stores[storeIndex].productIndexes.push(productIndex);
    
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].index = productIndex;
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].description = description;
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].price = price;
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].quantity = quantity;
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].id = productId;

        productId = productId + 1; //unique identifier for Database

        emit LogStoreOwnerAddProduct();
    }

    function updateProduct(uint storeIndex, uint productIndex, string description, uint price, uint quantity) public 
    isActiveStoreOwner isStoreOwner {

        storeOwners[msg.sender].stores[storeIndex].products[productIndex].description = description;
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].price = price;
        storeOwners[msg.sender].stores[storeIndex].products[productIndex].quantity = quantity;

        emit LogStoreOwnerUpdateProduct();
    }    

    function getProductsCount(address storeOwnerAddress, uint storeIndex) public view returns(uint){

        return storeOwners[storeOwnerAddress].stores[storeIndex].productIndexes.length;
    }

    function getProductAt(address storeOwnerAddress, uint storeIndex, uint productIndex) public view returns(uint, string, uint, uint, uint){

        Product memory product = storeOwners[storeOwnerAddress].stores[storeIndex].products[productIndex];

        return (product.index, product.description, product.price, product.quantity, product.id);
    }

    //Only store owner can delete prodcut
    function deleteProduct(uint storeIndex, uint productIndex) public isActiveStoreOwner isStoreOwner {

        uint rowToDelete = storeOwners[msg.sender].stores[storeIndex].products[productIndex].index;
        uint keyToMove = storeOwners[msg.sender].stores[storeIndex].productIndexes[storeOwners[msg.sender].stores[storeIndex].productIndexes.length-1];
        storeOwners[msg.sender].stores[storeIndex].productIndexes[rowToDelete] = keyToMove;
        storeOwners[msg.sender].stores[storeIndex].products[keyToMove].index = rowToDelete;
        storeOwners[msg.sender].stores[storeIndex].productIndexes.length--;

        emit LogStoreOwnerDeleteProduct();
    }

    //GUEST
    function requestStoreOwner(string name) public {
        //if already exists throw
        if(storeOwnerIndexes.length > 0 && storeOwnerIndexes[storeOwners[msg.sender].index] == msg.sender){
            revert("Already a store owner");
        }

        storeOwners[msg.sender].name = name;
        storeOwners[msg.sender].addr = msg.sender;
        storeOwners[msg.sender].index = storeOwnerIndexes.push(msg.sender) - 1;

        emit LogStoreOwnerRequest();
    }

    function getStoreOwnerAtAddress(address storeOwnerAddress) public view
     returns(uint _index, string _name, address _addr, bool _isActive, uint _numberStores){

        return (storeOwners[storeOwnerAddress].index,
        storeOwners[storeOwnerAddress].name,
        storeOwners[storeOwnerAddress].addr,
        storeOwners[storeOwnerAddress].isActive,
        storeOwners[storeOwnerAddress].storesIndexes.length);
    }    

    function getStoreOwnerAtIndex(uint storeOwnerindex) public view
        returns(uint _index, string _name, address _addr, bool _isActive, uint _numberStores){
        
        //StoreOwner memory storeOwner = storeOwners[storeOwnerIndexes[storeOwnerindex]];
        //return(storeOwner.index, storeOwner.name, storeOwner.addr, storeOwner.isActive, storeOwner.storesIndexes.length);
        return getStoreOwnerAtAddress(storeOwnerIndexes[storeOwnerindex]);
    }

    function getStoreOwnersCount() public view returns(uint count){

        count = storeOwnerIndexes.length;
    }

    function getStoreAtIndex(address storeOwnerAddress, uint index) public view 
      returns(uint _index, string _description, uint _numberProducts, uint _balance, address _storeOwner){
          
        return(storeOwners[storeOwnerAddress].stores[index].index,
               storeOwners[storeOwnerAddress].stores[index].description,
               storeOwners[storeOwnerAddress].stores[index].productIndexes.length,
               storeOwners[storeOwnerAddress].stores[index].balance,
               storeOwnerAddress
        );
    }

    function getStoresCount(address storeOwnerAddress) public view returns(uint number){
        number = storeOwners[storeOwnerAddress].storesIndexes.length;
    }
 
    //Only the store owner can update its data
    function updateStoreOwner(string name) public isActiveStoreOwner {

        storeOwners[msg.sender].name = name;
    }

    function buyProduct(address storeOwnerAddress, uint storeIndex, uint productIndex, uint quantity) public payable returns(uint) {

        Product storage product = storeOwners[storeOwnerAddress].stores[storeIndex].products[productIndex];

        require(quantity <= product.quantity, "Not enough product");
        //check sent eth is what is expected
        require(msg.value == quantity * product.price, "Not enought ETH sent");
        storeOwners[storeOwnerAddress].stores[storeIndex].balance += msg.value; 
        product.quantity -= quantity;

        emit LogUserBuyProduct(product.quantity);
    } 

    function storeOwnerWithdraw(uint storeIndex, uint amount) public isStoreOwner {
        
        //Use of  withdrawal pattern
        require(storeOwners[msg.sender].stores[storeIndex].balance >= amount, "Not enough funds");
        msg.sender.transfer(amount);
        storeOwners[msg.sender].stores[storeIndex].balance -= amount;

        emit LogStoreOwnerWithdraw(storeOwners[msg.sender].stores[storeIndex].balance);
    }

}
