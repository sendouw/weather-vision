'use client';

export default function AnimatedLogo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="logo-hero group relative h-32 w-32 sm:h-36 sm:w-36">
        <div className="logo-sun" aria-hidden="true">
          <span className="logo-sun__core" />
          <span className="logo-sun__flare" />
        </div>
        <div className="logo-cloud" aria-hidden="true">
          <span className="logo-cloud__bump logo-cloud__bump--1" />
          <span className="logo-cloud__bump logo-cloud__bump--2" />
          <span className="logo-cloud__bump logo-cloud__bump--3" />
          <span className="logo-cloud__rain logo-cloud__rain--1" />
          <span className="logo-cloud__rain logo-cloud__rain--2" />
          <span className="logo-cloud__rain logo-cloud__rain--3" />
        </div>
      </div>
      <h1 className="logo-hero__wordmark text-center">Weather Vision</h1>
    </div>
  );
}
