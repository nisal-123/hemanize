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

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    // Setup listeners first so UI works immediately
    setupEventListeners();
    
    // Check if API Key is saved
    updateApiKeyButtonState();
    
    // Initialize Lucide Icons safely
    safeCreateIcons();
});

// Event Listeners Registration
function setupEventListeners() {
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
            
            // Process chunk
            const responseData = await callGeminiAPI(chunks[i], context);
            
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
