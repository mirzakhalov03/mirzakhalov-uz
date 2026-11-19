import { useEffect, useRef } from 'react';
import { Data } from '../../primitives/Data.js';
import { ImagePlaceholder } from './ImagePlaceholder.js';
import type { Photo } from '../../content/types.js';

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}

/**
 * The one image viewer in the system, built the same way CommandPalette is —
 * a native <dialog> so the focus trap, the inert background and Esc are the
 * platform's job rather than ours.
 *
 * Deliberately plain: the image covers most of the viewport and the controls
 * are bare icons on the backdrop, the way a native photo viewer looks, rather
 * than a bordered plate nested inside another frame. `data-surface="void"` on
 * the dialog is what makes that work — every icon re-points to the dark
 * ground's palette for free, so they read against the dimmed backdrop without
 * a hand-picked colour.
 */
export function ImageLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (index === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onNavigate((index + 1) % photos.length);
      else if (event.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, photos.length, onNavigate]);

  const photo = index !== null ? photos[index] : undefined;

  return (
    <dialog
      ref={dialogRef}
      data-surface="void"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-label="Expanded photo"
      className="m-0 max-w-none bg-transparent p-0 backdrop:bg-[var(--shade)] backdrop:backdrop-blur-[2px] open:fixed open:inset-0 open:h-[100svh] open:w-full open:grid open:place-items-center"
    >
      {photo && index !== null ? (
        <>
          {photo.image ? (
            <img
              src={photo.image.url}
              alt={photo.image.alt}
              className="max-h-[88vh] max-w-[92vw] object-contain"
            />
          ) : (
            <ImagePlaceholder className="h-[70vh] w-[min(92vw,56rem)]" />
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-frame text-fg text-xl transition-colors hover:text-accent-text"
          >
            ×
          </button>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-frame text-fg transition-colors hover:text-accent-text sm:left-4"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate((index + 1) % photos.length)}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-frame text-fg transition-colors hover:text-accent-text sm:right-4"
              >
                <ChevronIcon direction="right" />
              </button>
              <Data tone="muted" className="absolute bottom-4 left-1/2 -translate-x-1/2">
                {index + 1} / {photos.length}
              </Data>
            </>
          ) : null}
        </>
      ) : null}
    </dialog>
  );
}
