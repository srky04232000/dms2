const { MongoClient } = require('mongodb');

const mongoUri = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3';
const dbName = 'lab3';
const collectionName = '3329_sriyuktha';

let localDB = {};

const createRecord = (i) => ({
    uuid: `uuid-${i}`,
    source_db: 'IndexedDB',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: Math.floor(Math.random() * 5) + 1,
    review_count: Math.floor(Math.random() * 1000),
    discount: (Math.random() * 50).toFixed(2),
    product_name: `Product ${i}`,
    price: (Math.random() * 100).toFixed(2),
    available: Math.random() < 0.5,
});

const populateLocalDB = () => {
    Array.from({ length: 1000 }, (_, i) => createRecord(i)).map(record => {
        localDB[record.uuid] = record;
    });
    console.log(`Initialized local DB with ${Object.keys(localDB).length} records.`);
};

const fetchMongoData = async (client) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return await collection.find({}).toArray();
};

const syncMongoToLocalDB = async () => {
    const client = new MongoClient(mongoUri);
    await client.connect();
    try {
        const mongoData = await fetchMongoData(client);
        const addedRecords = mongoData.map((doc) => {
            if (!localDB[doc.uuid]) {
                localDB[doc.uuid] = doc;
                return doc;
            }
        }).filter(Boolean).length;
        console.log(`Added ${addedRecords} records to local DB.`);
    } catch (error) {
        console.error('Error syncing MongoDB to local DB:', error);
    } finally {
        await client.close();
    }
};

const syncLocalToMongoDB = async () => {
    const client = new MongoClient(mongoUri);
    await client.connect();
    try {
        const mongoData = await fetchMongoData(client);
        const mongoUUIDs = new Set(mongoData.map(doc => doc.uuid));
        const newRecords = Object.values(localDB).filter(doc => !mongoUUIDs.has(doc.uuid));

        if (newRecords.length > 0) {
            console.log('Inserting new data into MongoDB:', newRecords);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const result = await collection.insertMany(newRecords);
            console.log(`Inserted ${result.insertedCount} records into MongoDB.`);
        } else {
            console.log('No new data to insert into MongoDB.');
        }
    } catch (error) {
        console.error('Error syncing local DB to MongoDB:', error);
    } finally {
        await client.close();
    }
};

const getMongoDocumentCount = async () => {
    const client = new MongoClient(mongoUri);
    await client.connect();
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        return await collection.countDocuments();
    } catch (error) {
        console.error('Error fetching MongoDB document count:', error);
        return 0;
    } finally {
        await client.close();
    }
};

const syncProcess = async () => {
    console.log('<------------------ Syncing Started ------------------>');
    populateLocalDB();

    const initialMongoCount = await getMongoDocumentCount();
    const initialLocalCount = Object.keys(localDB).length;
    console.log(`Initial Count - MongoDB: ${initialMongoCount}, LocalDB: ${initialLocalCount}`);

    await syncMongoToLocalDB();
    await syncLocalToMongoDB();

    const finalMongoCount = await getMongoDocumentCount();
    const finalLocalCount = Object.keys(localDB).length;
    console.log(`Final Count - MongoDB: ${finalMongoCount}, LocalDB: ${finalLocalCount}`);

    console.log('<------------------ Syncing end ------------------>');
};

syncProcess();
