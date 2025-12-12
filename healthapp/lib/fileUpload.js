import cloudinary from './cloudinary';

export async function saveFile(file, folder = 'health-app') {
    if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Only image files are allowed.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            filename: result.secure_url, 
            originalName: file.name,
            size: result.bytes,
            type: result.format,
            publicId: result.public_id,
            resourceType: result.resource_type 
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteFile(publicId, resourceType = 'image') {
  if (!publicId) return false;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return false;
  }
}