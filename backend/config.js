// import "dotenv/config";

// export const PORT = 5555;


// export const mongoDBURL = "mongodb://localhost:27017/bookstore";

const config = {
    database: {
        host: 'localhost',
        port: 27017,
        dbName: 'myDatabase',
        // Other database configuration options
    },
    apiKeys: {
        apiKey1: 'your-api-key-1',
        apiKey2: 'your-api-key-2',
        // Other API keys
    },
    // Other configuration options
};

export default config;