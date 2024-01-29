const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const jwt = require('jsonwebtoken');
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }
    users[username] = password;
    const token = jwt.sign({ username: username }, 'secret', { expiresIn: '1h' });
    return res.status(201).json({ message: "User registered successfully", token: token });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('https://moultamissim-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/');
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status || 500).json({ message: error.message || "Internal Server Error" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json({ book: books[isbn] });
    
 });
  
// Get book details based on author
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`https://moultamissim-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/isbn/${isbn}`);
        res.json({ book: response.data });
    } catch (error) {
        if (error.response.status === 404) {
            res.status(404).json({ message: "Book not found" });
        } else {
            res.status(error.response.status || 500).json({ message: error.message || "Internal Server Error" });
        }
    }
});

// Get all books based on title
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(`https://moultamissim-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/author/${author}`);
        res.json({ books: response.data });
    } catch (error) {
        if (error.response.status === 404) {
            res.status(404).json({ message: "No books found with the specified author" });
        } else {
            res.status(error.response.status || 500).json({ message: error.message || "Internal Server Error" });
        }
    }
});

//  Get book review
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const response = await axios.get(`https://moultamissim-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/title/${title}`);
        res.json({ books: response.data });
    } catch (error) {
        if (error.response.status === 404) {
            res.status(404).json({ message: "No books found with the specified title" });
        } else {
            res.status(error.response.status || 500).json({ message: error.message || "Internal Server Error" });
        }
    }
});
module.exports.general = public_users;
