const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { Sequelize, DataTypes } = require('sequelize');
const SQLiteStore = require('connect-session-sequelize')(session.Store);
const QRCode = require("qrcode");
const User = require("./models/User");
const Vote = require("./models/Vote");

const app = express();

// Database setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// User model
const UserModel = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    voterId: {
        type: DataTypes.STRING,
        unique: true
    },
    aadharNumber: {
        type: DataTypes.STRING,
        unique: true
    },
    phoneNumber: DataTypes.STRING,
    address: DataTypes.TEXT,
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lockUntil: DataTypes.DATE,
    lastLogin: DataTypes.DATE
});

// Vote model
const VoteModel = sequelize.define('Vote', {
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    candidate: DataTypes.STRING,
    timestamp: DataTypes.DATE
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session configuration
const sessionStore = new SQLiteStore({
    db: sequelize,
});

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Email configuration
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "jagadeep.bsg@gmail.com",
        pass: "rehj rxir ujts zmhp",
    },
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Landing page
app.get("/", (req, res) => {
    res.render("home", { message: "" });
});

// Login routes
app.get("/login", (req, res) => {
    res.render("login", { message: "" });
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            return res.render("login", { message: "Invalid email or password" });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            return res.render("login", { 
                message: "Account is locked. Please try again later." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
            }
            await user.save();
            return res.render("login", { message: "Invalid email or password" });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = null;
        user.lastLogin = new Date();
        await user.save();

        // Set session
        req.session.userId = user.id;
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Login error:", error);
        res.render("login", { message: "An error occurred during login" });
    }
});

// Signup routes
app.get("/signup", (req, res) => {
    res.render("signup", { message: "" });
});

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password, voterId, aadharNumber, phoneNumber, address } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { email },
                    { voterId },
                    { aadharNumber }
                ]
            }
        });

        if (existingUser) {
            return res.render("signup", { 
                message: "User already exists with this email, voter ID, or Aadhar number" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await UserModel.create({
            name,
            email,
            password: hashedPassword,
            voterId,
            aadharNumber,
            phoneNumber,
            address
        });

        res.redirect('/login');
    } catch (error) {
        console.error("Signup error:", error);
        res.render("signup", { message: "An error occurred during signup" });
    }
});

// Dashboard route
app.get("/dashboard", isAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.session.userId);
        const totalVoters = await UserModel.count();
        const totalVotes = await VoteModel.count();
        const turnoutPercentage = Math.round((totalVotes / totalVoters) * 100);

        res.render("dashboard", {
            user,
            stats: {
                totalVoters,
                totalVotes,
                turnoutPercentage
            }
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.redirect('/login');
    }
});

// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
        }
        res.redirect('/');
    });
});

// Existing routes
app.get("/about", (req, res) => {
    res.render("about", { message: "" });
});

app.get("/auth", isAuthenticated, (req, res) => {
    res.render("auth", { message: "" });
});

app.get("/face-auth", isAuthenticated, (req, res) => {
    res.render("face-auth", { message: "" });
});

app.get("/vote", isAuthenticated, (req, res) => {
    res.render("vote", { message: "" });
});

// Handle OTP generation and sending via email
app.post("/send-otp", isAuthenticated, (req, res) => {
    const user = req.session.user;
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in session
    req.session.otp = generatedOTP;
    req.session.otpExpiry = Date.now() + (5 * 60 * 1000); // OTP valid for 5 minutes

    const mailOptions = {
        from: "jagadeep.bsg@gmail.com",
        to: user.email,
        subject: "Your OTP for Secure Voting",
        text: `Your OTP is: ${generatedOTP}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.render("auth", { message: "Error sending OTP. Try again!" });
        }
        res.render("auth", { message: "OTP sent successfully. Check your email!" });
    });
});

// Handle OTP verification
app.post("/verify-otp", isAuthenticated, (req, res) => {
    const { otp } = req.body;
    
    // Check if OTP is expired
    if (Date.now() > req.session.otpExpiry) {
        return res.render("auth", { message: "OTP has expired. Please request a new one." });
    }

    if (otp === req.session.otp) {
        res.render("face-auth", { message: "OTP Verified Successfully! Please proceed with face authentication." });
    } else {
        res.render("auth", { message: "Invalid OTP. Try again!" });
    }
});

// Handle vote submission
app.post("/submit-vote", isAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.session.userId);
        const { party } = req.body;
        
        // Check if user has already voted
        if (user.hasVoted) {
            return res.status(400).json({ 
                success: false, 
                message: "You have already voted!" 
            });
        }
        
        // Create QR code
        const voteData = {
            voterId: user.voterId,
            party,
            timestamp: new Date().toISOString()
        };
        
        const qrCode = await QRCode.toDataURL(JSON.stringify(voteData));
        
        // Create new vote
        const newVote = await VoteModel.create({
            userId: user.id,
            candidate: party,
            timestamp: new Date()
        });
        
        // Update user's voting status
        user.hasVoted = true;
        await user.save();
        
        res.json({ 
            success: true, 
            message: "Vote recorded successfully!",
            qrCode 
        });
    } catch (error) {
        console.error("Error recording vote:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error recording vote. Please try again." 
        });
    }
});

// Get vote statistics
app.get("/vote-stats", isAuthenticated, async (req, res) => {
    try {
        const stats = await VoteModel.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('candidate')), 'count'],
                'candidate'
            ],
            group: ['candidate'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('candidate')), 'DESC']]
        });
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error("Error getting vote statistics:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error retrieving vote statistics." 
        });
    }
});

// Initialize database and start server
sequelize.sync()
    .then(() => {
        app.listen(3001, () => {
            console.log("Server is running on port 3001");
        });
    })
    .catch(err => {
        console.error("Database initialization error:", err);
    });
