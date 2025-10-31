'use client';

import { ChartBarIcon, TrophyIcon, FireIcon, SparklesIcon, AcademicCapIcon, RocketLaunchIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                <SparklesIcon className="mr-2 h-4 w-4" />
                Vision · Future Platform
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Future
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-gray-600">
                A comprehensive learning ecosystem integrating theory and practical training. 
                Seamlessly connect theoretical knowledge with hands-on driving practice to master 
                the complete German driving license journey.
              </p>
            </div>
            <div className="self-center rounded-xl border border-purple-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-sm text-gray-500">
                Building the ultimate one-stop platform: theory exam preparation meets real-world 
                practice tracking for complete exam readiness.
              </p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">

      {/* Coming Soon */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 The One-Stop Driving License Platform
          </h2>
          <p className="text-gray-700 mb-6">
            We&apos;re building an integrated ecosystem that connects theory exam preparation with practical 
            driving training. Soon you&apos;ll have access to official theory resources, AI-powered practice 
            route generation, comprehensive progress tracking, and personalized recommendations—all in one place.
          </p>
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            <span>In Development</span>
          </div>
        </div>
      </section>

      {/* Planned Features */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Planned Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <GlobeAltIcon className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Theory Exam Platform</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Integration with official TÜV/DEKRA theory resources</li>
              <li>• Thousands of practice questions and mock exams</li>
              <li>• Real-time progress tracking across all topics</li>
              <li>• Detailed explanations for every scenario</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Unified Analytics</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Theory progress synchronized with practical training</li>
              <li>• Weak areas identified across both domains</li>
              <li>• Adaptive recommendations for improvement</li>
              <li>• Cross-device progress synchronization</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrophyIcon className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Smart Practice Routes</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Routes tailored to theory gaps</li>
              <li>• Practice maneuvers linked to exam topics</li>
              <li>• Real-time feedback during driving</li>
              <li>• Heatmap of common mistake zones</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <FireIcon className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Exam Readiness Score</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Overall assessment of theory + practical readiness</li>
              <li>• Personalized timeline to exam readiness</li>
              <li>• Practice recommendations based on weaknesses</li>
              <li>• Confidence prediction for exam success</li>
            </ul>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
