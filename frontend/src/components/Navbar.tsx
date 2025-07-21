import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 py-4 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
          <h1 className="text-5xl md:text-2xl font-bold   bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Fledge
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 