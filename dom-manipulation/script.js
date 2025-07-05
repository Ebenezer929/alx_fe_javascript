let quotes = [];
let lastViewedQuote = null;

// Load quotes from localStorage on page load
window.onload = function () {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) {
    document.getElementById("categoryFilter").value = lastFilter;
    filterQuotes();
  }
};

// Show a random quote
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const category = document.getElementById("categoryFilter").value;
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (filtered.length === 0) {
    display.textContent = "No quotes found for this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  display.textContent = `"${random.text}" (${random.category})`;
  lastViewedQuote = random;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(random));
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Add a new quote
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
  document.getElementById("newQuoteText").value = '';
  document.getElementById("newQuoteCategory").value = '';
  alert("Quote added!");
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [
    { text: "The only limit is your mind.", category: "Motivation" },
    { text: "Be yourself; everyone else is already taken.", category: "Humor" }
  ];
}

// Populate categories
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  filter.innerHTML = categories.map(cat =>
    `<option value="${cat}">${cat}</option>`).join("");
}

// Filter quotes by category
function filterQuotes() {
  localStorage.setItem("lastFilter", document.getElementById("categoryFilter").value);
  showRandomQuote();
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON
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

// Simulate server sync every 10 seconds
setInterval(syncWithServer, 10000);

function syncWithServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(serverData => {
      const serverQuotes = serverData.slice(0, 5).map(post => ({
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
        alert("New quotes synced from server.");
      }
    })
    .catch(err => console.error("Sync failed:", err));
}

