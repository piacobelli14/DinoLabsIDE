import React, { useState, useEffect } from 'react';

function DinoLabsIDEMedia({ fileHandle }) {
  const [url, setUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  useEffect(() => {
    let objectUrl;

    const loadMedia = async () => {
      try {
        const file = await fileHandle.getFile();
        objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);

        const extension = file.name.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'].includes(extension)) {
          setMediaType('image');
        } else if (['mp4', 'mkv', 'avi', 'mov'].includes(extension)) {
          setMediaType('video');
        } else if (['mp3', 'wav', 'flac'].includes(extension)) {
          setMediaType('audio');
        }
      } catch (e) {
        console.error('Failed to load media:', e);
      }
    };

    loadMedia();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileHandle]);

  if (!url) return <div>Loading media...</div>;

  if (mediaType === 'image') {
    return <img src={url} alt="Media content" style={{ maxWidth: '100%', height: 'auto' }} />;
  } else if (mediaType === 'video') {
    return <video src={url} controls style={{ maxWidth: '100%', height: 'auto' }} />;
  } else if (mediaType === 'audio') {
    return <audio src={url} controls />;
  }

  return <div>Unsupported media type.</div>;
}

export default DinoLabsIDEMedia;
