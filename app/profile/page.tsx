'use client';

import { useSession } from 'next-auth/react';
import React from 'react';
import Header from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-navy"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    // This should be handled by the middleware, but just in case
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-navy to-seaBlue p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
            <p className="text-white/80">Manage your account and investment preferences</p>
          </div>

          <div className="p-8">
            <div className="flex items-center space-x-6 mb-8">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user?.name || 'User avatar'}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-navy h-24 w-24"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-navy text-white flex items-center justify-center text-xl font-bold">
                  {session?.user?.name?.[0] || 'U'}
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-800">{session?.user?.name || 'User'}</h2>
                <p className="text-gray-600">{session?.user?.email || ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-navy">Account Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="font-medium text-gray-800">{session?.user?.email || ''}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Name</dt>
                    <dd className="font-medium text-gray-800">{session?.user?.name || ''}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Account Type</dt>
                    <dd className="font-medium text-gray-800">Google Account</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-navy">Your Activity</h3>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Total Deals</span>
                    <Link
                      href="/deals"
                      className="bg-navy/10 text-navy px-3 py-1 rounded-full text-sm font-medium"
                    >
                      View All Deals
                    </Link>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Last Login</span>
                    <span className="text-gray-800 text-sm">{new Date().toLocaleDateString()}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-navy text-white rounded-md font-medium text-center transition-colors hover:bg-navy/90"
              >
                Create New Deal
              </Link>

              <Link
                href="/deals"
                className="px-6 py-3 border border-navy text-navy bg-white rounded-md font-medium text-center transition-colors hover:bg-navy/5"
              >
                View Your Deals
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
