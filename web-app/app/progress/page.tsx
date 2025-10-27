'use client';

import { ChartBarIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline';

export default function ProgressPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="mt-2 text-lg text-gray-600">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-8 h-8" />
            <span className="text-sm font-medium">This Month</span>
          </div>
          <div className="text-3xl font-bold mb-1">24</div>
          <div className="text-sm opacity-90">Topics Completed</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrophyIcon className="w-8 h-8" />
            <span className="text-sm font-medium">Achievements</span>
          </div>
          <div className="text-3xl font-bold mb-1">12</div>
          <div className="text-sm opacity-90">Badges Earned</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FireIcon className="w-8 h-8" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <div className="text-3xl font-bold mb-1">7</div>
          <div className="text-sm opacity-90">Days in a Row</div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 Progress Tracking Coming Soon
          </h2>
          <p className="text-gray-700 mb-6">
            We&apos;re building a comprehensive progress tracking system with Firebase integration. 
            Soon you&apos;ll be able to see detailed analytics, set learning goals, and track your 
            improvement over time across all your devices.
          </p>
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            <span>In Development</span>
          </div>
        </div>
      </div>

      {/* Planned Features */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Planned Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Learning Analytics</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Category completion percentage</li>
              <li>• Time spent on each topic</li>
              <li>• Quiz scores and improvement trends</li>
              <li>• Weak areas identification</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Achievements & Badges</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• First week completed</li>
              <li>• All basic driving tasks mastered</li>
              <li>• 7-day learning streak</li>
              <li>• Perfect quiz scores</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Practice History</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Route recording statistics</li>
              <li>• Driving hours logged</li>
              <li>• Common mistakes tracked</li>
              <li>• Improvement recommendations</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Exam Readiness</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Overall readiness score</li>
              <li>• Predicted exam performance</li>
              <li>• Areas requiring more practice</li>
              <li>• Personalized study plan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
