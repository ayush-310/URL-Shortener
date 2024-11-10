const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { setUser } = require('../service/auth');
const User = require("../models/user");

async function handleUserSignUp(req, res) {
    const { name, email, password } = req.body;

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.redirect('/login');
    } catch (error) {
        console.error("Error in sign-up:", error);
        return res.render('signup', { error: "Sign-up failed. Please try again." });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('login', { error: "Invalid Username or Password" });
        }

        // Compare the entered password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.render('login', { error: "Invalid Username or Password" });
        }

        // Set session ID and cookie
        const sessionId = uuidv4();
        setUser(sessionId, user);
        res.cookie('uid', sessionId);

        return res.redirect('/');
    } catch (error) {
        console.error("Error in login:", error);
        return res.render('login', { error: "Login failed. Please try again." });
    }
}

module.exports = {
    handleUserSignUp,
    handleUserLogin,
};
