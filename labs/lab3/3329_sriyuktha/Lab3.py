import uuid
import pymongo
from datetime import datetime
import random

# MongoDB connection URI
MONGO_URI = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"

# Initialize MongoDB client and specify database and collection
client = pymongo.MongoClient(MONGO_URI)
db = client['lab3']  # Use the 'lab3' database
collection = db["3329_sriyuktha"]  # Use the '3329_sriyuktha' collection

def generate_document():
    """Generate a single document with UUID, timestamps, and random attributes."""
    return {
        'uuid': str(uuid.uuid4()),
        'source_db': "MongoDB",
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'rating': random.randint(1, 5),  # Random rating between 1 and 5
        'review_count': random.randint(0, 1000),  # Random review count between 0 and 1000
        'discount': round(random.uniform(0.0, 50.0), 2)  # Random discount percentage between 0.0 and 50.0
    }

def insert_documents_in_batches(documents, batch_size=100):
    """Insert documents into MongoDB in batches."""
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        try:
            result = collection.insert_many(batch)
            print(f"Inserted {len(result.inserted_ids)} documents into MongoDB.")
        except pymongo.errors.BulkWriteError as e:
            print("Error during bulk write:", e.details)

def main():
    # Generate 1000 documents
    num_documents = 1000
    documents = [generate_document() for _ in range(num_documents)]
    
    # Insert documents into MongoDB in batches
    insert_documents_in_batches(documents)

    # Print a sample of the data inserted
    print("Sample document:", documents[0])

if __name__ == "__main__":
    main()
