import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

const frameStyle = {
  width: '100%',
  aspectRatio: '4 / 3',
  borderRadius: 8,
  display: 'block',
};

export default function GoalImage({ imageId, rate }) {
  const image = useLiveQuery(
    () => (imageId ? db.images.get(imageId) : undefined),
    [imageId]
  );
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!image) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image.data);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  if (!url) {
    return (
      <div
        style={{
          ...frameStyle,
          background: '#eeeeee',
          color: '#888888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        画像なし
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      style={{
        ...frameStyle,
        objectFit: 'cover',
        filter: `grayscale(${1 - rate / 100})`,
        transition: 'filter 0.6s',
      }}
    />
  );
}