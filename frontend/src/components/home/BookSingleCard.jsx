import { Link } from "react-router-dom";
import { PiBookOpenTextLight } from "react-icons/pi";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { BiUserCircle, BiShow } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import { useState } from "react";
import BookModal from "./BookModal";

const BookSingleCard = ({ book }) => {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="border-2 border-gray-500 rounded-lg p-12 m-8 relative hover:shadow-xl w-full max-w-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="absolute top-1 right-2 px-4 py-1 bg-red-300 rounded-lg text-lg">
        {book.publishYear}
      </h2>
      <div className="flex justify-center">
  {book.imageUrl ? (
    <img
      src={book.imageUrl}
      alt={book.title}
      className="rounded-lg mb-4"
      style={{ display: 'block' }}
    />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}
      </div>
      <div className="flex justify-start items-center gap-x-4">
        <BiUserCircle className="text-red-300 text-3xl" />
        <h2 className="my-1 text-xl">{book.author}</h2>
      </div>
      <div className="flex justify-between items-center gap-x-4 mt-6 p-4">
        <Link to={`/books/details/${book.id}`}>
          <BsInfoCircle className="text-3xl text-green-800 hover:text-black" />
        </Link>
        <Link to={`/books/edit/${book.id}`}>
          <AiOutlineEdit className="text-3xl text-yellow-600 hover:text-black" />
        </Link>
        <Link to={`/books/delete/${book.id}`}>
          <MdOutlineDelete className="text-3xl text-red-600 hover:text-black" />
        </Link>
      </div>
 
      {showModal && (
        <BookModal book={book} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default BookSingleCard;
