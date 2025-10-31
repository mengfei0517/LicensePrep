'use client';

import { use } from 'react';
import { useCategory } from '@/lib/hooks/use-content';
import Link from 'next/link';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function CategoryPage({ 
  params 
}: { 
  params: Promise<{ categoryId: string }> 
}) {
  const { categoryId } = use(params);
  const { category, isLoading, error } = useCategory(categoryId);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/learn"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Categories
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900">Category Not Found</h2>
          <p className="text-red-700 mt-2">{error?.message || 'This category does not exist'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        href="/learn"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Categories
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {category.name}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          {category.description}
        </p>
      </div>

      {/* Subcategories List */}
      <div className="space-y-4">
        {category.subcategories?.map((subcategory, index) => (
          <Link
            key={subcategory.id}
            href={`/learn/${categoryId}/${subcategory.id}`}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-6 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {subcategory.name}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 ml-11">
                  {subcategory.description}
                </p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {(!category.subcategories || category.subcategories.length === 0) && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No subcategories available</p>
        </div>
      )}
    </div>
  );
}

