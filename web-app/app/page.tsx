'use client';

import Link from 'next/link';
import { 
  AcademicCapIcon, 
  ChatBubbleBottomCenterTextIcon,
  MapPinIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const previewSections = [
  {
    title: 'Diverse Learning Ecosystem',
    description:
      'AI-integrated learning. Open-source resources. Structured knowledge architecture.',
    icon: AcademicCapIcon,
    href: '/learn',
    iconClass: 'text-blue-600',
  },
  {
    title: 'Core Functionality: Practice Analysis',
    description:
      'Solve review inefficiency. Route RRA: Record, Review, Analyze. Precise mistake identification.',
    icon: MapPinIcon,
    href: '/routes',
    iconClass: 'text-emerald-600',
  },
  {
    title: 'Exam Simulation & Prediction',
    description:
      'Personalized exam simulation. Predictive route paths. Full test readiness.',
    icon: ChartBarIcon,
    href: '/simulate',
    iconClass: 'text-purple-600',
  },
  {
    title: 'Future Vision: One-Stop Service',
    description:
      'Future goal: Complete one-stop service. Integrated theoretical exam prep.',
    icon: ChatBubbleBottomCenterTextIcon,
    href: '/progress',
    iconClass: 'text-gray-700',
  },
];

// Stats removed from UI; keeping UI minimal in preview card

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
              FahrerLab is an AI-driven system designed to optimize your practice and efficiently acquire the skills needed for your German driving license.
            </p>
            
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/learn"
                className="rounded-md border border-blue-300 bg-blue-50 px-6 py-3 text-base font-semibold text-blue-700 shadow-sm hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Start Learning
              </Link>
              <Link
                href="/routes"
                className="text-base font-semibold leading-6 text-gray-900"
              >
                Try route record and review <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              {/* Dashboard Preview: inline snapshot of key content */}
              <div className="w-[48rem] rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10 p-6 -ml-[1cm]">
                {/* Slogan */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-blue-900 text-center shadow-sm">
                  <p className="text-lg sm:text-xl font-bold italic leading-8 tracking-tight">
                    Better tools drive efficiency, saving class time. If one reviewed double lesson nets you €100+, what is your total ROI?
                  </p>
                </div>

                {/* Headline & subtext */}
                <div className="mt-6">
                  <h3 className="text-xs font-semibold leading-6 text-blue-600">Learn Smarter</h3>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                   Hybrid AI Platform for German Driving Test Preparation
                  </p>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                  Our hybrid AI platform delivers a complete learning ecosystem: Use the Web App for deep analysis, the Mobile App to record and practice on the go, and the Chrome Extension for instant, AI-powered Q&A across the web.
                  </p>
                </div>

                {/* Feature cards preview (updated content with white-background simple icons) */}
                <div className="mt-6">
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                    {previewSections.map((section) => (
                      <div key={`preview-${section.title}`} className="rounded-lg border border-gray-100 p-4">
                        <dt className="flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-900">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200">
                            <section.icon className={`h-5 w-5 ${section.iconClass}`} aria-hidden="true" />
                          </div>
                          {section.title}
                        </dt>
                        <dd className="mt-2 text-sm leading-6 text-gray-600">
                          {section.description}
                          <div className="mt-3">
                            <Link href={section.href} className="text-sm font-semibold leading-6 text-blue-600">
                              Learn more <span aria-hidden="true">→</span>
                            </Link>
                          </div>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Removed original Stats and Features sections (now previewed in the Dashboard card) */}

      {/* Multi-Platform section removed per request */}
    </div>
  );
}
