export const convertImageToJpeg = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image with white background (to handle transparency)
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Fill with white background to replace transparency
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Convert to Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to JPEG'));
            return;
          }

          // Create a new File object
          const convertedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '.jpg'),
            {
              type: 'image/jpeg',
              lastModified: Date.now(),
            },
          );

          resolve(convertedFile);
        },
        'image/jpeg',
        0.95,
      ); // 0.95 quality
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
