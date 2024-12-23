itemsList = []
intolerancesList = []

function addIntolerance() {
    const intolerance = document.getElementById("intolerance-item").value;
    const list = document.getElementById("intolerances-list");

    if (intolerance === "") {
        alert("Must enter an allergy");
    } else {
        intolerancesList.push(intolerance);

        const element = document.createElement("li");
        element.classList.add("text-list");
        const node = document.createTextNode(intolerance);
        element.appendChild(node);

        const deleteButton = makeIntoleranceDeleteButton(element, list);
        element.appendChild(deleteButton);
        

        list.appendChild(element);

        document.getElementById("intolerance-item").value = ""; // Clear input field
    }
}


function makeIntoleranceDeleteButton(listElement, list){
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("button-delete");

    deleteButton.addEventListener("click", () => {
        const index = Array.from(list.children).indexOf(listElement);
        if(index !== -1) {
            intolerancesList.splice(index,1);
        }
        list.removeChild(listElement)
    });
    return deleteButton

}

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
        element.classList.add("text-list");
        const node = document.createTextNode(`${item}  ${date}`);
        
        element.appendChild(node);

        const deleteButton = makedeleteButton(element, list)
        const editButton = makeEditButton(itemElement, element)
        element.appendChild(editButton)
        element.appendChild(deleteButton)

        list.appendChild(element);
        list.classList.add("list-design")
    }
}

function makedeleteButton(listElement, list){
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("button-delete");

    deleteButton.addEventListener("click", () =>{
        list.removeChild(listElement)
    });

    return deleteButton;
}

function makeEditButton(itemElement, listElement) {
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("button");

    editButton.addEventListener("click", () => {
        // Create inputs for editing
        const editItemInput = document.createElement("input");
        editItemInput.type = "text";
        editItemInput.value = itemElement.itemName;

        const editDateInput = document.createElement("input");
        editDateInput.type = "date";
        editDateInput.value = itemElement.expiryDate;

        // Create Save button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("button");

        saveButton.addEventListener("click", () => {
            // Update the item in itemsList
            itemElement.itemName = editItemInput.value;
            itemElement.expiryDate = editDateInput.value;

            // Update the list item text
            listElement.textContent = `${itemElement.itemName}, ${itemElement.expiryDate}`;

            // Re-add the Edit and Delete buttons
            const deleteButton = makedeleteButton(listElement, listElement.parentNode);
            const editButton = makeEditButton(itemElement, listElement);
            listElement.appendChild(deleteButton);
            listElement.appendChild(editButton);
        });

        // Clear current list element and add inputs and Save button
        listElement.textContent = "";
        listElement.appendChild(editItemInput);
        listElement.appendChild(editDateInput);
        listElement.appendChild(saveButton);
    });

    return editButton;
}


function apiCall(){
    // api call with narrowItems() expiring ingredients, to print recipes primarily with expiring ingredients
    // api call with allIngredients() ingredients, to print recipes with all ingredients
    generateRecipes()
}

// Delay function to enforce API rate limit
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch recipes using the Spoonacular API
async function fetchRecipes(list1, list2) {
    const API_KEY = "Placeholder";
    const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

    // Helper function to fetch recipes for a given list
    async function getRecipes(ingredients, number) {
        const params = new URLSearchParams({
            includeIngredients: ingredients.join(","),
            intolerances: intolerancesList.join(","),
            apiKey: API_KEY,
            number: number,
            sort: "max-used-ingredients",
            sortDirection: "asc",
            addRecipeInformation: true,
            addRecipeInstructions: true,
            fillIngredients: true,
            addRecipeNutrition: true
        });

        try {
            const response = await fetch(`${BASE_URL}?${params.toString()}`);
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error("Error fetching recipes:", error);
            return [];
        }
    }

    // Fetch recipes from the first list
    const recipesList1 = await getRecipes(list1, 5);
    await delay(1000); // Wait 1 second to respect the API rate limit

    // Fetch recipes from the second list
    const recipesList2 = await getRecipes(list2, 20);

    // Combine and display results
    displayRecipes(recipesList1, recipesList2);
}

// Display recipes dynamically, including images
function displayRecipes(list1Recipes, list2Recipes) {
    const resultsContainer = document.getElementById("recipe-results");
    resultsContainer.innerHTML = ""; // Clear previous results

    // Helper function to create a recipe card
    function createRecipeCard(recipe) {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.style.border = "3px solid #f7ebdb";
        card.style.padding = "5px";
        card.style.margin = "10px 0";
        card.style.borderRadius = "5px";
        card.style.backgroundColor = "#acbd98";
    
        // Extract instructions if available
        const instructionsUrl = recipe.sourceUrl || `https://spoonacular.com/recipes/${recipe.id}`;
    
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" style="width:50%; margin-bottom:10px;" />
            <h3 class="text" style="color: #f7ebdb">${recipe.title}</h3>
            <p class="text"  style="color: rgb(6, 60, 15);"><strong>Cooking Time:</strong> ${recipe.readyInMinutes} mins</p>
            <p class="text"  style="color: rgb(6, 60, 15);"><strong>Calories:</strong> ${Math.round(recipe.nutrition.nutrients.find(n => n.name === "Calories").amount)} kcal</p>
            <a href="${instructionsUrl}" target="_blank" style="color: #f7ebdb; text-decoration: underline; font-family: "Nunito Sans", sans-serif;">Full Instructions</a>
        `;
        return card;
    }
    

    // Track unique recipes for each section
    const seenNarrow = new Set();
    const seenAll = new Set();

    const recipeHeading = document.createElement("h2")
    recipeHeading.textContent = "Recipe Results"
    recipeHeading.classList.add("text-results");
    resultsContainer.appendChild(recipeHeading)

    //Create box wrapper
    const boxWrapper = document.createElement("div");
    boxWrapper.classList.add("box-wrapper");

    //Box for narrowed reciped
    const narrowBox = document.createElement("div");
    narrowBox.classList.add("box-recipe");

    // Display recipes from narrow items
    const narrowHeading = document.createElement("h2");
    narrowHeading.textContent = "Recipes from Ingredients Expiring Soon:";
    narrowHeading.classList.add("text");
    narrowBox.appendChild(narrowHeading);

    list1Recipes.forEach(recipe => {
        if (!seenNarrow.has(recipe.id)) {
            seenNarrow.add(recipe.id);
            narrowBox.appendChild(createRecipeCard(recipe));
        }
    });
    boxWrapper.appendChild(narrowBox);

    //Box for all reciped
    const allBox = document.createElement("div");
    allBox.classList.add("box-recipe");

    // Display recipes from all ingredients, avoiding duplicates from narrow items
    const allHeading = document.createElement("h2");
    allHeading.textContent = "Recipes from All Ingredients:";
    allBox.appendChild(allHeading);
    allHeading.classList.add("text");

    list2Recipes.forEach(recipe => {
        if (!seenNarrow.has(recipe.id) && !seenAll.has(recipe.id)) {
            seenAll.add(recipe.id);
            allBox.appendChild(createRecipeCard(recipe));
        }
    });
    boxWrapper.appendChild(allBox);
    resultsContainer.appendChild(boxWrapper);
}



// Generate recipes based on the narrowItems() and allIngredients() functions
function generateRecipes() {
    // Get ingredients from narrowItems() and allIngredients()
    const list1 = allIngredients();
    const list2 = allIngredients();

    if (list1.length === 0 && list2.length === 0) {
        alert("No ingredients available to generate recipes!");
        return;
    }

    // Fetch and display recipes
    fetchRecipes(list1, list2);
}

function allIngredients() {
    return itemsList.map(item => item.itemName); // Return array of ingredients
}

function narrowItems() {
    const current_date = getCurrentDate();

    const validItems = itemsList
        .filter(item => item.expiryDate >= current_date) // Step 2
        .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)); // Step 3

    return validItems.map(item => item.itemName); // Step 4
}

function getCurrentDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}
