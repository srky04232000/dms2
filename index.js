// Configuration for IndexedDB
const DB_NAME = "AgricultureDB";
const OBJECT_STORE_NAME = "FarmData";

// Function to open IndexedDB
function openDB(callback) {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        const store = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id", autoIncrement: true });
        // Creating indexes for all the fields
        store.createIndex("sensorReadings", "sensorReadings", { unique: false });
        store.createIndex("cropPhoto", "cropPhoto", { unique: false });
        store.createIndex("farmerNote", "farmerNote", { unique: false });
        store.createIndex("gpsCoordinates", "gpsCoordinates", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
    };
    request.onsuccess = function (event) {
        const db = event.target.result;
        callback(db);  // Proceed with DB operations
    };

    request.onerror = function (event) {
        console.error("Error opening database:", event.target.error);
    };
}

// Function to add data to IndexedDB
function addData(db, data) {
    const transaction = db.transaction([OBJECT_STORE_NAME], "readwrite");
    const store = transaction.objectStore(OBJECT_STORE_NAME);

    const request = store.add(data);

    request.onsuccess = function () {
        console.log("Data added successfully.");
        fetchData(db);  // Fetch data after successful addition
    };

    request.onerror = function (event) {
        console.error("Error adding data:", event.target.error);
    };
}

// Function to fetch data from IndexedDB
function fetchData(db) {
    const transaction = db.transaction([OBJECT_STORE_NAME], "readonly");
    const store = transaction.objectStore(OBJECT_STORE_NAME);

    const request = store.getAll();

    request.onsuccess = function (event) {
        const records = event.target.result;
        console.log("Retrieved data:", records);  // Log data to the browser console
        records.forEach(record => {
            console.log("Sensor Readings:", record.sensorReadings);
            console.log("Crop Photo (Base64):", record.cropPhoto);
            console.log("Farmer Note:", record.farmerNote);
            console.log("GPS Coordinates:", record.gpsCoordinates);
            console.log("Timestamp:", record.timestamp);

            // Optionally, display the image
            const img = new Image();
            img.src = record.cropPhoto;
            document.body.appendChild(img);
        });
    };

    request.onerror = function (event) {
        console.error("Error fetching data:", event.target.error);
    };
}

// Fetch the data from `data.json` and store it in IndexedDB
fetch("data.json")
    .then(response => response.json())
    .then(jsonData => {
        openDB(function (db) {
            jsonData.forEach(data => {
                addData(db, data);
            });
        });
    })
    .catch(error => console.error("Error loading JSON data:", error));
