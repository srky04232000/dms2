const data = {
    sensorReadings: [
        [25.4, 60.3],
        [22.8, 55.1]
    ],  // Array of readings: Temperature and Humidity
    cropPhoto: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",  // Base64 encoded PNG image
    farmerNote: "Watering required due to dry conditions.",  // Farmer's note
    gpsCoordinates: [-34.397, 150.644],  // GPS coordinates (Latitude and Longitude)
    timestamp: new Date("2023-09-10T10:20:30Z"),  // Fixed timestamp
};

// Test 1: Check if sensor readings format is an array of arrays with two numeric values
test("Sensor readings should be an array of arrays with two numeric values", () => {
    expect(Array.isArray(data.sensorReadings)).toBe(true);
    data.sensorReadings.forEach(reading => {
        expect(reading.length).toBe(2);
        reading.forEach(value => expect(typeof value).toBe("number"));
    });
});

// Test 2: Check if crop photo is a base64 string
test("Crop photo should be a base64 encoded string", () => {
    expect(typeof data.cropPhoto).toBe("string");
    expect(data.cropPhoto.startsWith("data:image/png;base64,")).toBe(true);  // PNG format check
});

// Test 3: Check if farmer note is a string
test("Farmer note should be a string", () => {
    expect(typeof data.farmerNote).toBe("string");
    expect(data.farmerNote.length).toBeGreaterThan(0);
});

// Test 4: Test GPS coordinates (should be an array with two numeric values)
test("GPS coordinates should be an array with two numeric values", () => {
    expect(Array.isArray(data.gpsCoordinates)).toBe(true);
    expect(data.gpsCoordinates.length).toBe(2);
    data.gpsCoordinates.forEach(value => expect(typeof value).toBe("number"));
});

// Test 5: Check if timestamp is a valid Date object
test("Timestamp should be a valid Date object", () => {
    expect(data.timestamp instanceof Date).toBe(true);
    expect(!isNaN(data.timestamp.getTime())).toBe(true);  // Check valid date
});
