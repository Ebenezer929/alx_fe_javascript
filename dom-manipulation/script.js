let quotes = [];
let lastViewedQuote = null;
let selectedCategory = "all"; // <-- Now explicitly declared

window.onload = function () {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  loadLastSelectedCategory();
  showRandomQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
};

// Create the form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.onclick = addQuote;

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(button);

  document.body.insertBefore(formContainer, document.getElementById("categoryFilter"));
}

// Load from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [
    { text: "The only limit is your mind.", category: "Motivation" },
    { text: "Be yourself; everyone else is already taken.", category: "Humor" }
  ];
}

// Save quotes
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Add quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  // Reset form
  document.getElementById("newQuoteText").value = '';
  document.getElementById("newQuoteCategory").value = '';

  alert("Quote added!");
}

// Show random quote from selected category
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    display.textContent = "No quotes found for this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  display.textContent = `"${random.text}" (${random.category})`;
  lastViewedQuote = random;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(random));
}

// Populate category dropdown
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  filter.innerHTML = categories.map(cat =>
    `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>${cat}</option>`
  ).join("");
}

// Handle filter change
function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selectedCategory);
  showRandomQuote();
}

// Load last selected category
function loadLastSelectedCategory() {
  const stored = localStorage.getItem("lastFilter");
  if (stored) {
    selectedCategory = stored;
    document.getElementById("categoryFilter").value = selectedCategory;
  }
}

// Export quotes
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        throw new Error("Invalid JSON structure");
      }
    } catch (err) {
      alert("Failed to import: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
// Sync with server every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();

    const serverQuotes = data.map(post => ({
      text: post.title,
      category: "Server"
    }));

    const newQuotes = serverQuotes.filter(serverQuote =>
      !quotes.some(localQuote => localQuote.text === serverQuote.text)
    );

    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes synced from server!");
    } else {
      console.log("No new quotes to sync.");
    }
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}
async function uploadQuotesToServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });

    if (!response.ok) {
      throw new Error("Failed to upload quotes");
    }

    const result = await response.json();
    console.log("Server response:", result);
    alert("Quotes uploaded to server (simulated)!");
  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload quotes to server.");
  }
}

