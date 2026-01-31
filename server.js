const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');

const app = express();
const PORT = 3000;

// 🔴 TODO: Replace this with your ACTUAL Client ID from Google Cloud Console
// It usually looks like: "123456789-abcdefg.apps.googleusercontent.com"
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

const client = new OAuth2Client(CLIENT_ID);

// Middleware to parse JSON bodies from frontend requests
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static('.'));

// 🔹 Auth Route: Verify Google Token
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    console.log("Received login attempt with token:", token ? token.substring(0, 20) + "..." : "null");

    try {
        // 1. Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        // 2. Get user information from the verified payload
        const payload = ticket.getPayload();
        const userId = payload['sub']; // Google's unique user ID
        const { email, name, picture } = payload;

        console.log(`✅ Authentication Successful for: ${email}`);

        // 3. (Optional) Check your database here to see if user exists
        // if (!db.userExists(email)) db.createUser({ ... })

        // 4. Send success response
        res.status(200).json({
            success: true,
            user: { name, email, picture },
            message: "Successfully logged in!"
        });

    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
        res.status(401).json({
            success: false,
            message: "Invalid Token. Make sure your Client ID matches in frontend and backend."
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`
🚀 Server is running!
----------------------------------
👉 App URL:    http://localhost:${PORT}
👉 Backend:    http://localhost:${PORT}/api/auth/google
----------------------------------
To test real Google Login:
1. Open 'real_google_login.html' (I created this for you)
2. Replace 'YOUR_GOOGLE_CLIENT_ID_HERE' in both server.js and the html file.
    `);
});
