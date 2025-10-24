'use client';

import { useState } from 'react';
import { apiClient, QAResponse } from '@/lib/api-client';
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface QAHistory {
  id: string;
  question: string;
  answer: QAResponse;
  timestamp: Date;
}

export default function QAPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<QAResponse | null>(null);
  const [history, setHistory] = useState<QAHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const exampleQuestions = [
    "What is Rechts vor Links?",
    "How to enter the Autobahn?",
    "Speed limit in 30 zone?",
    "What is Schulterblick?",
    "How to do parallel parking?",
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const answer = await apiClient.askQuestion(question);
      setCurrentAnswer(answer);
      
      // Add to history
      setHistory(prev => [
        {
          id: Date.now().toString(),
          question,
          answer,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      setQuestion('');
    } catch (err: any) {
      setError(err.message || 'Failed to get answer');
      console.error('Q&A Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const askExample = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
  };

  const formatAnswer = (answer: QAResponse['answer']) => {
    if (typeof answer === 'string') {
      return answer;
    }
    return answer.answer;
  };

  const getStructuredAnswer = (answer: QAResponse['answer']) => {
    if (typeof answer === 'string') {
      return null;
    }
    return answer;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <SparklesIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          AI Q&A Assistant
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Ask anything about German driving rules and regulations
        </p>
      </div>

      {/* Question Input */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your question here... (e.g., What is the speed limit in a 30 zone?)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className={clsx(
                "flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-colors",
                loading || !question.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Ask</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Example Questions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((example, index) => (
              <button
                key={index}
                onClick={() => askExample(example)}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-900 font-semibold">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              Ensure the Flask backend is running and reachable (default http://localhost:5000)
            </p>
          </div>
        )}
      </div>

      {/* Current Answer */}
      {currentAnswer && (
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6 mb-8">
          <div className="flex items-start space-x-3 mb-4">
            <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Answer</h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{formatAnswer(currentAnswer.answer)}</p>
                
                {getStructuredAnswer(currentAnswer.answer) && (
                  <div className="mt-4 space-y-4">
                    {getStructuredAnswer(currentAnswer.answer)!.explanation && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Explanation:</h4>
                        <p>{getStructuredAnswer(currentAnswer.answer)!.explanation}</p>
                      </div>
                    )}
                    
                    {getStructuredAnswer(currentAnswer.answer)!.examples && 
                     getStructuredAnswer(currentAnswer.answer)!.examples!.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Examples:</h4>
                        <ul className="list-disc pl-5">
                          {getStructuredAnswer(currentAnswer.answer)!.examples!.map((ex, i) => (
                            <li key={i}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span className="inline-flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-1" />
                  Powered by {currentAnswer.source}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Questions</h2>
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900">{item.question}</p>
                  <span className="flex items-center text-xs text-gray-500 ml-4">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {formatAnswer(item.answer.answer)}
                </p>
                <button
                  onClick={() => setCurrentAnswer(item.answer)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  View full answer →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
