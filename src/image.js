const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_SIDE = 1200;

export async function processImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('JPEG・PNG・WebPの画像を選んでください');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('画像は5MB以下にしてください');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('画像を読み込めませんでした。壊れている可能性があります');
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.85)
  );
  if (!blob) {
    throw new Error('画像の変換に失敗しました');
  }

  return { data: blob, mimeType: 'image/jpeg', width, height };
}