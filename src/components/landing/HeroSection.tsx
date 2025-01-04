import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ParticleNetwork } from '../three/ParticleNetwork';

export function HeroSection() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <ParticleNetwork />
      <div className="relative z-10 text-center px-4">
        <div className="flex justify-center mb-8">
          <Shield className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Guardian Mesh
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Advanced IoT Network Security Simulation Platform with real-time threat detection
          and automated response capabilities.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Launch Dashboard
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}