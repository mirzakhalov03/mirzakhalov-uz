import { useState } from 'react';
import { ImagePlaceholder } from '../ui/ImagePlaceholder.js';
import { ImageLightbox } from '../ui/ImageLightbox.js';
import type { Photo } from '../../content/types.js';

function PortraitTile({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Expand photo"
      className={`overflow-hidden rounded-frame border border-line bg-well transition-colors hover:border-accent-text ${
        photo.featured ? 'col-span-2 row-span-2' : ''
      }`}
    >
      {photo.image ? (
        <img
          src={photo.image.url}
          alt={photo.image.alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: photo.image.position }}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImagePlaceholder className="h-full w-full" />
      )}
    </button>
  );
}

/**
 * A Google-Photos-style grid: dense packing so the smaller tiles fill in
 * beside the one `featured` cell instead of leaving a gap after it. Any
 * number of photos works — the mock set happens to carry six.
 */
export function PortraitGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-flow-row-dense grid-cols-2 auto-rows-[7rem] gap-2 sm:grid-cols-3 sm:auto-rows-[8rem]">
        {photos.map((photo, i) => (
          <PortraitTile key={i} photo={photo} onOpen={() => setOpenIndex(i)} />
        ))}
      </div>

      <ImageLightbox
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
