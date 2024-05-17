import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import dotenv from "dotenv";
import multer from 'multer';


// Load environment variables from .env file
dotenv.config();

// Debug logging to verify environment variables
console.log("Loading AWS SDK configuration...");
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log(
  "AWS_SECRET_ACCESS_KEY:",
  process.env.AWS_SECRET_ACCESS_KEY ? "*****" : "Not set"
);

// AWS SDK v3 Configuration
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const s3 = new S3Client({ region: process.env.AWS_REGION });
const upload = multer({ dest: '../uploads/' });


// Controller for creating a new book
export const createBook = async (req, res) => {
  try {
    const { title, author, publishYear } = req.body;
    const { file } = req; 

    console.log("FILEEE: " , file);

    let imageUrl = null;

    console.log(process.env.AWS_S3_BUCKET_NAME_BEFORE)

    if (file) {
      console.log("enter");
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME_BEFORE,
        // Key: `${Date.now()}_${file.originalname}`, 
        Key: `${file.originalname}`, 
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const command = new PutObjectCommand(uploadParams);
      const data = await s3.send(command);


      imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME_BEFORE}.s3.amazonaws.com/${uploadParams.Key}`;
      console.log("IMAGE URLLLL:" , imageUrl)

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
        imageUrl: { S: imageUrl },
      },
    };

    const command = new PutItemCommand(params);
    const data = await client.send(command);
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
      imageUrl: item.imageUrl?.S,
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
      imageUrl: data.Item.imageUrl?.S,
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
      console.log("ERRRORRR")
    }

    console.log("UPDATEEEEEEEEEEEEEEEE::",req.body);

    const { id } = req.params;
    const file = req.file;

    let imageUrl = null;

    if (file) {
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${Date.now()}_${file.originalname}`, // Using a timestamp to make the filename unique
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make the file publicly readable
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Generate the S3 object URL
      imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    }

    const params = {
      TableName: "Books",
      Key: {
        id: { S: id },
      },
      UpdateExpression:
        "set title = :title, author = :author, publishYear = :publishYear, updatedAt = :updatedAt" + (imageUrl ? ", imageUrl = :imageUrl" : ""),
      ExpressionAttributeValues: {
        ":title": { S: req.body.title },
        ":author": { S: req.body.author },
        ":publishYear": { N: req.body.publishYear.toString() },
        ":updatedAt": { S: new Date().toISOString() },
        ...(imageUrl && { ":imageUrl": { S: imageUrl } }),
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
