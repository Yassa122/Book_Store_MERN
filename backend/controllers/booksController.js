import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();


// AWS SDK v3 Configuration
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Controller for creating a new book
export const createBook = async (req, res) => {
  try {
    if (!req.body.title || !req.body.author || !req.body.publishYear) {
      return res.status(400).send({
        message: "Send all required fields!",
      });
    }

    const params = {
      TableName: "Books",
      Item: {
        id: { S: new Date().toISOString() }, // Generating a simple unique id based on timestamp
        title: { S: req.body.title },
        author: { S: req.body.author },
        publishYear: { N: req.body.publishYear.toString() },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
      },
    };

    const command = new PutItemCommand(params);
    const data = await client.send(command);
    console.log("Data inserted successfully!", data);
    res.status(201).send("Data inserted successfully!");
  } catch (error) {
    console.log("Error inserting data into database", error);
    res.status(500).send({ message: error.message });
  }
};

// Controller for getting all books
export const getAllBooks = async (req, res) => {
  try {
    const params = {
      TableName: "Books",
    };

    const command = new ScanCommand(params);
    const data = await client.send(command);

    const books = data.Items.map((item) => ({
      id: item.id?.S,
      title: item.title?.S,
      author: item.author?.S,
      publishYear: item.publishYear?.N,
      createdAt: item.createdAt?.S,
      updatedAt: item.updatedAt?.S,
    }));

    res.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.log("Error fetching data from database", error);
    res.status(500).send({ message: error.message });
  }
};

// Controller for getting a book by ID
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("IDDDDD:" , id);

    const params = {
      TableName: "Books",
      Key: {
        id: { S: id },
      },
    };

    const command = new GetItemCommand(params);
    const data = await client.send(command);

    if (!data.Item) {
      return res.status(404).json({ message: "Book not found!" });
    }

    const book = {
      id: data.Item.id?.S,
      title: data.Item.title?.S,
      author: data.Item.author?.S,
      publishYear: data.Item.publishYear?.N,
      createdAt: data.Item.createdAt?.S,
      updatedAt: data.Item.updatedAt?.S,
    };

    res.status(200).json(book);
  } catch (error) {
    console.log("Error fetching data from database", error);
    res.status(500).send({ message: error.message });
  }
};

// Controller for updating a book
export const updateBook = async (req, res) => {
  try {
    if (!req.body.title || !req.body.author || !req.body.publishYear) {
      return res.status(400).send({
        message: "Send all required fields!",
      });
    }

    const { id } = req.params;

    const params = {
      TableName: "Books",
      Key: {
        id: { S: id },
      },
      UpdateExpression:
        "set title = :title, author = :author, publishYear = :publishYear, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":title": { S: req.body.title },
        ":author": { S: req.body.author },
        ":publishYear": { N: req.body.publishYear.toString() },
        ":updatedAt": { S: new Date().toISOString() },
      },
    };

    const command = new UpdateItemCommand(params);
    const data = await client.send(command);

    if (!data.Attributes) {
      return res.status(404).json({ message: "Book not found!" });
    }

    res.status(200).json({ message: "Book updated successfully!" });
  } catch (error) {
    console.log("Error updating data in database", error);
    res.status(500).send({ message: error.message });
  }
};

// Controller for deleting a book
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("IDDDDDDDDDDDDD:" , id);

    const params = {
      TableName: "Books",
      Key: {
        id: { S: id },
      },
    };

    const command = new DeleteItemCommand(params);
    const data = await client.send(command);

    if (!data.Attributes) {
      return res.status(404).json({ message: "Book not found!" });
    }

    res.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    console.log("Error deleting data from database", error);
    res.status(500).send({ message: error.message });
  }
};
