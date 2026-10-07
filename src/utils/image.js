import { Platform } from 'react-native';

export const canUpload = Platform.OS === 'web';

/**
 * Pilih gambar dari perangkat (web) lalu kecilkan jadi JPEG data-URI,
 * supaya muat disimpan di Blob tanpa storage tambahan.
 */
export function pickImage(maxSize = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!canUpload) {
      reject(new Error('Unggah gambar hanya tersedia di web. Gunakan URL gambar.'));
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.onload = () => {
        const img = new window.Image();
        img.onerror = () => reject(new Error('File bukan gambar yang valid.'));
        img.onload = () => {
          const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
