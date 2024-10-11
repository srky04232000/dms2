
// Setup IndexedDB and object store
function setupTodoListIndexedDB(callback) {
    let request = indexedDB.open("TodoListDB", 1);

    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        let objectStore = db.createObjectStore("TodoList", { keyPath: "id" });
        objectStore.createIndex("status", "status", { unique: false });
        db.createObjectStore("TodoListCompleted", { keyPath: "id" });
    };

    request.onsuccess = function (event) {
        let db = event.target.result;
        callback(db);
    };
}

// Populate the TodoList with 100,000 items
function populateTodoList(db, callback) {
    let transaction = db.transaction("TodoList", "readwrite");
    let store = transaction.objectStore("TodoList");

    for (let i = 1; i <= 100000; i++) {
        let status = i <= 1000 ? "completed" : "in progress";
        let task = { id: i, task: `Task ${i}`, status: status, dueDate: `2024-12-${(i % 30) + 1}` };
        store.add(task);
    }

    transaction.oncomplete = function () {
        console.log("TodoList populated with 100,000 tasks.");
        callback();
    };
}

// Measure query time for completed tasks
function measureQueryTime(db, storeName, status, callback) {
    let transaction = db.transaction(storeName, "readwrite");// read only
    let store = transaction.objectStore(storeName);
    let index = store.index("status");

    let start = performance.now();
    let count = 0;

    let request = index.openCursor(IDBKeyRange.only(status));
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            let end = performance.now();
            console.log(`${count} tasks with status "${status}" fetched in ${(end - start).toFixed(2)} ms.`);
            callback();
        }
    };
}

// Function to copy completed tasks to a new store
function copyCompletedTasksToNewStore(db, callback) {
    let transaction = db.transaction(["TodoList", "TodoListCompleted"], "readwrite");
    let store = transaction.objectStore("TodoList");
    let completedStore = transaction.objectStore("TodoListCompleted");
    let index = store.index("status");

    let request = index.openCursor(IDBKeyRange.only("completed"));
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            completedStore.add(cursor.value);
            cursor.continue();
        } else {
            callback();
        }
    };
}

// Example usage
setupTodoListIndexedDB(function (db) {
    populateTodoList(db, function () {
        // Measure time for querying completed tasks
        measureQueryTime(db, "TodoList", "completed", function () {
            // Copy completed tasks to the new store
            copyCompletedTasksToNewStore(db, function () {
                console.log("Completed tasks copied to TodoListCompleted.");
            });
        });
    });
});
