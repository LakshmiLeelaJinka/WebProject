// add variable references and event listeners here!
const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchType = document.getElementById("search-type");
const searchButton = document.getElementById("search-button"); // Ensure this ID is correct
const bookList = document.getElementById("book-list");
const selectedBook = document.getElementById("selected-book");
const sortRatingButton = document.getElementById("sort-rating");
const ebookFilterCheckbox = document.getElementById("ebook-filter");

let allBooks = []; // Store all fetched books

// Add event listeners
searchForm.addEventListener("submit", handleSearch);
sortRatingButton.addEventListener("click", handleSort);
ebookFilterCheckbox.addEventListener("change", handleFilter);

/**
 * Searches for books using the Google Books API based on the given query and type.
 
*/
async function searchBooks(query, type) {
    const url = `${API_BASE_URL}?q=${type}:${query}&maxResults=10`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.items) {
            console.error("No items found.");
            return [];
        }

        const books = data.items.map(item => ({
            title: item.volumeInfo.title || "Unknown",
            author_name: item.volumeInfo.authors?.join(", ") || "Unknown",
            isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || "Unknown",
            cover_i: item.volumeInfo.imageLinks?.thumbnail || "",
            ebook_access: item.accessInfo?.isEbook ? "E-book Access: Available" : "E-book Access: Unavailable",
            first_publish_year: item.volumeInfo.publishedDate?.split("-")[0] || "Unknown",
            ratings_sortable: item.volumeInfo.averageRating || "Unknown"
        }));
        return books;
    } catch (error) {
        console.error("Error fetching books:", error);
        return [];
    }
}

/**
 * Takes in a list of books and updates the UI accordingly.
 
*/
function displayBookList(books) {
    bookList.innerHTML = "";

    if (books.length === 0) {
        bookList.innerHTML = "<li>No books available.</li>";
    } else {
        books.forEach(book => {
            const li = document.createElement("li");
            li.innerHTML = `
                <h3><span class="title-element">${book.title}</span></h3>
                <p class="author-element">Author: ${book.author_name}</p>
                <img class="cover-element" src="${book.cover_i}" alt="${book.title} cover">
                <p class="rating-element">Rating: ${book.ratings_sortable}</p>
                <p class="ebook-element">${book.ebook_access}</p>
            `;
            li.addEventListener("click", () => displaySingleBook(book));
            bookList.appendChild(li);
        });
    }
    bookList.style.display = "block";
    selectedBook.style.display = "none";
}

/**
 * Handles the search form submission and updates the UI with search results.
 
*/
async function handleSearch(event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    const type = searchType.value;

    if (query === "") {
        console.error("Search query cannot be empty.");
        return;
    }

    allBooks = await searchBooks(query, type);
    displayBookList(allBooks);
}

/**
 * Displays detailed information about a single book when it's clicked.
 
*/
function displaySingleBook(book) {
    selectedBook.innerHTML = `
        <h2 class="title-element">${book.title}</h2>
        <p class="author-element">Author: ${book.author_name}</p>
        <img class="cover-element" src="${book.cover_i}" alt="${book.title} cover">
        <p class="published-element">Published: ${book.first_publish_year}</p>
        <p class="rating-element">Rating: ${book.ratings_sortable}</p>
        <p class="ebook-element">${book.ebook_access}</p>
        <p class="isbn-element">ISBN: ${book.isbn}</p>
    `;
    bookList.style.display = "none";
    selectedBook.style.display = "block";
}

/**
 * Filters the displayed book list to show only e-books when the checkbox is checked.
 
*/
function handleFilter() {
    const isEbookFilterEnabled = ebookFilterCheckbox.checked;
    const filteredBooks = allBooks.filter(book => {
        const isAvailable = book.ebook_access === "E-book Access: Available";
        return isEbookFilterEnabled ? isAvailable : true;
    });
    console.log("Filtered Books:", filteredBooks);
    displayBookList(filteredBooks);
}

/**
 * Sorts the displayed book list by rating in descending order when the button is clicked.
 
*/
function handleSort() {
    const sortedBooks = [...allBooks].sort((a, b) => {
        const ratingA = parseFloat(a.ratings_sortable) || 0;
        const ratingB = parseFloat(b.ratings_sortable) || 0;
        return ratingB - ratingA;
    });
    displayBookList(sortedBooks);
}