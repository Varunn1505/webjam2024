itemsList = []

function addItemToList(){
    const item = document.getElementById("grocery-item").value;
    const date = document.getElementById("expiry-date").value;
    const list = document.getElementById("added-items");

    if(item == ""){
        alert("Must enter grocery item");
    } else {

        const itemElement = {
            itemName: item,
            expiryDate: date
        }
        
        itemsList.push(itemElement)
        
        const element = document.createElement("li");
        const node = document.createTextNode(`${item}, ${date}`);
        
        element.appendChild(node);

        const deleteButton = makedeleteButton(element, list)
        element.appendChild(deleteButton)

        list.appendChild(element);
    }
}

function makedeleteButton(listElement, list){
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";

    deleteButton.addEventListener("click", () =>{
        list.removeChild(listElement)
    });

    return deleteButton;
}

function apiCall(){
    // api call with narrowItems() expiring ingredients, to print recipes primarily with expiring ingredients
    // api call with allIngredients() ingredients, to print recipes with all ingredients
    pass
}

function allIngredients(){
    //returns a comma separated list of all ingredients
    return itemsList.map(item => item.itemName).join(",");
}

function getCurrentDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

function narrowItems() {
    const current_date = getCurrentDate();

    const validItems = itemsList
        .filter(item => item.expiryDate >= current_date) // Step 2
        .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)); // Step 3

    return validItems.map(item => item.itemName).join(","); // Step 4
}
