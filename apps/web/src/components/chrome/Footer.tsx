import { Link } from 'react-router';
import { Data } from '../../primitives/Data.js';
import { socials } from '../../content/profile.js';

export function Footer() {
  return (
    <footer className="border-t border-line py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <nav aria-label="Elsewhere" className="flex flex-wrap gap-x-4 gap-y-1">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-[160ms] hover:text-accent-text"
            >
              <Data tone="fg">{social.label}</Data>
            </a>
          ))}
        </nav>

        <nav aria-label="More" className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/laugh" className="transition-colors duration-[160ms] hover:text-accent-text">
            <Data tone="fg">Laugh challenge</Data>
          </Link>
          <a
            href="https://github.com/mirzakhalov03"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-[160ms] hover:text-accent-text"
          >
            <Data tone="fg">Source</Data>
          </a>
        </nav>
      </div>

      {/* Computed, never typed — a hardcoded year is wrong within twelve months. */}
      <Data className="mt-6 block">© {new Date().getFullYear()} Javohirbek Mirzakhalov</Data>
    </footer>
  );
}
