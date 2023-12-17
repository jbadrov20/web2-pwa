document.addEventListener('DOMContentLoaded', function () {

  const camera = document.querySelector('#camera');
  const photo = document.querySelector('#photo');
  const open = document.querySelector('#open');
  const gallery = document.querySelector('#gallery');

  open.addEventListener('click', function () {
    // Access the device camera
    navigator.mediaDevices.getUserMedia({ video: {width:1280, height: 720 } })
      .then(function (stream) {
        // Display the camera stream in a video element (hidden)
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        document.body.appendChild(video);
  
        video.play();
  
        // Capture a frame from the video stream as an image
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        video.addEventListener('canplay', function () {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
          // Convert the canvas content to a data URL
          const imageUrl = canvas.toDataURL('image/jpeg');
  
          // Set the captured image to the photo element
          photo.src = imageUrl;
  
          // Stop the camera stream and remove the video element
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(video);
  
          // Save the captured image to the server
          savePhoto(imageUrl);
        });
      })
      .catch(function (error) {
        console.error('Error accessing the camera:', error);
      });
  });

  function savePhoto(imageUrl) {
    console.log("počinjem spremanje slike u app.js");
    const formData = new FormData();
    formData.append('photo', dataURItoBlob(imageUrl), 'photo.jpg');
    console.log(formData);
    fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        updateGallery();
      })
      .catch(error => {
        console.error('Error saving photo:', error.message);
        // Handle the error as needed
      });
      console.log("završavam spremanje slike u app.js");
  }
  
  

  function updateGallery() {
    fetch('http://localhost:5000/gallery')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Assuming the server responds with an array of image URLs
      const gallery = data.gallery;

      // Clear existing gallery content
      const galleryContainer = document.getElementById('gallery');
      galleryContainer.innerHTML = '';

      // Create and append img elements for each image URL
      gallery.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('gallery-photo');
        galleryContainer.appendChild(img);
      });
    })
    .catch(error => {
      console.error('Error fetching gallery:', error);
      // Handle the error as needed
    });
  }


  // Convert data URI to Blob
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  updateGallery();

});
