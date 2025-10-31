'use client';

import { useState } from 'react';
import { useCategories } from '@/lib/hooks/use-content';
import Link from 'next/link';
import { ChevronRightIcon, SparklesIcon, PaperAirplaneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { apiClient, QAResponse } from '@/lib/api-client';

export default function LearnPage() {
  const { categories, isLoading, error } = useCategories();
  // Q&A widget state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<QAResponse | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  const qaExamples = [
    'What is Rechts vor Links?',
    'How to enter the Autobahn?',
    'Speed limit in 30 zone?',
    'What is Schulterblick?',
    'How to do parallel parking?',
  ];

  const handleQaSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!qaQuestion.trim() || qaLoading) return;
    setQaLoading(true);
    setQaError(null);
    try {
      const res = await apiClient.askQuestion(qaQuestion);
      setQaAnswer(res);
      setQaQuestion('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get answer';
      setQaError(msg);
    } finally {
      setQaLoading(false);
    }
  };

  // Simple in-memory saved links (per session)
  type SavedLink = { id: string; title: string; url: string };
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const addSavedLink = () => {
    if (!newLinkUrl.trim()) return;
    const link: SavedLink = {
      id: String(Date.now()),
      title: newLinkTitle.trim() || newLinkUrl.trim(),
      url: newLinkUrl.trim(),
    };
    setSavedLinks((prev) => [link, ...prev]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  const removeSavedLink = (id: string) => {
    setSavedLinks((prev) => prev.filter((l) => l.id !== id));
  };

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
            Ensure the Flask backend is running and reachable (default http://localhost:5000)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                <SparklesIcon className="mr-2 h-4 w-4" />
                Learn · Knowledge Hub
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Master German Driving Skills Step by Step
              </h1>
              {/* Subtitle removed per request */}
              <p className="mt-4 max-w-2xl text-lg text-gray-600">
                Access all necessary resources for your exam. Dive into official materials, discover community-vetted content (like top-rated videos and forums), and get instant clarity using our AI-powered Q&A.
              </p>
            </div>
            <div className="self-center rounded-xl border border-purple-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-sm text-gray-500">
                We blend official training with practical community insights. Find everything from structured lessons to real-world tips, ensuring you’re prepared for every scenario.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* AI Q&A Widget */}
        <section className="mb-10">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="mb-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">AI Q&A Assistant</h2>
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="mt-1 text-center text-gray-600">Ask anything about German driving rules and regulations</p>
            </div>
            <form onSubmit={handleQaSubmit}>
              <div className="flex items-start gap-4">
                <textarea
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Ask your question here... (e.g., What is the speed limit in a 30 zone?)"
                  className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={qaLoading}
                />
                <button
                  type="submit"
                  disabled={qaLoading || !qaQuestion.trim()}
                  className="flex-shrink-0 px-5 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {qaLoading ? 'Thinking…' : (
                    <span className="inline-flex items-center gap-2"><PaperAirplaneIcon className="w-5 h-5" />Ask</span>
                  )}
                </button>
              </div>
            </form>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {qaExamples.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQaQuestion(q)}
                    disabled={qaLoading}
                    className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            {qaError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{qaError}</div>
            )}
          </div>
          {qaAnswer && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-green-200 p-5">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Answer</h3>
                  <p className="text-sm text-gray-700">{typeof qaAnswer.answer === 'string' ? qaAnswer.answer : qaAnswer.answer.answer}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Official materials & top-rated videos */}
        <section className="mb-10">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">Official Materials & Top-rated Videos</h3>
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="mt-1 text-center text-gray-600">Curated official resources and community-loved videos to study smarter.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://www.youtube.com/@frag-den-fahrlehrer.de-fuh9633"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-200 hover:border-blue-300 transition-colors bg-gray-50 p-4"
              >
                <p className="text-sm font-semibold text-gray-900">YouTube: Frag den Fahrlehrer</p>
                <p className="mt-1 text-xs text-gray-600">Community top-rated channel for German driving tips.</p>
              </a>

              <a
                href="https://www.youtube.com/watch?v=JmFIgm8I-D8"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-200 hover:border-blue-300 transition-colors bg-gray-50 p-4"
              >
                <p className="text-sm font-semibold text-gray-900">YouTube Video: Schulterblick & 30-zone</p>
                <p className="mt-1 text-xs text-gray-600">A concise walkthrough of common exam topics.</p>
              </a>

              <a
                href="https://www.tuvsud.com/de-de/branchen/mobilitaet-und-automotive/fuehrerschein-und-pruefung/fuehrerschein-und-pruefung/rund-um-die-fuehrerscheinpruefung/praktische-fuehrerscheinpruefung"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-200 hover:border-blue-300 transition-colors bg-gray-50 p-4"
              >
                <p className="text-sm font-semibold text-gray-900">TÜV SÜD: Praktische Führerscheinprüfung</p>
                <p className="mt-1 text-xs text-gray-600">Official practical exam guidance and requirements.</p>
              </a>

              {/* Add your own link card */}
              <div className="sm:col-span-3 mt-2">
                {isAddingLink ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Title (optional)"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={addSavedLink}
                          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsAddingLink(false); setNewLinkTitle(''); setNewLinkUrl(''); }}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingLink(true)}
                    className="w-full rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600"
                  >
                    + Add your own resource link
                  </button>
                )}
              </div>

              {/* Render saved links */}
              {savedLinks.length > 0 && (
                <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  {savedLinks.map((link) => (
                    <div key={link.id} className="rounded-lg border border-gray-200 bg-white p-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-blue-700 hover:underline"
                      >
                        {link.title}
                      </a>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate">{link.url}</span>
                        <button
                          type="button"
                          onClick={() => removeSavedLink(link.id)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories Grid - 2 rows x 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories?.slice(0, 8).map((category) => (
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
      </main>
    </div>
  );
}
