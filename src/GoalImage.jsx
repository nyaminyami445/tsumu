import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

const frameStyle = {
  width: '100%',
  aspectRatio: '4 / 3',
  borderRadius: 8,
  display: 'block',
};

export default function GoalImage({ imageId, rate, achieved }) {
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

  const content = url ? (
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
  ) : (
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

  return (
    <div style={{ position: 'relative' }}>
      {content}
      {achieved && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 8,
          }}
        >
          <span
            style={{
              padding: '6px 18px',
              border: '3px solid #ffffff',
              borderRadius: 8,
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              transform: 'rotate(-8deg)',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            CLEAR!
          </span>
        </div>
      )}
    </div>
  );
}