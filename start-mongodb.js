const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join('C:', 'data', 'db');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Start MongoDB
const mongod = spawn('mongod', [
    '--dbpath', dataDir,
    '--bind_ip', '127.0.0.1'
]);

mongod.stdout.on('data', (data) => {
    console.log(`MongoDB: ${data}`);
});

mongod.stderr.on('data', (data) => {
    console.error(`MongoDB Error: ${data}`);
});

mongod.on('close', (code) => {
    console.log(`MongoDB process exited with code ${code}`);
}); 