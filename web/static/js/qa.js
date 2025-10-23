/**
 * Q&A Module - Handles the AI question-answer interface
 * 
 * Implementation: RAG-based Q&A with Google Gemini API (Cloud)
 * - Uses Google Cloud Gemini API for AI generation
 * - Simple keyword-based retrieval (no vector embeddings needed)
 * - All processing happens server-side for simplicity
 */
import { showLoading, showError, log, fadeIn, displayStructuredAnswer } from './utils.js';

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

    // Add visual status indicator for Google Gemini API
    setTimeout(() => {
        log('QA', 'Using Google Gemini API (Cloud) ☁️');
        
        const statusDiv = document.createElement('div');
        statusDiv.id = 'api-status-indicator';
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            background: #4285f4;
            color: white;
        `;
        
        statusDiv.innerHTML = '☁️ Google Gemini API';
        statusDiv.title = 'Using Google Gemini Pro API (Cloud-based)';
        
        document.body.appendChild(statusDiv);
    }, 500);

    // Handle form submission
    qaForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const question = questionInput.value.trim();
        
        if (!question) {
            log('QA', 'Empty question submitted');
            return;
        }

        log('QA', `Submitting question: ${question}`);

        // Use the new F1.1 RAG flow with Chrome Prompt API
        await getRuleAnalysisAndDisplay(question);
    });

    // Clear answer button
    clearButton.addEventListener('click', function() {
        log('QA', 'Clearing answer');
        answerBox.classList.add('hidden');
        questionInput.value = '';
    });

    log('QA', 'Q&A module initialized successfully');
}

/**
 * RAG-based Rule Analysis with Google Gemini API
 * 
 * This function implements a complete RAG (Retrieval-Augmented Generation) pipeline:
 * 
 * Step 1 (Retrieval): Call backend to get relevant knowledge chunks (keyword-based)
 * Step 2 (Augmentation + Generation): Backend calls Google Gemini API with context
 * Step 3 (Display): Show structured answer in the UI
 * 
 * @param {string} userQuery - The user's driving rule question
 * @returns {Promise<void>} - Displays result in the UI
 */
export async function getRuleAnalysisAndDisplay(userQuery) {
    log('QA', `[RAG] Starting analysis for: ${userQuery}`);
    
    const answerBox = document.getElementById('answer-box');
    const answerContent = document.getElementById('answer-content');
    
    // Show loading state
    answerBox.classList.remove('hidden');
    showLoading(answerContent);
    
    // ==========================================
    // Step 1: Retrieval - Get Knowledge Context
    // ==========================================
    let knowledgeContext = '';
    let contextChunks = [];
    
    try {
        log('QA', '[Step 1] Retrieving relevant knowledge...');
        const retrievalResponse = await fetch('/api/qa/retrieve_context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: userQuery, k: 5 }),
        });
        
        if (retrievalResponse.ok) {
            const data = await retrievalResponse.json();
            contextChunks = data.chunks || [];
            
            if (contextChunks.length > 0) {
                // Format context for Gemini API
                knowledgeContext = contextChunks.map((chunk, idx) => 
                    `[Knowledge ${idx + 1}]\nCategory: ${chunk.category}\nSubcategory: ${chunk.subcategory}\nContent: ${chunk.text}\nScore: ${chunk.score.toFixed(1)}`
                ).join('\n\n');
                
                log('QA', `[Step 1] Retrieved ${contextChunks.length} knowledge chunks`);
            } else {
                log('QA', '[Step 1] No relevant knowledge found');
                knowledgeContext = 'No specific knowledge found for this query.';
            }
        } else {
            throw new Error(`Retrieval failed: ${retrievalResponse.status}`);
        }
    } catch (error) {
        log('QA', `[Step 1] Retrieval error: ${error.message}`);
        knowledgeContext = 'Unable to retrieve knowledge context.';
    }
    
    // ==========================================
    // Step 2: Generation - Call Google Gemini API (via backend)
    // ==========================================
    try {
        log('QA', '[Step 2] Calling Google Gemini API...');
        
        const generationResponse = await fetch('/api/qa/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: userQuery,
                context: knowledgeContext 
            }),
        });
        
        if (generationResponse.ok) {
            const data = await generationResponse.json();
            const jsonAnswer = data.answer || {
                answer: data.text || 'No answer generated',
                explanation: '',
                examples: [],
                related_topics: []
            };
            
            log('QA', '[Step 2] Answer received from Google Gemini API ✅');
            displayStructuredAnswer(answerContent, jsonAnswer, false);
            
        } else {
            throw new Error(`API returned status ${generationResponse.status}`);
        }
        
    } catch (error) {
        log('QA', `[Step 2] Error: ${error.message}`);
        
        // Show error message
        let errorMsg = '❌ Error Generating Answer\n\n';
        errorMsg += `Error: ${error.message}\n\n`;
        errorMsg += '🔍 Possible causes:\n';
        errorMsg += '   • Google Gemini API key is invalid\n';
        errorMsg += '   • Network connection issue\n';
        errorMsg += '   • API quota exceeded\n';
        errorMsg += '   • Backend server error\n\n';
        errorMsg += '💡 Check the browser console and server logs for details';
        
        showError(answerContent, errorMsg);
    }
}

