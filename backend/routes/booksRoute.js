import express from "express";
import multer from 'multer';
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/booksController.js";

const router = express.Router();
const upload = multer();

console.log("in routess")
// Route for saving a new book
router.post("/",upload.single('image') ,createBook);

// Route for getting all books from db
router.get("/", getAllBooks);

// Route for getting a book by id
router.get("/:id", getBookById);

// Route for updating a book
router.put("/:id", upload.single('image'), updateBook);

// Route for deleting a book
router.delete("/:id", deleteBook);

export default router;
