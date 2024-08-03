import { ReactNode } from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Jokes App</title>
      </Head>
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl">Jokes App</h1>
      </header>
      <main className="p-4">
        {children}
      </main>
    </div>
  );
}
