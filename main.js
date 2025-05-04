document.addEventListener('DOMContentLoaded', function () {
    const inputBook = document.getElementById('bookForm');
    const searchBook = document.getElementById('searchBook');

    inputBook.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });
    
    searchBook.addEventListener('submit', function (event) {
        event.preventDefault();
        const inputSearch = document.getElementById('searchBookTitle').value;
        bookSearch(inputSearch);
    });

    if (isStorageExist()) {
        loadDataStorage();
    }
});

function addBook() {
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYear = parseInt(document.getElementById('bookFormYear').value);
    const bookIsComplete = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date().getTime();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}

const books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    return typeof(Storage) !== 'undefined';
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function loadDataStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    if (serializedData !== null) {
        const data = JSON.parse(serializedData);

        for (const book of data) {
            book.year = parseInt(book.year);
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


document.addEventListener(RENDER_EVENT, function () {
    const uncompleteBookList = document.getElementById('incompleteBookList');
    uncompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) 
            uncompleteBookList.append(bookElement);
        else 
            completeBookList.append(bookElement);
        
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;
    textTitle.setAttribute('data-testid', 'bookItemTitle');

    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Penulis: " + bookObject.author;
    textAuthor.setAttribute('data-testid', 'bookItemAuthor');

    const textYear = document.createElement('p');
    textYear.innerText = "Tahun: " + bookObject.year;
    textYear.setAttribute('data-testid', 'bookItemYear');

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    container.setAttribute('data-testid', 'bookItem');
    container.setAttribute('data-bookid', bookObject.id);

    const trashButton = document.createElement('button');
        trashButton.textContent = 'Hapus Buku';
        trashButton.classList.add('trash-button');
        trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
        trashButton.addEventListener('click', function () {
            removeBookList(bookObject.id);
        });

    const editButton = document.createElement('button');
        editButton.textContent = 'Edit Buku';
        editButton.classList.add('edit-button');
        editButton.setAttribute('data-testid', 'bookItemEditButton');
        editButton.addEventListener('click', function () {
            editBook(bookObject.id);
        });

    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.textContent = 'Belum selesai';
        undoButton.classList.add('undo-button');
        undoButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        undoButton.addEventListener('click', function () {
            undoBookFromComplete(bookObject.id);
        });

        container.append(undoButton, editButton, trashButton)
    } else {
        const checkButton = document.createElement('button');
        checkButton.textContent = 'Selesai dibaca';
        checkButton.classList.add('bookFormIsinCheckbox');
        checkButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        checkButton.addEventListener('click', function () {
            addBookToComplete(bookObject.id);
        });

        container.append(checkButton, editButton, trashButton);
    }

    return container;

};

function addBookToComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
};

function removeBookList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function undoBookFromComplete(bookId) {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function findBookIndex(bookId) {
    for (let i = 0; i < books.length; i++) {
        if(books[i].id === bookId) {
            return i;
        }
    }
    return -1
}

function bookSearch(keyword) {
    const uncompleteBookList = document.getElementById('incompleteBookList');
    uncompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    for(const bookItem of books) {
        if(bookItem.title.toLowerCase().includes(keyword.toLowerCase())) {
            const bookElement = makeBook(bookItem);
            if(!bookItem.isComplete) {
                uncompleteBookList.append(bookElement);
            } else {
                completeBookList.append(bookElement);
            }
        }
    }
}

function editBook(bookId) {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    const newTitle = prompt("Masukkan Judul Baru : ", bookTarget.title);
    const newAuthor = prompt("Masukkan Penulis Baru : ", bookTarget.author);
    const newYear = prompt("Masukkan Tahun Terbit Baru : ", bookTarget.year);

    if(newTitle && newAuthor && !isNaN(newYear)) {
        bookTarget.title = newTitle.trim() || bookTarget.title;
        bookTarget.author = newAuthor.trim() || bookTarget.author;
        bookTarget.year = newYear.trim() || bookTarget.year;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}