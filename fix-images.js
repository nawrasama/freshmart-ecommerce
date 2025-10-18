const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔄 Downloading placeholder images...');

// Create images directory
const imagesDir = path.join(__dirname, 'frontend/images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// List of images to create with placeholder service
const images = [
    { name: 'hero-bg.jpg', width: 1200, height: 400, text: 'FreshMart+Groceries', color: '2ecc71' },
    { name: 'free-shipping.png', width: 100, height: 100, text: '🚚', color: '3498db' },
    { name: 'secure-payment.png', width: 100, height: 100, text: '🔒', color: '2ecc71' },
    { name: 'premium-quality.png', width: 100, height: 100, text: '⭐', color: 'f1c40f' },
    { name: 'support.png', width: 100, height: 100, text: '💬', color: '9b59b6' },
    { name: 'munchee-crackers.jpg', width: 300, height: 200, text: 'Crackers', color: 'e67e22' },
    { name: 'sunlight-liquid.jpg', width: 300, height: 200, text: 'Detergent', color: '3498db' },
    { name: 'vim-liquid.jpg', width: 300, height: 200, text: 'Dishwash', color: '2ecc71' },
    { name: 'kist-jam.jpg', width: 300, height: 200, text: 'Jam', color: 'e74c3c' },
    { name: 'elephant-house-soda.jpg', width: 300, height: 200, text: 'Soda', color: '1abc9c' },
    { name: 'anchor-milk.jpg', width: 300, height: 200, text: 'Milk+Powder', color: 'f1c40f' },
    { name: 'maggi-noodles.jpg', width: 300, height: 200, text: 'Noodles', color: 'd35400' },
    { name: 'dettol-soap.jpg', width: 300, height: 200, text: 'Soap', color: '27ae60' },
    { name: 'placeholder-product.jpg', width: 300, height: 200, text: 'Product+Image', color: '95a5a6' }
];

let downloaded = 0;

function downloadImage(imageConfig) {
    const { name, width, height, text, color } = imageConfig;
    const url = `https://via.placeholder.com/${width}x${height}/${color}/ffffff?text=${text}`;
    const filePath = path.join(imagesDir, name);

    https.get(url, (response) => {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
            fileStream.close();
            downloaded++;
            console.log(`✅ Downloaded: ${name}`);
            
            if (downloaded === images.length) {
                console.log('\n🎉 All images downloaded successfully!');
                console.log('📍 Location: frontend/images/');
                console.log('\n🔄 Please restart your server and refresh the browser.');
            }
        });
    }).on('error', (err) => {
        console.log(`❌ Error downloading ${name}:`, err.message);
    });
}

// Download all images
images.forEach(downloadImage);