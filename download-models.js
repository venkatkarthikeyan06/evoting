const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');
const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1'
];

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

// Download each model file
models.forEach(model => {
    const url = `https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/${model}`;
    const filePath = path.join(modelsDir, model);

    https.get(url, (response) => {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded: ${model}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${model}:`, err.message);
    });
}); 