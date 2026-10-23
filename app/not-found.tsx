'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-neutral-400 mb-4">Could not find requested resource</p>
      <Link
        href="/"
        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
