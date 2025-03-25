'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Show a loading state
  if (status === 'loading') {
    return (
      <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-md"></div>
    );
  }

  // Show the user profile button if they're logged in
  if (session?.user) {
    return (
      <div className="relative">
        <button
          onClick={toggleMenu}
          className="flex items-center text-white hover:text-gray-200 transition-colors space-x-1"
        >
          <div className="flex items-center">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user?.name || 'User avatar'}
                width={32}
                height={32}
                className="rounded-full mr-2 border-2 border-white"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white text-navy flex items-center justify-center mr-2">
                {session.user?.name?.[0] || 'U'}
              </div>
            )}
            <span className="hidden md:inline font-medium">
              {session.user?.name?.split(' ')[0] || ''}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20 border border-gray-100">
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
              Signed in as <span className="font-medium text-navy">{session.user?.email || ''}</span>
            </div>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              Your Profile
            </Link>
            <Link
              href="/deals"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              Your Deals
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show sign-in button if not logged in
  return (
    <button
      onClick={() => signIn('google')}
      className="bg-white hover:bg-gray-100 text-navy px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="18px"
        height="18px"
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
      Sign in
    </button>
  );
}
