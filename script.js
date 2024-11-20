itemsList = []

function addItemToList(){
    const item = document.getElementById("grocery-item").value;
    const date = document.getElementById("expiry-date").value;
    const list = document.getElementById("added-items");

    if(item == "" || date == ""){
        alert("Must enter both grocery item and expiry date");
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

