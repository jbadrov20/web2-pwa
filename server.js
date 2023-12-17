const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { log } = require('console');

const app = express();
const port = 5000;

// Create a multer storage instance
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Set up multer with the storage configuration
const upload = multer({ storage: storage });
app.use(cors());
// Serve uploaded images statically
app.use('/uploads', express.static('src/uploads'));
app.use(express.static('src'));
// Function to save the uploaded file
const saveFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('Invalid file');
      return;
    }
    console.log('1. Before saving the file:', new Date());
    if(!file.buffer) {
      reject('Invalid file buffer');
      return;
    }

    const filePath = path.join(__dirname, 'src', 'uploads', file.filename);

    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        console.error('2. Error saving the file:', err);
        reject('Failed to save the file: ' + err.message);
      } else {
        console.log('3. File saved successfully:', new Date());
        resolve({ uploaded: true });
      }
    });
  });
};

app.get('/gallery', (req, res) => {
  const galleryPath = path.join(__dirname, 'src', 'uploads');

  // Read the contents of the 'uploads' directory
  fs.readdir(galleryPath, (err, files) => {
    if (err) {
      console.error('Error reading gallery:', err);
      res.status(500).json({ error: 'Error reading gallery' });
    } else {
      // Filter out non-image files if needed
      const imageFiles = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));

      // Create an array of image URLs
      const imageUrls = imageFiles.map(file => `/uploads/${file}`);

      res.json({ gallery: imageUrls });
    }
  });
});



// Handle file upload
app.post('/upload', upload.single('photo'), async (req, res) => {
  console.log("počinjem uplaod slike u index.js");
  console.log(req.file);

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Cannot find file on request' });
    }

    const response = await saveFile(req.file);
    console.log("File saved: ", response);
    res.status(201).json({ uploaded: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process the request' });
  }

  console.log("završavam upload slike u index.js");
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Run the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
