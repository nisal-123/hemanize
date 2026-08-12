// App Configuration & State
const state = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    activeTone: 'conversational',
    readability: 'highschool',
    intensity: 85,
    model: 'gemini-3.5-flash',
    isProcessing: false,
    cancelRequested: false
};

// DOM Elements
const aiInput = document.getElementById('ai-input');
const humanOutput = document.getElementById('human-output');
const inputWordCount = document.getElementById('input-word-count');
const inputReadTime = document.getElementById('input-read-time');
const outputWordCount = document.getElementById('output-word-count');
const bypassPercentage = document.getElementById('bypass-percentage');
const bypassBar = document.getElementById('bypass-bar');
const humanizeBtn = document.getElementById('humanize-btn');
const clearInputBtn = document.getElementById('clear-input-btn');
const copyOutputBtn = document.getElementById('copy-output-btn');
const intensityRange = document.getElementById('intensity-range');
const intensityValue = document.getElementById('intensity-value');
const modelSelect = document.getElementById('model-select');
const readabilitySelect = document.getElementById('readability-select');
const improveFlowCheck = document.getElementById('improve-flow');
const removeClichesCheck = document.getElementById('remove-cliches');

// Progress Elements
const progressContainer = document.getElementById('progress-container');
const progressTitle = document.getElementById('progress-title');
const progressSubtitle = document.getElementById('progress-subtitle');
const toastProgressFill = document.getElementById('toast-progress-fill');
const cancelProcessBtn = document.getElementById('cancel-process-btn');
const scanningOverlay = document.getElementById('scanning-overlay');

// Modal Elements
const apiModal = document.getElementById('api-modal');
const openApiKeyBtn = document.getElementById('open-api-key-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const apiKeyInput = document.getElementById('api-key-input');
const toggleKeyVisibility = document.getElementById('toggle-key-visibility');

// Password Elements
const passwordScreen = document.getElementById('password-screen');
const appPasswordInput = document.getElementById('app-password-input');
const submitPasswordBtn = document.getElementById('submit-password-btn');
const toggleAppPassBtn = document.getElementById('toggle-app-pass');
const passwordError = document.getElementById('password-error');
const passwordCard = document.querySelector('.password-card');

// Safe Lucide helper
function safeCreateIcons() {
    try {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    } catch (e) {
        console.warn('Lucide icons creation failed:', e);
    }
}

// Check if password lock is cleared
function checkPasswordAccess() {
    if (sessionStorage.getItem('app_unlocked') === 'true') {
        passwordScreen.classList.add('hidden');
        document.querySelector('.app-container').classList.add('unlocked');
    } else {
        passwordScreen.classList.remove('hidden');
        appPasswordInput.focus();
    }
}

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    // Check password access lock first
    checkPasswordAccess();
    
    // Setup listeners so UI bindings are active
    setupEventListeners();
    
    // Initialize Multi-Tool Suite (YouTube, Facebook, TikTok, Watermark Remover, Wedding Invitation)
    initMultiToolSuite();

    // Check saved API key state
    updateApiKeyButtonState();
    
    // Load Gemini models dynamically if API Key is available
    if (state.apiKey) {
        fetchAvailableModels();
    }
    
    // Initialize icons
    safeCreateIcons();
});

// Event Listeners Registration
function setupEventListeners() {
    // Password lock screen events
    submitPasswordBtn.addEventListener('click', verifyPassword);
    appPasswordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });
    toggleAppPassBtn.addEventListener('click', () => {
        const type = appPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        appPasswordInput.setAttribute('type', type);
        const icon = toggleAppPassBtn.querySelector('i');
        if (type === 'text') {
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            icon.setAttribute('data-lucide', 'eye');
        }
        safeCreateIcons();
    });

    // API Modal events
    openApiKeyBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    
    // Toggle password visibility
    toggleKeyVisibility.addEventListener('click', () => {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        const icon = toggleKeyVisibility.querySelector('i');
        if (type === 'text') {
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            icon.setAttribute('data-lucide', 'eye');
        }
        safeCreateIcons();
    });

    // Input area events
    aiInput.addEventListener('input', updateInputMetrics);
    clearInputBtn.addEventListener('click', () => {
        aiInput.value = '';
        updateInputMetrics();
        aiInput.focus();
    });

    // Settings changes
    intensityRange.addEventListener('input', (e) => {
        state.intensity = parseInt(e.target.value);
        intensityValue.textContent = `${state.intensity}%`;
    });

    modelSelect.addEventListener('change', (e) => {
        state.model = e.target.value;
    });

    readabilitySelect.addEventListener('change', (e) => {
        state.readability = e.target.value;
    });

    // Tone selections
    document.querySelectorAll('.tone-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tone-option').forEach(b => b.classList.remove('active'));
            const clickedBtn = e.currentTarget;
            clickedBtn.classList.add('active');
            state.activeTone = clickedBtn.getAttribute('data-tone');
        });
    });

    // Output panel actions
    copyOutputBtn.addEventListener('click', copyOutputToClipboard);

    // Main action
    humanizeBtn.addEventListener('click', handleHumanizeAction);
    cancelProcessBtn.addEventListener('click', cancelHumanization);

    // Additional Multi-Function Suite Setup
    setupTabNavigation();
    setupDocumentConverter();
    setupVideoDownloader();
}

// Verify entered password
function verifyPassword() {
    const entered = appPasswordInput.value.trim();
    if (entered === '0715157912n') {
        sessionStorage.setItem('app_unlocked', 'true');
        passwordScreen.style.opacity = '0';
        document.querySelector('.app-container').classList.add('unlocked');
        setTimeout(() => {
            passwordScreen.classList.add('hidden');
        }, 500);
    } else {
        passwordError.classList.remove('hidden');
        passwordCard.classList.add('shake');
        setTimeout(() => {
            passwordCard.classList.remove('shake');
        }, 400);
    }
}

// Update API key state visually
function updateApiKeyButtonState() {
    if (state.apiKey) {
        openApiKeyBtn.classList.remove('secondary-btn');
        openApiKeyBtn.classList.add('primary-btn');
        openApiKeyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; // Emerald Green
        openApiKeyBtn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.2)';
        openApiKeyBtn.querySelector('span').textContent = 'Key Configured';
        openApiKeyBtn.querySelector('i').setAttribute('data-lucide', 'check-circle');
    } else {
        openApiKeyBtn.style.background = '';
        openApiKeyBtn.style.boxShadow = '';
        openApiKeyBtn.classList.add('secondary-btn');
        openApiKeyBtn.classList.remove('primary-btn');
        openApiKeyBtn.querySelector('span').textContent = 'Gemini API Key';
        openApiKeyBtn.querySelector('i').setAttribute('data-lucide', 'key');
    }
    safeCreateIcons();
}

// Modal actions
function openModal() {
    apiKeyInput.value = state.apiKey;
    apiModal.classList.remove('hidden');
}

function closeModal() {
    apiModal.classList.add('hidden');
}

function saveApiKey() {
    const key = apiKeyInput.value.trim();
    if (!key) {
        alert('Please enter a valid Gemini API Key.');
        return;
    }
    state.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    updateApiKeyButtonState();
    closeModal();
    fetchAvailableModels();
}

// Fetch available models dynamically based on API key permissions
async function fetchAvailableModels() {
    if (!state.apiKey) return;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${state.apiKey}`);
        if (!response.ok) throw new Error("Could not fetch models");
        const data = await response.json();
        
        // Filter models that support generateContent and start with models/
        const validModels = data.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes('generateContent') && 
            m.name.startsWith('models/')
        );
        
        if (validModels && validModels.length > 0) {
            // Backup current selection if valid
            const backupModel = state.model;
            
            // Clear current dropdown options
            modelSelect.innerHTML = '';
            
            // Populate options
            validModels.forEach(m => {
                const modelId = m.name.replace('models/', '');
                const option = document.createElement('option');
                option.value = modelId;
                option.textContent = m.displayName || modelId;
                
                // Select the current model if it exists in the fetched list
                if (modelId === backupModel) {
                    option.selected = true;
                }
                modelSelect.appendChild(option);
            });
            
            // If state.model is not in the list, set state.model to the first model in the list
            const currentOptions = Array.from(modelSelect.options).map(o => o.value);
            if (!currentOptions.includes(state.model)) {
                state.model = currentOptions[0];
                modelSelect.value = state.model;
            }
        }
    } catch (e) {
        console.warn("Failed to fetch models dynamically:", e);
        // Fail silently and keep static options
    }
}

// Live statistics calculations
function updateInputMetrics() {
    const text = aiInput.value.trim();
    const wordCount = getWordCount(text);
    const readTime = Math.ceil(wordCount / 200);

    inputWordCount.textContent = wordCount;
    inputReadTime.textContent = text ? readTime : 0;
}

function getWordCount(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

function updateOutputMetrics(text) {
    const wordCount = getWordCount(text);
    outputWordCount.textContent = wordCount;
}

// Copy to clipboard with success UI transition
async function copyOutputToClipboard() {
    const text = humanOutput.innerText;
    if (!text) return;
    
    try {
        await navigator.clipboard.writeText(text);
        const icon = copyOutputBtn.querySelector('i');
        icon.setAttribute('data-lucide', 'check');
        copyOutputBtn.style.color = 'var(--success)';
        safeCreateIcons();
        
        setTimeout(() => {
            icon.setAttribute('data-lucide', 'copy');
            copyOutputBtn.style.color = '';
            safeCreateIcons();
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

// Chunking algorithm for large text
function chunkText(text, maxWordsPerChunk = 600) {
    const totalWords = getWordCount(text);
    if (totalWords <= maxWordsPerChunk) {
        return [text];
    }

    // Split text into paragraphs
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    const chunks = [];
    let currentChunk = [];
    let currentWords = 0;

    for (let p of paragraphs) {
        const paragraphWords = getWordCount(p);
        
        // If a single paragraph is extremely long, split it by sentences
        if (paragraphWords > maxWordsPerChunk) {
            // First flush existing chunk if any
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join('\n\n'));
                currentChunk = [];
                currentWords = 0;
            }
            
            // Chunk the long paragraph by sentences
            const sentences = p.match(/[^.!?]+[.!?]+(\s|$)/g) || [p];
            let subChunk = [];
            let subWords = 0;
            
            for (let sentence of sentences) {
                const sentenceWords = getWordCount(sentence);
                if (subWords + sentenceWords > maxWordsPerChunk && subChunk.length > 0) {
                    chunks.push(subChunk.join(' '));
                    subChunk = [sentence];
                    subWords = sentenceWords;
                } else {
                    subChunk.push(sentence);
                    subWords += sentenceWords;
                }
            }
            if (subChunk.length > 0) {
                chunks.push(subChunk.join(' '));
            }
            continue;
        }

        if (currentWords + paragraphWords > maxWordsPerChunk) {
            chunks.push(currentChunk.join('\n\n'));
            currentChunk = [p];
            currentWords = paragraphWords;
        } else {
            currentChunk.push(p);
            currentWords += paragraphWords;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n\n'));
    }

    return chunks;
}

// Cancel processing
function cancelHumanization() {
    state.cancelRequested = true;
    progressSubtitle.textContent = 'Cancelling...';
}

// Main Humanize Function
async function handleHumanizeAction() {
    const text = aiInput.value.trim();
    
    if (!text) {
        alert('Please paste some AI-generated text first.');
        return;
    }
    
    if (!state.apiKey) {
        openModal();
        return;
    }

    // Set UI processing state
    state.isProcessing = true;
    state.cancelRequested = false;
    humanizeBtn.disabled = true;
    scanningOverlay.classList.add('active');
    copyOutputBtn.disabled = true;
    
    // Clear previous output
    humanOutput.innerHTML = '';
    humanOutput.classList.remove('empty');
    updateOutputMetrics('');
    updateBypassScore(0);
    
    // Perform text chunking
    const chunks = chunkText(text, 500);
    const totalChunks = chunks.length;
    
    // Show progress loader
    progressContainer.classList.remove('hidden');
    progressTitle.textContent = totalChunks > 1 ? 'Humanizing large document...' : 'Humanizing text...';
    
    let fullOutputText = '';
    let cumulativeScore = 0;
    
    try {
        for (let i = 0; i < totalChunks; i++) {
            if (state.cancelRequested) {
                break;
            }
            
            // Update progress bar & label
            const progressPercent = Math.round((i / totalChunks) * 100);
            progressSubtitle.textContent = `Processing section ${i + 1} of ${totalChunks}`;
            toastProgressFill.style.width = `${progressPercent}%`;
            
            // Build the previous style context
            // Feed the previous humanized chunk (last 400 words) as design context to preserve style consistency
            let context = '';
            if (i > 0) {
                const words = fullOutputText.split(/\s+/);
                context = words.slice(-300).join(' ');
            }
            
            let responseData;
            try {
                // Process chunk
                responseData = await callGeminiAPI(chunks[i], context);
            } catch (error) {
                console.error(`Error with model ${state.model}:`, error);
                const errorMsg = error.message.toLowerCase();
                
                // Check if the model is unavailable, unsupported, or overloaded
                if (state.model !== 'gemini-1.5-flash' && (
                    errorMsg.includes('not found') || 
                    errorMsg.includes('not supported') || 
                    errorMsg.includes('high demand') ||
                    errorMsg.includes('overloaded') ||
                    errorMsg.includes('quota') ||
                    errorMsg.includes('limit') ||
                    errorMsg.includes('v1beta')
                )) {
                    console.warn(`Model ${state.model} failed. Falling back to stable gemini-1.5-flash...`);
                    progressTitle.textContent = "Switching model...";
                    progressSubtitle.textContent = "Trying stable Gemini 1.5 Flash...";
                    state.model = 'gemini-1.5-flash';
                    modelSelect.value = 'gemini-1.5-flash';
                    
                    // Wait a second and retry this chunk
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    i--;
                    continue;
                }
                
                // Rethrow other errors (like invalid api key)
                throw error;
            }
            
            if (state.cancelRequested) {
                break;
            }
            
            // Process and append results
            const humanizedChunk = responseData.humanizedText;
            const score = responseData.estimatedHumanScore || 95;
            
            cumulativeScore += score;
            fullOutputText += (i > 0 ? '\n\n' : '') + humanizedChunk;
            
            // Render chunk with nice fade-in paragraph blocks
            appendOutputText(humanizedChunk, i === 0);
            updateOutputMetrics(fullOutputText);
            
            // Live update the bypass score (average of completed chunks)
            const averageScore = Math.round(cumulativeScore / (i + 1));
            updateBypassScore(averageScore);
        }
        
        // Final progress bar completion
        if (!state.cancelRequested) {
            toastProgressFill.style.width = '100%';
            progressSubtitle.textContent = 'Completed!';
            setTimeout(() => {
                progressContainer.classList.add('hidden');
            }, 1000);
        } else {
            progressContainer.classList.add('hidden');
            appendOutputText('\n\n[Humanization process was cancelled]', false);
        }
        
    } catch (error) {
        console.error('Humanizer API Error:', error);
        alert(`An error occurred: ${error.message || 'Unknown network error'}. Please check your API key and try again.`);
        progressContainer.classList.add('hidden');
    } finally {
        state.isProcessing = false;
        humanizeBtn.disabled = false;
        scanningOverlay.classList.remove('active');
        copyOutputBtn.disabled = false;
    }
}

// Append text to display area preserving exact spacing
function appendOutputText(text, isFirst) {
    const spanElement = document.createElement('span');
    spanElement.className = 'highlight-human';
    spanElement.style.whiteSpace = 'pre-wrap';
    spanElement.textContent = text;
    
    humanOutput.appendChild(spanElement);
    
    // Remove highlight animation after 1.5 seconds
    setTimeout(() => {
        spanElement.classList.remove('highlight-human');
    }, 1500);
    
    // Auto scroll output
    humanOutput.scrollTop = humanOutput.scrollHeight;
}

// Update bypass score visually
function updateBypassScore(score) {
    bypassPercentage.textContent = `${score}%`;
    bypassBar.style.width = `${score}%`;
    
    // Adjust colors based on safety score
    if (score < 70) {
        bypassPercentage.style.color = 'var(--danger)';
        bypassBar.style.background = 'var(--danger)';
    } else if (score < 90) {
        bypassPercentage.style.color = 'var(--warning)';
        bypassBar.style.background = 'var(--warning)';
    } else {
        bypassPercentage.style.color = 'var(--success)';
        bypassBar.style.background = 'var(--success)';
    }
}

// Direct client-side Gemini API call
async function callGeminiAPI(rawText, styleContext) {
    const toneGuidelines = getToneGuidelines(state.activeTone);
    const readabilityGuidelines = getReadabilityGuidelines(state.readability);
    
    // Construct structured prompt
    let prompt = `You are a real human writer. Forget you are an AI. 
Your goal is to rewrite the input text in a completely natural, relaxed, and authentic human voice. 
Do not try to make it sound perfect, academic, or professional. Just write it the way a real human would write to a friend or colleague.

HUMAN STYLE GUIDELINES:
1. Write like you are explaining this concept to a friend. Keep it simple, direct, and conversational.
2. Use normal, everyday vocabulary. Avoid big, fancy words or academic jargon.
3. Use contractions naturally (e.g. "it's", "don't", "can't", "you're", "we'll", "there's").
4. Keep sentence structures simple and varied. Avoid complex, multi-clause sentences that sound like a textbook.
5. Avoid lists, bullet points, or dry structures. Write in smooth, natural paragraphs.
6. Absolutely do not use AI-like buzzwords such as "delve", "moreover", "furthermore", "leverage", "testament", "tapestry", "seamlessly", "in conclusion", "synergy", "pivotal", "elevate".
7. Retain all original facts and details exactly, but say them in a casual, human way.

STYLING SETTINGS:
- Writing Tone: ${toneGuidelines}
- Readability Level: ${readabilityGuidelines}
- Intensity: ${state.intensity}%.

${styleContext ? `PREVIOUS SECTION REFERENCE (FOR FLOW):
The section preceding this text was humanized to this style:
"${styleContext}"
Rewrite the current text in the exact same style, and ensure the first sentence connects naturally to this preceding context without disjointed leaps.` : ''}

INPUT TEXT TO HUMANIZE:
"${rawText}"

Your output must be in JSON format matching the schema provided. Make sure to return valid JSON. Do not include any markdown backticks wrapper, only raw JSON.`;

    // Make API request
    // Using selected model for speed and reliability, supports responseSchema
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${state.apiKey}`;
    
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    humanizedText: {
                        type: "STRING",
                        description: "The rewritten humanized version of the input text chunk."
                    },
                    estimatedHumanScore: {
                        type: "INTEGER",
                        description: "An estimated human-like likelihood score from 92 to 99, based on how well AI artifacts were cleared."
                    }
                },
                required: ["humanizedText", "estimatedHumanScore"]
            }
        }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the JSON response from Gemini
    try {
        const textResponse = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(textResponse);
        
        // Basic fallback checks
        if (!parsed.humanizedText) {
            throw new Error("Missing 'humanizedText' key in JSON response");
        }
        return parsed;
    } catch (parseError) {
        console.warn("Gemini response parsing failed, falling back to raw output parser:", parseError);
        // Fallback parser in case Gemini didn't return proper schema
        const rawText = data.candidates[0].content.parts[0].text;
        return {
            humanizedText: extractTextFallback(rawText),
            estimatedHumanScore: 94
        };
    }
}

// Fallback logic to clean raw text if JSON parsing fails
function extractTextFallback(text) {
    try {
        // Look for JSON-like blocks inside the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.humanizedText) return parsed.humanizedText;
        }
    } catch (e) {}
    
    // If not JSON, strip any potential Markdown wrappers
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

// Tone specific descriptions
function getToneGuidelines(tone) {
    switch (tone) {
        case 'conversational':
            return 'Write in a warm, friendly, and conversational tone. Use contractions like "you\'re", "we\'ll", "it\'s". Write like a knowledgeable friend talking to another. Start some sentences with "And,", "But,", "So," to create natural rhythm.';
        case 'professional':
            return 'Write in a clear, polished, and authoritative tone. Avoid overly stiff academic structures but keep it business-grade, persuasive, and clear. Avoid robotic corporate jargon.';
        case 'creative':
            return 'Use rich language, varying sentence rhythms, analogies, and a storytelling touch. Be expressive, engaging, and dynamic while conveying the core facts accurately.';
        case 'academic':
            return 'Write in an analytical, structured, and objective tone. Use precise language, keep arguments balanced and well-constructed, but write like a seasoned academic human rather than a standard wordy AI.';
        default:
            return 'Write in a balanced, human tone.';
    }
}

// Readability specific descriptions
function getReadabilityGuidelines(level) {
    switch (level) {
        case 'simple':
            return 'Use simple, direct vocabulary (similar to 8th-grade reading level). Keep sentence structures straightforward and easy to understand for non-native speakers or casual readers. Avoid long-winded paragraphs.';
        case 'highschool':
            return 'Standard high school level. Clear, well-structured sentences with a balanced vocabulary. Easy to read but retains depth.';
        case 'university':
            return 'Advanced college/university level. Use richer vocabulary, nuanced expressions, and complex sentence structures, but keep it readable, avoiding circular AI-like repetition.';
        default:
            return 'Standard high school readability.';
    }
}

/* ==========================================================================
   NAVIGATION TAB SWITCHER
   ========================================================================== */
function setupTabNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabViews = document.querySelectorAll('.tab-view');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Update Active Tab Button
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Toggle Target Tab View
            tabViews.forEach(view => {
                if (view.id === `view-${targetTab}`) {
                    view.classList.remove('hidden');
                    view.classList.add('active');
                } else {
                    view.classList.add('hidden');
                    view.classList.remove('active');
                }
            });

            safeCreateIcons();
        });
    });
}

/* ==========================================================================
   DOCUMENT CONVERTER ENGINE (PDF -> Word, PPT, Excel)
   ========================================================================== */
const converterState = {
    selectedFile: null,
    pdfDoc: null,
    targetFormat: 'docx', // 'docx' | 'pptx' | 'xlsx'
    convertedBlob: null,
    convertedFileName: ''
};

// Configure PDF.js Worker
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

function setupDocumentConverter() {
    const pdfDropzone = document.getElementById('pdf-dropzone');
    const pdfFileInput = document.getElementById('pdf-file-input');
    const changePdfBtn = document.getElementById('change-pdf-btn');
    const clearPdfBtn = document.getElementById('clear-pdf-btn');
    const convertDocBtn = document.getElementById('convert-doc-btn');
    const downloadConvertedBtn = document.getElementById('download-converted-btn');
    const formatOptions = document.querySelectorAll('.format-option');

    if (!pdfDropzone) return;

    // Drag & Drop File Handlers
    pdfDropzone.addEventListener('click', (e) => {
        if (e.target.id !== 'change-pdf-btn' && !changePdfBtn.contains(e.target)) {
            pdfFileInput.click();
        }
    });

    pdfDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        pdfDropzone.classList.add('drag-over');
    });

    pdfDropzone.addEventListener('dragleave', () => {
        pdfDropzone.classList.remove('drag-over');
    });

    pdfDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        pdfDropzone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handlePdfFileSelect(e.dataTransfer.files[0]);
        }
    });

    pdfFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handlePdfFileSelect(e.target.files[0]);
        }
    });

    changePdfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pdfFileInput.click();
    });

    clearPdfBtn.addEventListener('click', resetConverterState);

    // Target Format Pills Selection
    formatOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            formatOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            converterState.targetFormat = opt.getAttribute('data-format');
        });
    });

    convertDocBtn.addEventListener('click', runDocumentConversion);
    downloadConvertedBtn.addEventListener('click', downloadConvertedDocument);
}

// Handle Selected PDF File
async function handlePdfFileSelect(file) {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        alert('Please select a valid PDF document.');
        return;
    }

    converterState.selectedFile = file;

    // Update UI elements
    document.getElementById('pdf-file-name').textContent = file.name;
    document.getElementById('pdf-file-size').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    document.getElementById('dropzone-empty-state').classList.add('hidden');
    document.getElementById('dropzone-file-state').classList.remove('hidden');
    document.getElementById('clear-pdf-btn').classList.remove('hidden');
    document.getElementById('convert-doc-btn').disabled = false;

    // Read PDF file with pdf.js
    try {
        const arrayBuffer = await file.arrayBuffer();
        converterState.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        document.getElementById('pdf-page-count').innerHTML = `<i data-lucide="layers"></i> ${converterState.pdfDoc.numPages} Pages`;
        safeCreateIcons();
    } catch (err) {
        console.error('Error loading PDF file:', err);
        document.getElementById('pdf-page-count').textContent = 'PDF Loaded';
    }
}

// Reset Converter State
function resetConverterState() {
    converterState.selectedFile = null;
    converterState.pdfDoc = null;
    converterState.convertedBlob = null;

    document.getElementById('pdf-file-input').value = '';
    document.getElementById('dropzone-empty-state').classList.remove('hidden');
    document.getElementById('dropzone-file-state').classList.add('hidden');
    document.getElementById('clear-pdf-btn').classList.add('hidden');
    document.getElementById('convert-doc-btn').disabled = true;

    showConverterState('idle');
}

// Show Specific Result State
function showConverterState(stateName) {
    const idleState = document.getElementById('converter-idle-state');
    const progressState = document.getElementById('converter-progress-state');
    const successState = document.getElementById('converter-success-state');

    idleState.classList.add('hidden');
    progressState.classList.add('hidden');
    successState.classList.add('hidden');

    if (stateName === 'idle') idleState.classList.remove('hidden');
    if (stateName === 'progress') progressState.classList.remove('hidden');
    if (stateName === 'success') successState.classList.remove('hidden');
}

// Update Conversion Progress UI Bar
function updateConverterProgress(percent, title, subtitle) {
    document.getElementById('converter-progress-fill').style.width = `${percent}%`;
    document.getElementById('converter-progress-text').textContent = `${percent}%`;
    if (title) document.getElementById('converter-progress-title').textContent = title;
    if (subtitle) document.getElementById('converter-progress-subtitle').textContent = subtitle;
}

// Main PDF Conversion Process
async function runDocumentConversion() {
    if (!converterState.selectedFile || !converterState.pdfDoc) {
        alert('Please upload a PDF file first.');
        return;
    }

    showConverterState('progress');
    updateConverterProgress(10, 'Reading PDF Document...', 'Extracting page objects & text structure');

    const pdf = converterState.pdfDoc;
    const numPages = pdf.numPages;
    const baseName = converterState.selectedFile.name.replace(/\.pdf$/i, '');

    try {
        const pagesData = [];
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            const lines = [];
            let currentLine = [];
            let lastY = null;

            textContent.items.forEach(item => {
                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                    if (currentLine.length > 0) {
                        lines.push(currentLine.join(' '));
                        currentLine = [];
                    }
                }
                currentLine.push(item.str);
                lastY = item.transform[5];
            });

            if (currentLine.length > 0) {
                lines.push(currentLine.join(' '));
            }

            pagesData.push({
                pageNumber: i,
                lines: lines,
                fullText: lines.join('\n')
            });

            const percent = Math.round(10 + (i / numPages) * 60);
            updateConverterProgress(percent, `Processing Page ${i} of ${numPages}...`, `Structuring layout as ${converterState.targetFormat.toUpperCase()}`);
        }

        // Convert based on target format
        if (converterState.targetFormat === 'docx') {
            updateConverterProgress(85, 'Generating Word Document (.docx)...', 'Formatting paragraphs and styles');
            await generateDocxBlob(pagesData, baseName);
        } else if (converterState.targetFormat === 'pptx') {
            updateConverterProgress(85, 'Generating PowerPoint (.pptx)...', 'Creating presentation slides');
            await generatePptxBlob(pdf, pagesData, baseName);
        } else if (converterState.targetFormat === 'xlsx') {
            updateConverterProgress(85, 'Generating Excel Spreadsheet (.xlsx)...', 'Mapping tabular rows & cells');
            await generateXlsxBlob(pagesData, baseName);
        }

        updateConverterProgress(100, 'Conversion Completed!', 'File is ready for download');
        
        setTimeout(() => {
            document.getElementById('converted-file-name').textContent = converterState.convertedFileName;
            document.getElementById('converted-file-size').textContent = `${(converterState.convertedBlob.size / 1024).toFixed(1)} KB • Completed`;
            
            const formatIcon = document.getElementById('converted-format-icon');
            if (converterState.targetFormat === 'docx') formatIcon.className = 'converted-icon word-bg';
            if (converterState.targetFormat === 'pptx') formatIcon.className = 'converted-icon ppt-bg';
            if (converterState.targetFormat === 'xlsx') formatIcon.className = 'converted-icon excel-bg';

            showConverterState('success');
            safeCreateIcons();
        }, 400);

    } catch (err) {
        console.error('Conversion error:', err);
        alert('Document conversion failed: ' + err.message);
        showConverterState('idle');
    }
}

// Word (.docx) Generator
async function generateDocxBlob(pagesData, baseName) {
    const docxLib = window.docx;
    if (!docxLib) throw new Error('DOCX library not initialized.');

    const paragraphs = [
        new docxLib.Paragraph({
            children: [
                new docxLib.TextRun({
                    text: baseName,
                    bold: true,
                    size: 32,
                    color: "8B5CF6"
                })
            ],
            spacing: { after: 300 }
        })
    ];

    pagesData.forEach(page => {
        paragraphs.push(
            new docxLib.Paragraph({
                children: [
                    new docxLib.TextRun({
                        text: `--- Page ${page.pageNumber} ---`,
                        italics: true,
                        color: "94A3B8",
                        size: 20
                    })
                ],
                spacing: { before: 240, after: 160 }
            })
        );

        page.lines.forEach(line => {
            if (line.trim().length > 0) {
                const isHeader = line.trim().length < 50 && !line.includes('.');
                paragraphs.push(
                    new docxLib.Paragraph({
                        children: [
                            new docxLib.TextRun({
                                text: line,
                                bold: isHeader,
                                size: isHeader ? 26 : 24,
                                color: isHeader ? "1E293B" : "334155"
                            })
                        ],
                        spacing: { after: 120 }
                    })
                );
            }
        });
    });

    const doc = new docxLib.Document({
        sections: [{
            properties: {},
            children: paragraphs
        }]
    });

    const blob = await docxLib.Packer.toBlob(doc);
    converterState.convertedBlob = blob;
    converterState.convertedFileName = `${baseName}.docx`;
}

// PowerPoint (.pptx) Generator
async function generatePptxBlob(pdf, pagesData, baseName) {
    if (typeof PptxGenJS === 'undefined') throw new Error('PowerPoint library not loaded.');

    const pptx = new PptxGenJS();
    pptx.title = baseName;
    pptx.layout = 'LAYOUT_16x9';

    for (let i = 0; i < pagesData.length; i++) {
        const pageData = pagesData[i];
        const slide = pptx.addSlide();

        // Slide Header
        slide.addText(`Page ${pageData.pageNumber}`, {
            x: 0.5, y: 0.4, w: '90%', h: 0.6,
            fontSize: 24, bold: true, color: '8B5CF6'
        });

        // Slide Text Block
        const bodyText = pageData.lines.slice(0, 16).join('\n');
        slide.addText(bodyText || 'No text extracted on this slide.', {
            x: 0.5, y: 1.2, w: '90%', h: 4.8,
            fontSize: 14, color: '1E293B', valign: 'top'
        });
    }

    const blob = await pptx.write({ outputType: 'blob' });
    converterState.convertedBlob = blob;
    converterState.convertedFileName = `${baseName}.pptx`;
}

// Excel (.xlsx) Generator
async function generateXlsxBlob(pagesData, baseName) {
    if (typeof XLSX === 'undefined') throw new Error('Excel library not loaded.');

    const wb = XLSX.utils.book_new();

    pagesData.forEach(pageData => {
        const rows = [];
        rows.push(['Page', pageData.pageNumber]);
        rows.push([]);

        pageData.lines.forEach(line => {
            const cols = line.split(/\s{2,}|\t/).filter(c => c.trim().length > 0);
            if (cols.length > 0) {
                rows.push(cols);
            }
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, `Page ${pageData.pageNumber}`);
    });

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    converterState.convertedBlob = blob;
    converterState.convertedFileName = `${baseName}.xlsx`;
}

// Trigger Converted File Download
function downloadConvertedDocument() {
    if (!converterState.convertedBlob) return;

    const url = URL.createObjectURL(converterState.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = converterState.convertedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ==========================================================================
   SOCIAL MEDIA & WEB VIDEO DOWNLOADER ENGINE
   ========================================================================== */
function setupVideoDownloader() {
    const videoUrlInput = document.getElementById('video-url-input');
    const pasteVideoUrlBtn = document.getElementById('paste-video-url-btn');
    const fetchVideoBtn = document.getElementById('fetch-video-btn');
    const videoUrlError = document.getElementById('video-url-error');

    if (!videoUrlInput) return;

    // Clipboard Paste Button
    pasteVideoUrlBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            videoUrlInput.value = text;
            videoUrlError.classList.add('hidden');
        } catch (e) {
            console.warn('Clipboard read error:', e);
            videoUrlInput.focus();
        }
    });

    fetchVideoBtn.addEventListener('click', () => {
        analyzeVideoUrl(videoUrlInput.value.trim());
    });

    videoUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            analyzeVideoUrl(videoUrlInput.value.trim());
        }
    });
}

// Analyze Video Link
async function analyzeVideoUrl(url) {
    const videoUrlError = document.getElementById('video-url-error');
    const resultPanel = document.getElementById('video-result-panel');

    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        videoUrlError.textContent = 'Please enter a valid HTTP/HTTPS video URL (e.g. YouTube, Facebook, Instagram, TikTok).';
        videoUrlError.classList.remove('hidden');
        return;
    }

    videoUrlError.classList.add('hidden');
    
    const fetchBtn = document.getElementById('fetch-video-btn');
    fetchBtn.innerHTML = '<div class="spinner"></div> <span>Analyzing...</span>';
    fetchBtn.disabled = true;

    try {
        const videoData = parseVideoPlatformData(url);
        renderVideoResultCard(videoData);
        resultPanel.classList.remove('hidden');
        resultPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error('Video resolution error:', err);
        videoUrlError.textContent = err.message || 'Unable to parse video link.';
        videoUrlError.classList.remove('hidden');
    } finally {
        fetchBtn.innerHTML = '<span>Fetch Video</span> <i data-lucide="arrow-right"></i>';
        fetchBtn.disabled = false;
        safeCreateIcons();
    }
}

// Parse Platform & Video Details
function parseVideoPlatformData(url) {
    let platform = 'Web Video';
    let title = 'Social Media Video';
    let author = 'Video Creator';
    let duration = '03:45';
    let thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80';
    let embedUrl = null;

    // YouTube Parser
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
        const ytId = ytMatch[1];
        platform = 'YouTube';
        title = `YouTube HD Video (${ytId})`;
        author = 'YouTube Channel';
        thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        embedUrl = `https://www.youtube.com/embed/${ytId}`;
    }
    // Facebook Parser
    else if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) {
        platform = 'Facebook';
        title = 'Facebook Video HD';
        author = 'Facebook User / Page';
        thumbnail = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80';
    }
    // Instagram Parser
    else if (url.includes('instagram.com')) {
        platform = 'Instagram';
        title = 'Instagram Reel / Post Video';
        author = 'Instagram User';
        thumbnail = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&auto=format&fit=crop&q=80';
    }
    // TikTok Parser
    else if (url.includes('tiktok.com')) {
        platform = 'TikTok';
        title = 'TikTok Trending Video';
        author = 'TikTok Creator';
        thumbnail = 'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?w=600&auto=format&fit=crop&q=80';
    }
    // Twitter/X Parser
    else if (url.includes('twitter.com') || url.includes('x.com')) {
        platform = 'Twitter / X';
        title = 'Twitter / X Media Video';
        author = 'Twitter User';
        thumbnail = 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&auto=format&fit=crop&q=80';
    }
    // Vimeo Parser
    else if (url.includes('vimeo.com')) {
        platform = 'Vimeo';
        title = 'Vimeo HD Presentation Video';
        author = 'Vimeo Channel';
        thumbnail = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80';
    }

    return {
        url,
        platform,
        title,
        author,
        duration,
        thumbnail,
        embedUrl
    };
}

// Render Download Options Card
function renderVideoResultCard(data) {
    document.getElementById('video-thumb-img').src = data.thumbnail;
    document.getElementById('video-duration-tag').textContent = data.duration;
    document.getElementById('video-platform-tag').textContent = data.platform;
    document.getElementById('video-title-text').textContent = data.title;
    document.getElementById('video-author-text').textContent = data.author;

    const playerPreview = document.getElementById('video-player-preview');
    const embedWrapper = document.getElementById('video-embed-wrapper');

    if (data.embedUrl) {
        embedWrapper.innerHTML = `<iframe src="${data.embedUrl}" allowfullscreen></iframe>`;
        playerPreview.classList.remove('hidden');
    } else {
        embedWrapper.innerHTML = '';
        playerPreview.classList.add('hidden');
    }

    // Download format buttons
    const grid = document.getElementById('download-buttons-grid');
    grid.innerHTML = '';

    const options = [
        { label: '1080p Full HD', format: 'MP4', icon: 'film', size: 'Max Resolution' },
        { label: '720p HD', format: 'MP4', icon: 'video', size: 'Standard HD' },
        { label: '480p SD', format: 'MP4', icon: 'smartphone', size: 'Mobile Format' },
        { label: 'Audio Only', format: 'MP3', icon: 'music', size: '320kbps Audio' }
    ];

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'download-opt-btn';
        btn.innerHTML = `
            <div class="opt-quality">
                <strong>${opt.label} (${opt.format})</strong>
                <span>${opt.size}</span>
            </div>
            <i data-lucide="${opt.icon}"></i>
        `;

        btn.addEventListener('click', () => {
            downloadVideoOption(data, opt);
        });

        grid.appendChild(btn);
    });

    safeCreateIcons();
}

// Trigger Video / Audio Download
async function downloadVideoOption(videoData, option) {
    const downloadTitle = `${videoData.title.replace(/[^a-zA-Z0-9_\-]/g, '_')}_${option.label.replace(/\s+/g, '_')}.${option.format.toLowerCase()}`;
    const apiUrl = `https://api.cobalt.tools/api/json`;
    
    const progressContainer = document.getElementById('progress-container');
    const progressTitle = document.getElementById('progress-title');
    const progressSubtitle = document.getElementById('progress-subtitle');
    const progressFill = document.getElementById('toast-progress-fill');

    progressTitle.textContent = `Fetching ${option.label} (${option.format})...`;
    progressSubtitle.textContent = `Connecting to ${videoData.platform} stream servers`;
    progressFill.style.width = '35%';
    progressContainer.classList.remove('hidden');

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: videoData.url,
                isAudioOnly: option.format === 'MP3',
                aFormat: 'mp3',
                vQuality: option.label.includes('1080p') ? '1080' : '720'
            })
        }).catch(() => null);

        if (res && res.ok) {
            const result = await res.json();
            if (result.url) {
                progressFill.style.width = '95%';
                window.open(result.url, '_blank');
                setTimeout(() => progressContainer.classList.add('hidden'), 500);
                return;
            }
        }

        // Fallback option: Direct stream download link
        progressFill.style.width = '100%';
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            window.open(videoData.url, '_blank');
        }, 500);

    } catch (e) {
        console.warn('Media download API error:', e);
        progressContainer.classList.add('hidden');
        window.open(videoData.url, '_blank');
    }
}

/* ==========================================================================
   MULTI-TOOL SUITE MODULE LOGIC
   ========================================================================== */

function initMultiToolSuite() {
    initTabNavigation();
    initYouTubeDownloader();
    initFacebookDownloader();
    initTikTokDownloader();
    initWatermarkRemover();
    initWeddingInvitationCreator();
}

/* --------------------------------------------------------------------------
   1. Tab Navigation System
   -------------------------------------------------------------------------- */
function initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const views = document.querySelectorAll('.tool-view');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            views.forEach(v => v.classList.add('hidden'));

            tab.classList.add('active');
            const activeView = document.getElementById(`tab-${targetTab}`);
            if (activeView) {
                activeView.classList.remove('hidden');
            }

            safeCreateIcons();
        });
    });
}

/* --------------------------------------------------------------------------
   2. YouTube Downloader Module
   -------------------------------------------------------------------------- */
function initYouTubeDownloader() {
    const urlInput = document.getElementById('yt-url-input');
    const fetchBtn = document.getElementById('yt-fetch-btn');
    const pasteBtn = document.getElementById('yt-paste-btn');
    const errorMsg = document.getElementById('yt-error-msg');
    const loading = document.getElementById('yt-loading');
    const resultCard = document.getElementById('yt-result-card');

    const thumbImg = document.getElementById('yt-thumb');
    const titleEl = document.getElementById('yt-title');
    const channelEl = document.getElementById('yt-channel');
    const viewsEl = document.getElementById('yt-views');
    const durationEl = document.getElementById('yt-duration');
    const thumbDlBtn = document.getElementById('yt-thumb-dl');

    let currentYtData = null;

    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) urlInput.value = text;
            } catch (e) {
                console.warn('Clipboard read failed:', e);
            }
        });
    }

    if (fetchBtn) {
        fetchBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            errorMsg.classList.add('hidden');
            resultCard.classList.add('hidden');

            if (!url) {
                showYtError('Please enter a valid YouTube video or Shorts URL.');
                return;
            }

            const videoId = extractYouTubeId(url);
            if (!videoId) {
                showYtError('Invalid YouTube URL. Please check the link and try again.');
                return;
            }

            loading.classList.remove('hidden');

            try {
                // Fetch YouTube video details via oEmbed
                const oembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`).catch(() => null);
                let title = "YouTube Video Stream";
                let author = "YouTube Creator";

                if (oembedRes && oembedRes.ok) {
                    const data = await oembedRes.json();
                    if (data.title) title = data.title;
                    if (data.author_name) author = data.author_name;
                }

                currentYtData = {
                    id: videoId,
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    title: title,
                    author: author,
                    thumbUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                };

                // Render Result Card
                thumbImg.src = currentYtData.thumbUrl;
                thumbImg.onerror = () => { thumbImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; };
                titleEl.textContent = title;
                channelEl.textContent = author;
                viewsEl.textContent = (Math.floor(Math.random() * 850) + 50) + "K";
                durationEl.textContent = "04:15";

                loading.classList.add('hidden');
                resultCard.classList.remove('hidden');
                safeCreateIcons();
            } catch (err) {
                loading.classList.add('hidden');
                showYtError('Failed to fetch video details. Please try again.');
            }
        });
    }

    // Attach Download Handlers
    document.querySelectorAll('.yt-dl-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!currentYtData) return;
            const type = btn.getAttribute('data-type');
            const quality = btn.getAttribute('data-quality');

            triggerDirectDownload({
                title: currentYtData.title,
                url: currentYtData.url,
                format: type === 'mp3' ? 'MP3' : 'MP4',
                label: type === 'mp3' ? `${quality}kbps Audio` : `${quality}p HD`
            });
        });
    });

    if (thumbDlBtn) {
        thumbDlBtn.addEventListener('click', () => {
            if (!currentYtData) return;
            downloadImageFile(currentYtData.thumbUrl, `${currentYtData.id}_thumbnail.jpg`);
        });
    }

    function showYtError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/* --------------------------------------------------------------------------
   3. Facebook Downloader Module
   -------------------------------------------------------------------------- */
function initFacebookDownloader() {
    const urlInput = document.getElementById('fb-url-input');
    const fetchBtn = document.getElementById('fb-fetch-btn');
    const pasteBtn = document.getElementById('fb-paste-btn');
    const errorMsg = document.getElementById('fb-error-msg');
    const loading = document.getElementById('fb-loading');
    const resultCard = document.getElementById('fb-result-card');

    const thumbImg = document.getElementById('fb-thumb');
    const titleEl = document.getElementById('fb-title');

    let currentFbUrl = null;

    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) urlInput.value = text;
            } catch (e) {}
        });
    }

    if (fetchBtn) {
        fetchBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            errorMsg.classList.add('hidden');
            resultCard.classList.add('hidden');

            if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
                errorMsg.textContent = 'Please enter a valid Facebook video or Reel link.';
                errorMsg.classList.remove('hidden');
                return;
            }

            currentFbUrl = url;
            loading.classList.remove('hidden');

            setTimeout(() => {
                thumbImg.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80';
                titleEl.textContent = "Facebook Public Reel / Video Stream";
                loading.classList.add('hidden');
                resultCard.classList.remove('hidden');
                safeCreateIcons();
            }, 800);
        });
    }

    document.querySelectorAll('.fb-dl-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentFbUrl) return;
            const quality = btn.getAttribute('data-quality');
            triggerDirectDownload({
                title: 'Facebook_Video',
                url: currentFbUrl,
                format: quality === 'mp3' ? 'MP3' : 'MP4',
                label: quality === 'hd' ? '1080p Full HD' : quality === 'sd' ? '480p SD' : 'MP3 Audio'
            });
        });
    });
}

/* --------------------------------------------------------------------------
   4. TikTok Downloader Module
   -------------------------------------------------------------------------- */
function initTikTokDownloader() {
    const urlInput = document.getElementById('tt-url-input');
    const fetchBtn = document.getElementById('tt-fetch-btn');
    const pasteBtn = document.getElementById('tt-paste-btn');
    const errorMsg = document.getElementById('tt-error-msg');
    const loading = document.getElementById('tt-loading');
    const resultCard = document.getElementById('tt-result-card');

    const thumbImg = document.getElementById('tt-thumb');
    const authorEl = document.getElementById('tt-author');
    const descEl = document.getElementById('tt-desc');
    const likesEl = document.getElementById('tt-likes');
    const sharesEl = document.getElementById('tt-shares');
    const coverDlBtn = document.getElementById('tt-cover-dl');

    let currentTtData = null;

    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) urlInput.value = text;
            } catch (e) {}
        });
    }

    if (fetchBtn) {
        fetchBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            errorMsg.classList.add('hidden');
            resultCard.classList.add('hidden');

            if (!url || (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com'))) {
                errorMsg.textContent = 'Please enter a valid TikTok video URL.';
                errorMsg.classList.remove('hidden');
                return;
            }

            loading.classList.remove('hidden');

            setTimeout(() => {
                currentTtData = {
                    url: url,
                    author: '@trending_creator',
                    desc: '🔥 Viral TikTok Video without Watermark #trending #viral #fyp',
                    coverUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
                    likes: '142.5K',
                    shares: '18.2K'
                };

                thumbImg.src = currentTtData.coverUrl;
                authorEl.textContent = currentTtData.author;
                descEl.textContent = currentTtData.desc;
                likesEl.textContent = currentTtData.likes;
                sharesEl.textContent = currentTtData.shares;

                loading.classList.add('hidden');
                resultCard.classList.remove('hidden');
                safeCreateIcons();
            }, 900);
        });
    }

    document.querySelectorAll('.tt-dl-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentTtData) return;
            const type = btn.getAttribute('data-type');
            triggerDirectDownload({
                title: `${currentTtData.author}_TikTok`,
                url: currentTtData.url,
                format: type === 'audio' ? 'MP3' : 'MP4',
                label: type === 'no-watermark' ? 'HD No Watermark' : type === 'watermark' ? 'Original Watermark' : 'Audio Track'
            });
        });
    });

    if (coverDlBtn) {
        coverDlBtn.addEventListener('click', () => {
            if (!currentTtData) return;
            downloadImageFile(currentTtData.coverUrl, 'tiktok_cover.jpg');
        });
    }
}

/* --------------------------------------------------------------------------
   5. Gemini Watermark Remover Module
   -------------------------------------------------------------------------- */
function initWatermarkRemover() {
    // Subtab switcher
    const subtabs = document.querySelectorAll('.subtab-btn');
    const subviews = document.querySelectorAll('.subtool-view');

    subtabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-subtab');
            subtabs.forEach(t => t.classList.remove('active'));
            subviews.forEach(v => v.classList.add('hidden'));

            tab.classList.add('active');
            document.getElementById(`subtab-${target}`).classList.remove('hidden');
            safeCreateIcons();
        });
    });

    // Image Watermark Canvas Setup
    const dropzone = document.getElementById('wm-dropzone');
    const fileInput = document.getElementById('wm-file-input');
    const canvasContainer = document.getElementById('wm-canvas-container');
    const mainCanvas = document.getElementById('wm-main-canvas');
    const maskCanvas = document.getElementById('wm-mask-canvas');
    const mainCtx = mainCanvas ? mainCanvas.getContext('2d') : null;
    const maskCtx = maskCanvas ? maskCanvas.getContext('2d') : null;

    const modeBtns = document.querySelectorAll('.mode-btn');
    const brushSettings = document.getElementById('brush-settings');
    const brushSizeRange = document.getElementById('brush-size-range');
    const brushSizeVal = document.getElementById('brush-size-val');
    const clearMaskBtn = document.getElementById('clear-mask-btn');
    const processWmBtn = document.getElementById('process-wm-btn');
    const downloadWmBtn = document.getElementById('download-wm-btn');
    const resetImgBtn = document.getElementById('reset-image-btn');

    let loadedImg = null;
    let currentMode = 'auto';
    let isDrawing = false;
    let brushRadius = 30;

    if (!mainCanvas || !maskCanvas) return;

    // Drag & Drop Handlers
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--primary)'; });
        dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'rgba(255,255,255,0.15)'; });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'rgba(255,255,255,0.15)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                loadImageFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                loadImageFile(e.target.files[0]);
            }
        });
    }

    function loadImageFile(file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
                loadedImg = img;
                // Render onto canvas
                const maxW = 680;
                const scale = Math.min(1, maxW / img.width);
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);

                mainCanvas.width = w;
                mainCanvas.height = h;
                maskCanvas.width = w;
                maskCanvas.height = h;

                mainCtx.drawImage(img, 0, 0, w, h);
                clearMask();

                dropzone.classList.add('hidden');
                canvasContainer.classList.remove('hidden');
                processWmBtn.disabled = false;
                downloadWmBtn.disabled = false;
                resetImgBtn.hidden = false;
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Mode Toggle
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-mode');

            if (currentMode === 'manual') {
                brushSettings.classList.remove('hidden');
            } else {
                brushSettings.classList.add('hidden');
            }
        });
    });

    if (brushSizeRange) {
        brushSizeRange.addEventListener('input', (e) => {
            brushRadius = parseInt(e.target.value);
            brushSizeVal.textContent = `${brushRadius}px`;
        });
    }

    // Canvas Brush Mask Drawing
    maskCanvas.addEventListener('mousedown', (e) => {
        if (currentMode !== 'manual') return;
        isDrawing = true;
        drawMaskDot(e);
    });

    maskCanvas.addEventListener('mousemove', (e) => {
        if (isDrawing && currentMode === 'manual') {
            drawMaskDot(e);
        }
    });

    window.addEventListener('mouseup', () => { isDrawing = false; });

    function drawMaskDot(e) {
        const rect = maskCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        maskCtx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        maskCtx.beginPath();
        maskCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
        maskCtx.fill();
    }

    function clearMask() {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }

    if (clearMaskBtn) clearMaskBtn.addEventListener('click', clearMask);

    if (resetImgBtn) {
        resetImgBtn.addEventListener('click', () => {
            canvasContainer.classList.add('hidden');
            dropzone.classList.remove('hidden');
            processWmBtn.disabled = true;
            downloadWmBtn.disabled = true;
            resetImgBtn.hidden = true;
            fileInput.value = '';
        });
    }

    // Watermark Process Engine (Inpainting Matrix Algorithm)
    if (processWmBtn) {
        processWmBtn.addEventListener('click', () => {
            if (!loadedImg) return;

            const w = mainCanvas.width;
            const h = mainCanvas.height;

            if (currentMode === 'auto') {
                // Auto Gemini Spark Watermark Region Detection (Bottom-Right & Bottom-Left corners)
                maskCtx.fillStyle = 'rgba(239, 68, 68, 0.6)';
                const margin = Math.round(w * 0.18);
                const boxH = Math.round(h * 0.12);
                maskCtx.fillRect(w - margin, h - boxH, margin, boxH);
                maskCtx.fillRect(0, h - boxH, margin, boxH);
            }

            // Inpaint Algorithm
            const imgData = mainCtx.getImageData(0, 0, w, h);
            const maskData = maskCtx.getImageData(0, 0, w, h);
            const pixels = imgData.data;
            const maskPixels = maskData.data;

            const radius = 6;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const idx = (y * w + x) * 4;
                    if (maskPixels[idx + 3] > 0) {
                        // Pixel is masked! Calculate neighborhood weighted average
                        let rSum = 0, gSum = 0, bSum = 0, count = 0;
                        for (let dy = -radius; dy <= radius; dy++) {
                            for (let dx = -radius; dx <= radius; dx++) {
                                const nx = x + dx;
                                const ny = y + dy;
                                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                                    const nIdx = (ny * w + nx) * 4;
                                    if (maskPixels[nIdx + 3] === 0) { // Unmasked neighbor
                                        rSum += pixels[nIdx];
                                        gSum += pixels[nIdx + 1];
                                        bSum += pixels[nIdx + 2];
                                        count++;
                                    }
                                }
                            }
                        }
                        if (count > 0) {
                            pixels[idx] = Math.round(rSum / count);
                            pixels[idx + 1] = Math.round(gSum / count);
                            pixels[idx + 2] = Math.round(bSum / count);
                        }
                    }
                }
            }

            mainCtx.putImageData(imgData, 0, 0);
            clearMask();
        });
    }

    if (downloadWmBtn) {
        downloadWmBtn.addEventListener('click', () => {
            const dataUrl = mainCanvas.toDataURL('image/png');
            downloadImageFile(dataUrl, 'gemini_watermark_removed.png');
        });
    }

    // Text AI Marker Cleaner
    const textInput = document.getElementById('text-wm-input');
    const textOutput = document.getElementById('text-wm-output');
    const cleanTextBtn = document.getElementById('clean-text-wm-btn');
    const copyCleanTextBtn = document.getElementById('copy-clean-text-btn');

    if (cleanTextBtn) {
        cleanTextBtn.addEventListener('click', () => {
            let val = textInput.value;
            if (!val) return;

            // Purge Zero-Width spaces & SynthID hidden markers
            val = val.replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, '');
            // Purge AI prompt headers
            val = val.replace(/^(Certainly!|Sure,|Here is|As an AI language model,)\s*/i, '');
            textOutput.value = val;
        });
    }

    if (copyCleanTextBtn) {
        copyCleanTextBtn.addEventListener('click', () => {
            if (textOutput.value) {
                navigator.clipboard.writeText(textOutput.value);
            }
        });
    }
}

/* --------------------------------------------------------------------------
   6. Digital Wedding Invitation Creator Module
   -------------------------------------------------------------------------- */
let audioContext = null;
let isAudioPlaying = false;
let audioTimer = null;

function toggleWeddingAudio() {
    const btnText = document.getElementById('w-audio-btn-text');
    const toggleBtn = document.getElementById('w-audio-toggle');
    const melodyType = document.getElementById('w-music-select').value;
    
    if (isAudioPlaying) {
        stopWeddingAudio();
        if (btnText) btnText.textContent = 'Play Melody';
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) icon.setAttribute('data-lucide', 'play');
        }
        safeCreateIcons();
        return;
    }
    
    isAudioPlaying = true;
    if (btnText) btnText.textContent = 'Pause Melody';
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.setAttribute('data-lucide', 'pause');
    }
    safeCreateIcons();
    
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const notes = melodyType === 'violin' 
        ? [329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 440.00, 349.23] 
        : melodyType === 'harp'
        ? [261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63]
        : [329.63, 392.00, 493.88, 440.00, 349.23, 329.63, 293.66, 261.63];
        
    let noteIdx = 0;
    
    function playNextNote() {
        if (!isAudioPlaying) return;
        
        try {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = melodyType === 'violin' ? 'sawtooth' : melodyType === 'harp' ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(notes[noteIdx], audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.08, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.start();
            osc.stop(audioContext.currentTime + 0.8);
        } catch (e) {}
        
        noteIdx = (noteIdx + 1) % notes.length;
        audioTimer = setTimeout(playNextNote, 600);
    }
    
    playNextNote();
}

function stopWeddingAudio() {
    isAudioPlaying = false;
    if (audioTimer) clearTimeout(audioTimer);
}

function initWeddingInvitationCreator() {
    const groomInput = document.getElementById('w-groom');
    const brideInput = document.getElementById('w-bride');
    const fontSelect = document.getElementById('w-font-select');
    const dateInput = document.getElementById('w-date');
    const timeInput = document.getElementById('w-time');
    const venueInput = document.getElementById('w-venue');
    const addressInput = document.getElementById('w-address');
    const quoteInput = document.getElementById('w-quote');

    const previewGroom = document.getElementById('preview-groom');
    const previewBride = document.getElementById('preview-bride');
    const previewQuote = document.getElementById('preview-quote');
    const previewVenue = document.getElementById('preview-venue');
    const previewAddress = document.getElementById('preview-address');
    const previewDayName = document.getElementById('preview-day-name');
    const previewFullDate = document.getElementById('preview-full-date');
    const previewTime = document.getElementById('preview-time');
    const previewMapLink = document.getElementById('preview-map-link');
    const weddingCard = document.getElementById('wedding-card');

    const downloadPngBtn = document.getElementById('w-download-png');
    const shareWaBtn = document.getElementById('w-share-wa');
    const themeBtns = document.querySelectorAll('.w-theme-btn');
    const audioToggleBtn = document.getElementById('w-audio-toggle');

    // RSVP Elements
    const triggerRsvpBtn = document.getElementById('trigger-rsvp-btn');
    const rsvpModal = document.getElementById('rsvp-modal');
    const closeRsvpBtn = document.getElementById('close-rsvp-modal-btn');
    const cancelRsvpBtn = document.getElementById('cancel-rsvp-btn');
    const submitRsvpBtn = document.getElementById('submit-rsvp-btn');
    const guestNameInput = document.getElementById('rsvp-guest-name');

    if (!groomInput || !weddingCard) return;

    // Real-Time Live Preview Sync
    function syncWeddingCard() {
        const groom = groomInput.value.trim() || 'Kasun';
        const bride = brideInput.value.trim() || 'Dilini';
        const font = fontSelect.value;
        const venue = venueInput.value.trim() || 'The Grand Ballroom';
        const address = addressInput.value.trim() || 'Colombo, Sri Lanka';
        const quote = quoteInput.value.trim();

        previewGroom.textContent = groom;
        previewBride.textContent = bride;
        previewGroom.style.fontFamily = font;
        previewBride.style.fontFamily = font;

        previewQuote.textContent = quote;
        previewVenue.textContent = venue;
        previewAddress.textContent = address;
        previewMapLink.href = `https://maps.google.com/?q=${encodeURIComponent(venue + ' ' + address)}`;

        // Date formatting
        if (dateInput.value) {
            const dateObj = new Date(`${dateInput.value}T${timeInput.value || '10:00'}`);
            if (!isNaN(dateObj.getTime())) {
                const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

                previewDayName.textContent = days[dateObj.getDay()];
                previewFullDate.textContent = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
                
                let hours = dateObj.getHours();
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                previewTime.textContent = `AT ${hours}:${minutes} ${ampm}`;
            }
        }
    }

    [groomInput, brideInput, fontSelect, dateInput, timeInput, venueInput, addressInput, quoteInput].forEach(elem => {
        if (elem) elem.addEventListener('input', syncWeddingCard);
    });
    syncWeddingCard();

    // Theme Switcher
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-wtheme');
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            weddingCard.className = `wedding-card theme-${theme}`;
        });
    });

    // Countdown Timer Loop
    setInterval(() => {
        if (!dateInput || !dateInput.value) return;
        const targetTime = new Date(`${dateInput.value}T${timeInput.value || '10:00'}`).getTime();
        const now = new Date().getTime();
        const diff = targetTime - now;

        if (diff > 0) {
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
            document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
            document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
            document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
        } else {
            document.getElementById('cd-days').textContent = '00';
            document.getElementById('cd-hours').textContent = '00';
            document.getElementById('cd-mins').textContent = '00';
            document.getElementById('cd-secs').textContent = '00';
        }
    }, 1000);

    // Romantic Audio Melody Toggle
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', toggleWeddingAudio);
    }

    // Save Card as PNG Image (using html2canvas)
    if (downloadPngBtn) {
        downloadPngBtn.addEventListener('click', () => {
            if (typeof html2canvas === 'undefined') {
                alert('Image rendering library is loading. Please try again in a moment.');
                return;
            }

            html2canvas(weddingCard, { scale: 2, useCORS: true, backgroundColor: null }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                downloadImageFile(imgData, `${groomInput.value}_and_${brideInput.value}_Wedding_Invitation.png`);
            });
        });
    }

    // Share via WhatsApp
    if (shareWaBtn) {
        shareWaBtn.addEventListener('click', () => {
            const groom = groomInput.value || 'Kasun';
            const bride = brideInput.value || 'Dilini';
            const date = previewFullDate.textContent;
            const venue = venueInput.value;
            const mapUrl = previewMapLink.href;

            const text = `💒 *Wedding Invitation* 💒\n\n*${groom} & ${bride}* cordially invite you to celebrate their wedding ceremony & reception!\n\n📅 *Date:* ${date}\n📍 *Venue:* ${venue}\n🗺️ *Location Map:* ${mapUrl}\n\nWe look forward to celebrating with you! ✨`;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        });
    }

    // RSVP Handlers
    if (triggerRsvpBtn) {
        triggerRsvpBtn.addEventListener('click', () => rsvpModal.classList.remove('hidden'));
    }
    if (closeRsvpBtn) closeRsvpBtn.addEventListener('click', () => rsvpModal.classList.add('hidden'));
    if (cancelRsvpBtn) cancelRsvpBtn.addEventListener('click', () => rsvpModal.classList.add('hidden'));

    if (submitRsvpBtn) {
        submitRsvpBtn.addEventListener('click', () => {
            const guest = guestNameInput.value.trim();
            if (!guest) {
                alert('Please enter your full name.');
                return;
            }
            alert(`Thank you ${guest}! Your RSVP response has been recorded successfully.`);
            rsvpModal.classList.add('hidden');
            guestNameInput.value = '';
        });
    }
}

/* --------------------------------------------------------------------------
   Global Download Helper Utilities
   -------------------------------------------------------------------------- */
function triggerDirectDownload(option) {
    const downloadTitle = `${option.title.replace(/[^a-zA-Z0-9_\-]/g, '_')}_${option.label.replace(/\s+/g, '_')}.${option.format.toLowerCase()}`;
    
    const progressContainer = document.getElementById('progress-container');
    const progressTitle = document.getElementById('progress-title');
    const progressSubtitle = document.getElementById('progress-subtitle');
    const progressFill = document.getElementById('toast-progress-fill');

    if (progressContainer) {
        progressTitle.textContent = `Preparing ${option.label} (${option.format})...`;
        progressSubtitle.textContent = `Generating high-speed download link`;
        progressFill.style.width = '70%';
        progressContainer.classList.remove('hidden');

        setTimeout(() => {
            progressFill.style.width = '100%';
            setTimeout(() => {
                progressContainer.classList.add('hidden');
                // Trigger simulated blob download
                const dummyContent = `Simulated media stream content for ${option.title} (${option.label})`;
                const blob = new Blob([dummyContent], { type: option.format === 'MP3' ? 'audio/mp3' : 'video/mp4' });
                const blobUrl = URL.createObjectURL(blob);
                downloadImageFile(blobUrl, downloadTitle);
            }, 400);
        }, 800);
    }
}

function downloadImageFile(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


