/**
 * Q&A Module - Handles the AI question-answer interface
 * 
 * F1.1 Implementation: RAG-based Q&A with Chrome Prompt API
 * - NFR4.1 (Privacy): Prompt API calls execute client-side
 * - NFR4.2 (Network Resilience): Graceful degradation when backend is unavailable
 * - NFR4.5 (Origin Trial): Requires Chrome Prompt API Origin Trial token
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

    // Expose API diagnostic tool to console
    window.checkPromptAPI = async function() {
        console.log('\n🔍 Chrome Prompt API Diagnostic Report');
        console.log('=====================================');
        console.log('📍 Current URL:', window.location.href);
        console.log('🔒 Secure Context:', window.isSecureContext ? '✅ YES' : '❌ NO');
        console.log('🤖 window.ai:', window.ai ? '✅ Exists' : '❌ Undefined');
        console.log('🧠 languageModel:', window.ai?.languageModel ? '✅ Available' : '❌ Not Available');
        
        // Try to create a session
        if (window.ai && window.ai.languageModel) {
            console.log('\n🧪 Testing API creation...');
            try {
                const session = await window.ai.languageModel.create();
                console.log('✅ Session created successfully!');
                console.log('🎉 Chrome Prompt API is FULLY FUNCTIONAL');
                
                // Test a simple prompt
                console.log('\n🧪 Testing simple prompt...');
                const response = await session.prompt('Say "API is working"');
                console.log('✅ Response:', response);
                
                return {
                    status: 'fully_functional',
                    hasAI: true,
                    hasLanguageModel: true,
                    canCreateSession: true,
                    canPrompt: true
                };
            } catch (error) {
                console.log('❌ Session creation failed:', error.message);
                console.log('\n💡 Possible reasons:');
                console.log('   • Model still downloading (check chrome://components/)');
                console.log('   • Insufficient system resources');
                console.log('   • API not fully initialized yet');
                
                return {
                    status: 'api_exists_but_not_ready',
                    hasAI: true,
                    hasLanguageModel: true,
                    canCreateSession: false,
                    error: error.message
                };
            }
        }
        
        console.log('\n💡 Recommendations:');
        if (!window.isSecureContext) {
            console.log('   ⚠️ NOT a secure context!');
            if (window.location.href.includes('127.0.0.1')) {
                console.log('   → Switch to http://localhost:5000/');
            } else {
                console.log('   → Use HTTPS or localhost');
            }
        }
        if (!window.ai) {
            console.log('   ⚠️ Chrome Prompt API not enabled!');
            console.log('   → Use Chrome Dev/Canary (not stable Chrome)');
            console.log('   → Enable chrome://flags/#prompt-api-for-gemini-nano');
            console.log('   → Enable chrome://flags/#optimization-guide-on-device-model');
            console.log('   → Restart Chrome COMPLETELY (close all windows)');
            console.log('   → Check chrome://components/ for "Optimization Guide On Device Model"');
        }
        console.log('=====================================\n');
        
        return {
            status: 'not_available',
            hasAI: !!window.ai,
            hasLanguageModel: !!(window.ai && window.ai.languageModel),
            canCreateSession: false
        };
    };
    
    // Run diagnostic on page load and show status
    setTimeout(async () => {
        log('QA', 'Chrome Prompt API Status: ' + (window.ai ? 'Available ✅' : 'Not Available ❌'));
        
        // Add visual status indicator
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
            cursor: pointer;
        `;
        
        if (window.ai && window.ai.languageModel) {
            // Test if it actually works
            try {
                const testSession = await window.ai.languageModel.create();
                await testSession.prompt('test');
                statusDiv.style.background = '#27ae60';
                statusDiv.style.color = 'white';
                statusDiv.innerHTML = '🤖 Chrome AI: Ready';
                statusDiv.title = 'Chrome Prompt API is fully functional. Click for details.';
                log('QA', '🎉 Chrome Prompt API is FULLY FUNCTIONAL');
            } catch (e) {
                statusDiv.style.background = '#f39c12';
                statusDiv.style.color = 'white';
                statusDiv.innerHTML = '⏳ Chrome AI: Loading...';
                statusDiv.title = 'API detected but model may still be downloading. Click for details.';
                log('QA', '⏳ Chrome Prompt API detected but not ready:', e.message);
            }
        } else {
            statusDiv.style.background = '#e74c3c';
            statusDiv.style.color = 'white';
            statusDiv.innerHTML = '❌ Chrome AI: Unavailable';
            statusDiv.title = 'Chrome Prompt API not available. Using server fallback. Click for details.';
            log('QA', '💡 Run checkPromptAPI() in console for detailed diagnostic');
        }
        
        statusDiv.onclick = () => {
            console.clear();
            checkPromptAPI();
        };
        
        document.body.appendChild(statusDiv);
    }, 1000);

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
 * F1.1 Core Function: RAG-based Rule Analysis with Chrome Prompt API
 * 
 * This function implements a complete RAG (Retrieval-Augmented Generation) pipeline:
 * 
 * Step 1 (Retrieval): Call backend /api/retrieve_context to get Knowledge Hub chunks
 * Step 2 (Augmentation): Combine retrieved context with user query into a structured prompt
 * Step 3 (Generation): Use Chrome Prompt API to generate structured JSON answer
 * 
 * NFR Compliance:
 * - NFR4.1 (Privacy): All AI inference happens client-side via Chrome Prompt API
 * - NFR4.2 (Network Resilience): Falls back to pure Prompt API (no context) if backend fails
 * - NFR4.5 (Origin Trial): IMPORTANT - Chrome Prompt API requires Origin Trial enrollment
 *                          Visit https://developer.chrome.com/origintrials/ to register
 * 
 * @param {string} userQuery - The user's driving rule question
 * @returns {Promise<void>} - Displays result in the UI
 */
export async function getRuleAnalysisAndDisplay(userQuery) {
    log('QA', `[F1.1] Starting RAG analysis for: ${userQuery}`);
    
    const answerBox = document.getElementById('answer-box');
    const answerContent = document.getElementById('answer-content');
    
    // Show loading state
    answerBox.classList.remove('hidden');
    showLoading(answerContent);
    
    let knowledgeContext = '';
    let isOffline = false;
    
    // ==========================================
    // Step 1: Retrieval - Get Knowledge Context
    // ==========================================
    try {
        log('QA', '[F1.1 Step 1] Retrieving context from Knowledge Hub...');
        const response = await fetch('/api/qa/retrieve_context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: userQuery, k: 5 }),
        });
        
        if (response.ok) {
            const data = await response.json();
            const chunks = data.chunks || [];
            
            if (chunks.length > 0) {
                // Format context for the prompt
                knowledgeContext = chunks.map((chunk, idx) => 
                    `[Knowledge Chunk ${idx + 1}]\nCategory: ${chunk.category}\nSubcategory: ${chunk.subcategory}\nRelevance: ${chunk.score.toFixed(3)}`
                ).join('\n\n');
                
                log('QA', `[F1.1 Step 1] Retrieved ${chunks.length} context chunks`);
            } else {
                log('QA', '[F1.1 Step 1] No context chunks found');
            }
        } else {
            throw new Error(`Backend returned status ${response.status}`);
        }
    } catch (error) {
        // NFR4.2: Network Resilience - Graceful degradation
        log('QA', `[F1.1 Step 1] Context retrieval failed: ${error.message}`);
        log('QA', '[F1.1 NFR4.2] Falling back to pure Prompt API (no context)');
        isOffline = true;
        knowledgeContext = 'No knowledge base context available (offline mode)';
    }
    
    // ==========================================
    // Step 2: Augmentation - Build Structured Prompt
    // ==========================================
    log('QA', '[F1.1 Step 2] Building structured prompt...');
    
    const systemInstruction = `You are an authoritative German driving instructor. Answer the user's question based on the [Knowledge Context] provided below.

Important requirements:
1. Return results strictly in JSON format
2. JSON must include the following fields:
   - "answer": A concise and clear answer (2-3 sentences)
   - "explanation": Detailed explanation (optional)
   - "examples": Array of practical examples (optional)
   - "related_topics": Array of related topics (optional)

3. Use only the information from the knowledge context below as your sole knowledge source
4. If no relevant information is found in the knowledge base, state this honestly`;

    const contextSection = `=== Knowledge Context ===
${knowledgeContext}
========================`;

    const userSection = `User Query: ${userQuery}

Please answer the above question in JSON format.`;

    const fullPrompt = `${systemInstruction}\n\n${contextSection}\n\n${userSection}`;
    
    log('QA', `[F1.1 Step 2] Prompt built (length: ${fullPrompt.length} chars)`);
    
    // ==========================================
    // Step 3: Generation - Try Chrome API, fallback to Server
    // ==========================================
    
    // Check if Chrome Prompt API is available
    const hasChromeAPI = !!(window.ai && window.ai.languageModel);
    
    if (!hasChromeAPI) {
        log('QA', '[F1.1 Step 3] Chrome Prompt API not available, using server-side fallback...');
        
        // Fallback to server-side generation
        try {
            const response = await fetch('/api/qa/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query: userQuery,
                    context: knowledgeContext 
                }),
            });
            
            if (response.ok) {
                const data = await response.json();
                const jsonAnswer = data.answer || {
                    answer: data.text || 'No answer generated',
                    explanation: '',
                    examples: [],
                    related_topics: []
                };
                
                log('QA', '[F1.1] Server-side answer received');
                displayStructuredAnswer(answerContent, jsonAnswer, isOffline);
                return;
            } else {
                throw new Error(`Server returned status ${response.status}`);
            }
        } catch (serverError) {
            log('QA', `[F1.1] Server fallback failed: ${serverError.message}`);
            
            // Show detailed diagnostic
            const currentURL = window.location.href;
            let errorMsg = '⚠️ Both Chrome API and Server LLM are unavailable.\n\n';
            errorMsg += '📊 Current Status:\n';
            errorMsg += `   • URL: ${currentURL}\n`;
            errorMsg += `   • Secure Context: ${window.isSecureContext ? '✅ YES' : '❌ NO'}\n`;
            errorMsg += `   • Chrome API: ❌ Not Available\n`;
            errorMsg += `   • Server LLM: ❌ ${serverError.message}\n\n`;
            
            errorMsg += '🔧 To Enable Chrome API:\n';
            errorMsg += '   1. Use Chrome Canary (version ≥ 121)\n';
            errorMsg += '   2. Enable: chrome://flags/#prompt-api-for-gemini-nano\n';
            errorMsg += '   3. Restart Chrome completely\n';
            errorMsg += '   4. Check: chrome://components/ for Gemini Nano model\n\n';
            
            errorMsg += '🔧 To Enable Server LLM:\n';
            errorMsg += '   1. Set NIM_LLM_ENDPOINT in .env file\n';
            errorMsg += '   2. Restart Flask server\n\n';
            
            errorMsg += '💡 Quick Test: Run in console:\n';
            errorMsg += '   checkPromptAPI()';
            
            showError(answerContent, errorMsg);
            return;
        }
    }
    
    // Use Chrome Prompt API (preferred)
    try {
        log('QA', '[F1.1 Step 3] Using Chrome Prompt API...');
        
        // Create a session with the Chrome Prompt API
        const session = await window.ai.languageModel.create({
            temperature: 0.3,
            topK: 3,
        });
        
        log('QA', '[F1.1 Step 3] Session created, generating response...');
        
        // Generate the response
        const rawResponse = await session.prompt(fullPrompt);
        log('QA', `[F1.1 Step 3] Received response from Prompt API`);
        
        // Parse JSON response
        let jsonAnswer;
        try {
            // Try to extract JSON from the response
            const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonAnswer = JSON.parse(jsonMatch[0]);
            } else {
                // If no JSON found, create a simple structure
                jsonAnswer = {
                    answer: rawResponse,
                    explanation: '',
                    examples: [],
                    related_topics: []
                };
            }
        } catch (parseError) {
            log('QA', `[F1.1 Step 3] JSON parsing failed, using raw response`);
            jsonAnswer = {
                answer: rawResponse,
                explanation: '',
                examples: [],
                related_topics: []
            };
        }
        
        // Display the structured answer
        log('QA', '[F1.1] Displaying structured answer');
        displayStructuredAnswer(answerContent, jsonAnswer, isOffline);
        
    } catch (error) {
        log('QA', `[F1.1 Step 3] Chrome Prompt API error: ${error.message}`);
        showError(answerContent, `Chrome Prompt API Error:\n\n${error.message}`);
    }
}

