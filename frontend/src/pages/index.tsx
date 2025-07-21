'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  LineChart, 
  ArrowRight,
  Wallet,
  Lock,
  Globe,
  HandCoins
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Scene() {
  return (
    <>
      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.5} />
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
      </Float>
    </>
  );
}

const features = [
  
  {
    name: 'Launch a Campaign',
    description: 'Launch your crowdfunding campaign with built-in price protection for your contributors.',
    icon: <Zap className="w-6 h-6" />,
    path: '/create',
  },
  {
    name: 'Make a difference',
    description: 'Monitor campaign progress, contributions, and price movements in real-time.',
    icon: <LineChart className="w-6 h-6" />,
    path: '/campaigns',
  },
  {
    name: 'FTSO Integration',
    description: 'Leverages Flare Time Series Oracle (FTSO) for real-time USD price feeds, ensuring accurate campaign funding goals.',
    icon: <Shield className="w-6 h-6" />,
    path: '/about',
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Three.js Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Scene />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div 
          style={{ y, opacity }}
          className="min-h-screen flex flex-col items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <HandCoins className="w-24 h-24 text-pink-100 mx-auto" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 pb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Fledge
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-2xl mx-auto">
            Smart Crowdfunding: USD Goals, FLR Contributions.<br/> Raise funds safely on <span className="text-pink-400 text-3xl font-bold">Flare   </span> with dynamic goal tracking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ConnectButton />
              <Link 
                href="/campaigns"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
              >
                Explore Campaigns
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-50 transition-colors"
              >
                Create Campaign
                <Zap className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div className="py-20 px-4 bg-white/90 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute -right-1/18 md:-top-1/10 top-1/40 w-[400px] h-[400px] transform rotate-18">
              <Image
                src="/f.png"
                alt="Flare Network"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="max-w-7xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 text-pink-600">Safe & Secure Crowdfunding</h2>
              <p className="text-xl text-gray-600">Transparent and dynamic crowdfunding secured by Blockchain Technology</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity" />
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-6 text-pink-600">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-pink-600">{feature.name}</h3>
                    <p className="text-gray-600 mb-6 flex-grow">{feature.description}</p>
                    <Link 
                      href={feature.path}
                      className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors px-4 py-2 rounded-full border border-pink-500 hover:bg-pink-50"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 px-4 bg-gradient-to-b from-white/90 to-pink-100/80 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Protected Value', value: '$1.2M+' },
                { label: 'Active Campaigns', value: '50+' },
                { label: 'Successful Refunds', value: '100%' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-pink-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-4 bg-gradient-to-b from-pink-100/80 to-white backdrop-blur-lg">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 text-pink-600">Ready to Start Your Campaign?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Create your campaign with built-in price protection and give your contributors peace of mind
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ConnectButton />
                <Link 
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                >
                  Create Campaign
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* GitHub Section */}
        <div className="py-12 px-4 bg-gradient-to-b from-white to-pink-50 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-600">Built by </h2>
              <a 
                href="https://github.com/x-maues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Maues
              </a>
            </motion.div>
          </div>
        </div>

        {/* Network Information Footer */}
        <div className="py-12 px-4 bg-gradient-to-b from-pink-50 to-white backdrop-blur-lg">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-8 text-gray-600">Network Information</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-pink-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-pink-600 mb-2">Network</h3>
                  <p className="text-gray-600">Coston2 Testnet</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-pink-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-pink-600 mb-2">RPC URL</h3>
                  <p className="text-gray-600 break-all">https://coston2-api.flare.network/ext/C/rpc</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-pink-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-pink-600 mb-2">Factory Contract</h3>
                  <p className="text-gray-600 break-all">0xc1EAF17ebCD0ef0287E67f992a892A4e727e96c3</p>
                </div>
              </div>
              <div className="mt-8 text-sm text-gray-500">
                <p>Make sure to connect to the correct network to interact with the platform</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}