'use client';

import { use } from 'react';
import { useSubcategory } from '@/lib/hooks/use-content';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SubcategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string; subcategoryId: string }>;
}) {
  const { categoryId, subcategoryId } = use(params);
  const { subcategory, isLoading, error } = useSubcategory(categoryId, subcategoryId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subcategory) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/learn/${categoryId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Category
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900">Content Not Found</h2>
          <p className="text-red-700 mt-2">
            {error?.message || 'This content does not exist'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/learn" className="hover:text-gray-900">
          Learn
        </Link>
        <span>/</span>
        <Link href={`/learn/${categoryId}`} className="hover:text-gray-900">
          {subcategory.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{subcategory.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{subcategory.name}</h1>
        {subcategory.description && (
          <p className="mt-2 text-lg text-gray-600">{subcategory.description}</p>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {subcategory.content?.map((item, index) => (
            <div key={index}>
              {item.type === 'text' && (
                <p className="text-gray-700 leading-relaxed">{item.content}</p>
              )}

              {item.type === 'image' && item.url && (
                <div className="rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={item.url}
                    alt={`Illustration ${index + 1}`}
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,%3Csvg width="800" height="450" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="800" height="450" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="18" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </div>
              )}

              {item.type === 'list' && item.items && (
                <ul className="space-y-2 ml-6 list-disc text-gray-700">
                  {item.items.map((listItem, i) => (
                    <li key={i} className="leading-relaxed">
                      {listItem}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {(!subcategory.content || subcategory.content.length === 0) && (
            <p className="text-gray-500 text-center py-12">
              No content available for this topic yet.
            </p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Link
          href={`/learn/${categoryId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to {subcategory.category.name}
        </Link>

        <Link
          href="/qa"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Ask AI about this topic
        </Link>
      </div>
    </div>
  );
}

