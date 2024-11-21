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
    generateRecipes()
}

// Delay function to enforce API rate limit
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch recipes using the Spoonacular API
async function fetchRecipes(list1, list2) {
    const API_KEY = "1999ba0f7a644ac4afb4dc0ac20d224c"; // Replace with your API key
    const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

    // Helper function to fetch recipes for a given list
    async function getRecipes(ingredients, number) {
        const params = new URLSearchParams({
            includeIngredients: ingredients.join(","),
            apiKey: API_KEY,
            number: number,
            sort: "max-used-ingredients",
            sortDirection: "desc",
            addRecipeInformation: true,
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
    const recipesList2 = await getRecipes(list2, 10);

    // Combine and display results
    displayRecipes(recipesList1, recipesList2);
}

// Display recipes dynamically, including images
function displayRecipes(list1Recipes, list2Recipes) {
    let resultsContainer = document.getElementById("recipe-results");
    if (!resultsContainer) {
        resultsContainer = document.createElement("div");
        resultsContainer.id = "recipe-results";
        document.body.appendChild(resultsContainer);
    }

    resultsContainer.innerHTML = ""; // Clear previous results

    // Helper function to create a recipe card with image
    function createRecipeCard(recipe) {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.style.border = "1px solid #ccc";
        card.style.padding = "15px";
        card.style.margin = "10px 0";
        card.style.borderRadius = "5px";
        card.style.backgroundColor = "#f9f9f9";

        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" style="width:100%; border-radius:5px; margin-bottom:10px;" />
            <h3>${recipe.title}</h3>
            <p><strong>Cooking Time:</strong> ${recipe.readyInMinutes} mins</p>
            <p><strong>Calories:</strong> ${Math.round(recipe.nutrition.nutrients.find(n => n.name === "Calories").amount)} kcal</p>
            <a href="${recipe.sourceUrl}" target="_blank" style="color: blue; text-decoration: underline;">View Recipe</a>
        `;
        return card;
    }

    // Add recipes from the first list
    const list1Heading = document.createElement("h2");
    list1Heading.textContent = "Recipes from Narrow Items:";
    resultsContainer.appendChild(list1Heading);
    list1Recipes.forEach(recipe => {
        resultsContainer.appendChild(createRecipeCard(recipe));
    });

    // Add recipes from the second list
    const list2Heading = document.createElement("h2");
    list2Heading.textContent = "Recipes from All Ingredients:";
    resultsContainer.appendChild(list2Heading);
    list2Recipes.forEach(recipe => {
        resultsContainer.appendChild(createRecipeCard(recipe));
    });
}

// Generate recipes based on the narrowItems() and allIngredients() functions
function generateRecipes() {
    // Get ingredients from narrowItems() and allIngredients()
    const list1 = narrowItems();
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
