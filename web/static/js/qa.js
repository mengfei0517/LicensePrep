/**
 * Q&A Module - Handles the AI question-answer interface
 */
import { showLoading, showError, log, fadeIn } from './utils.js';

export function initQA() {
    log('QA', 'Initializing Q&A module...');

    const qaForm = document.getElementById('qa-form');
    const questionInput = document.getElementById('question');
    const answerBox = document.getElementById('answer-box');
    const answerContent = document.getElementById('answer-content');
    const clearButton = document.getElementById('clear-answer');

    if (!qaForm || !questionInput || !answerBox || !answerContent || !clearButton) {
        log('QA', 'Warning: Q&A elements not found on this page. Skipping initialization.');
        return;
    }

    // Handle form submission
    qaForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const question = questionInput.value.trim();
        
        if (!question) {
            log('QA', 'Empty question submitted');
            return;
        }

        log('QA', `Submitting question: ${question}`);

        // Show answer box with loading state
        answerBox.classList.remove('hidden');
        showLoading(answerContent);

        try {
            const response = await fetch('/api/qa/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            const data = await response.json();
            
            if (response.ok) {
                log('QA', 'Answer received successfully');
                answerContent.innerHTML = `<p>${data.answer || 'No answer received.'}</p>`;
                fadeIn(answerContent);
            } else {
                log('QA', `Error response: ${data.error}`);
                showError(answerContent, data.error || 'Failed to get answer.');
            }
        } catch (error) {
            log('QA', `Network error: ${error.message}`);
            showError(answerContent, `Network error: ${error.message}`);
        }
    });

    // Clear answer button
    clearButton.addEventListener('click', function() {
        log('QA', 'Clearing answer');
        answerBox.classList.add('hidden');
        questionInput.value = '';
    });

    log('QA', 'Q&A module initialized successfully');
}

