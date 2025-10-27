'use client';

import Link from 'next/link';
import { 
  AcademicCapIcon, 
  ChatBubbleBottomCenterTextIcon,
  MapPinIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'AI Q&A Assistant',
    description: 'Ask any question about German driving rules and get instant AI-powered answers.',
    icon: ChatBubbleBottomCenterTextIcon,
    href: '/qa',
    color: 'bg-blue-500',
  },
  {
    name: 'Interactive Learning',
    description: 'Learn all driving categories from basic skills to Autobahn driving.',
    icon: AcademicCapIcon,
    href: '/learn',
    color: 'bg-green-500',
  },
  {
    name: 'Route Recording & Review',
    description: 'Capture GPS routes from your practice drives and review every moment with voice notes.',
    icon: MapPinIcon,
    href: '/routes',
    color: 'bg-orange-500',
  },
  {
    name: 'Exam Simulation',
    description: 'Experience full-length theory and practical simulations with instant performance feedback.',
    icon: ChartBarIcon,
    href: '/simulate',
    color: 'bg-purple-500',
  },
];

const stats = [
  { label: 'Learning Categories', value: '8' },
  { label: 'Practice Areas', value: '42+' },
  { label: 'AI-Powered', value: '100%' },
  { label: 'Free to Use', value: 'Yes' },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="mt-6 sm:mt-10">
              <div className="inline-flex space-x-6">
                <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm font-semibold leading-6 text-blue-600 ring-1 ring-inset ring-blue-600/10">
                  🎉 Now with AI-powered learning
                </span>
              </div>
            </div>
            
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Master Your German Driving Test
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-600">
              LicensePrep is your AI-powered companion for German driving test preparation. 
              Learn at your own pace, get instant answers, record practice routes, and track your progress.
            </p>
            
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/learn"
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Start Learning
              </Link>
              <Link
                href="/qa"
                className="text-base font-semibold leading-6 text-gray-900"
              >
                Try AI Q&A <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                src="/hero-placeholder.svg"
                alt="LicensePrep Dashboard"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-gray-900/10"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="800" height="600" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="800" height="600" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EDashboard Preview%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-y-4">
              <dt className="text-base leading-7 text-gray-600">{stat.label}</dt>
              <dd className="text-5xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Learn Smarter</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to pass your driving test
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our hybrid AI platform combines web, mobile, and Chrome extension 
            to give you the best learning experience anywhere.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <Link
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-blue-600"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Multi-Platform Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-4">
                <DevicePhoneMobileIcon className="h-12 w-12 text-blue-600" />
                <SparklesIcon className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <h2 className="text-base font-semibold leading-7 text-blue-600">Hybrid AI Platform</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Learn anywhere, anytime
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              <strong className="font-semibold">Web App:</strong> Full-featured learning and analysis platform
              <br />
              <strong className="font-semibold">Mobile App:</strong> Record routes and practice on the go
              <br />
              <strong className="font-semibold">Chrome Extension:</strong> AI-powered Q&A anywhere on the web
            </p>
            <div className="mt-10">
              <Link
                href="/learn"
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
