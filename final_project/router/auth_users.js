const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.includes(username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users[username] === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username) || !authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username: username }, 'secret', { expiresIn: '1h' });
    res.setHeader('Authorization', 'Bearer ' + token);

    return res.status(200).json({ message: "Login successful", token: token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review; // Use req.body.review to access the review

    if (!req.user || !req.user.username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews[username]) {
        // Modify existing review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: "Review updated successfully" });
    } else {
        // Add new review
        books[isbn].reviews[username] = review;
        return res.status(201).json({ message: "Review added successfully" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!req.user || !req.user.username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
