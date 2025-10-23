'use client';

import { useCategories } from '@/lib/hooks/use-content';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function LearnPage() {
  const { categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Categories
          </h2>
          <p className="text-red-700">
            {error.message || 'Failed to load learning categories'}
          </p>
          <p className="text-sm text-red-600 mt-2">
            Make sure the Flask backend is running on http://localhost:5000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Learning Categories
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Master German driving skills step by step
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/learn/${category.id}`}
            className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
          >
            {/* Image */}
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml,%3Csvg width="400" height="225" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="225" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dy=".3em"%3E${encodeURIComponent(category.id)}%3C/text%3E%3C/svg%3E`;
                }}
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {category.description}
              </p>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {category.subcategories_count || category.subcategories?.length || 0} topics
                </span>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {categories && categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No categories available</p>
        </div>
      )}
    </div>
  );
}

