export function Portrait({ className = '' }: { className?: string }) {
  return (
    <div className={`portrait ${className}`}>
      <div className="portrait__ring" aria-hidden="true" />
      <img
        className="portrait__photo"
        src="/brand/profile-sketchhd.png"
        alt="Javohirbek Mirzakhalov"
        width={450}
        height={450}
        loading="eager"
      />
    </div>
  );
}
