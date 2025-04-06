# E-Voting System

A secure and user-friendly electronic voting system built with Node.js, Express, and SQLite.

## Features

- 🔐 Secure user authentication with session management
- 📝 User registration with voter ID and Aadhar verification
- 🗳️ Secure voting mechanism with face authentication
- 📊 Real-time vote statistics and dashboard
- 📱 Responsive design for all devices
- 🔒 Account protection with login attempt limits
- 📧 Email notifications for important events

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- SQLite3

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ideathon
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

The application will be available at `http://localhost:3001`

## Default Login Credentials

For testing purposes, you can use these credentials:
- Email: admin@example.com
- Password: admin123

## Project Structure

```
ideathon/
├── models/
│   ├── User.js
│   └── Vote.js
├── views/
│   ├── home.ejs
│   ├── login.ejs
│   ├── signup.ejs
│   └── dashboard.ejs
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── server.js
└── database.sqlite
```

## API Endpoints

- `GET /` - Home page
- `GET /login` - Login page
- `POST /login` - Login authentication
- `GET /signup` - Registration page
- `POST /signup` - User registration
- `GET /dashboard` - User dashboard
- `POST /submit-vote` - Submit vote
- `GET /vote-stats` - Get voting statistics

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- Account locking after failed attempts
- Input validation and sanitization
- SQL injection protection
- XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

