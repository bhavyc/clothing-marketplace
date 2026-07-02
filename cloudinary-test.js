const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary with collected credentials
cloudinary.config({
  cloud_name: 'z7b9zsee',
  api_key: '269848439944243',
  api_secret: 'b6pVatqK80cXhF4M0-Dfr8GuTbg'
});

async function run() {
  try {
    const sampleImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    
    // 2. Upload an image
    console.log("Uploading sample image...");
    const uploadResult = await cloudinary.uploader.upload(sampleImageUrl, {
      public_id: 'sample_onboarding_test'
    });
    console.log("Upload Success!");
    console.log("Secure URL: " + uploadResult.secure_url);
    console.log("Public ID: " + uploadResult.public_id);
    
    // 3. Get image details
    console.log("\nFetching image metadata...");
    const details = await cloudinary.api.resource(uploadResult.public_id);
    console.log("Image Details:");
    console.log("- Width: " + details.width);
    console.log("- Height: " + details.height);
    console.log("- Format: " + details.format);
    console.log("- File Size (bytes): " + details.bytes);
    
    // 4. Transform the image
    // f_auto (fetch_format: 'auto'): Automatically selects the best format (WebP, AVIF, etc.) depending on the client browser.
    // q_auto (quality: 'auto'): Automatically optimizes the image quality and compression to reduce file size while maintaining visual fidelity.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto',
      secure: true
    });
    
    console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
    console.log("Transformed URL: " + transformedUrl);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

run();
