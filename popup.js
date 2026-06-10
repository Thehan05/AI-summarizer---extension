document.addEventListener('DOMContentLoaded', function() {
    const summarizeButton = document.getElementById('summarizeButton');
    const summaryResult = document.getElementById('summaryResult');
    const loading = document.getElementById('loading');

    summarizeButton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (!tabs || tabs.length === 0) {
                summaryResult.textContent = 'Error: No active tab found.';
                return;
            }
            const activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: () => {
                    const selectedText = window.getSelection().toString();
                    return selectedText.length > 0 ? selectedText : document.body.innerText;
                }
            }, async (results) => {
                if (chrome.runtime.lastError) {
                    console.error('Script execution error:', chrome.runtime.lastError);
                    summaryResult.textContent = 'Error: Could not access page content.';
                    return;
                }
                if (!results || !results[0]) {
                    summaryResult.textContent = 'Error: Could not retrieve page content.';
                    return;
                }
                const textToSummarize = results[0].result;
                loading.hidden = false;
                summaryResult.textContent = '';

                try {
                    const API_KEY = '';
                    const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

                    const formatSelect = document.getElementById('formatSelect');
                    const format = formatSelect ? formatSelect.value : 'brief';

                    const response = await fetch('https://tldr-proxy.tldr-theha.workers.dev', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: textToSummarize, format: format })
                    });


                    const data = await response.json();
                    console.log(data);
                    const rawText = data.choices[0].message.content;

                    // Split into lines, keep only bullet lines, strip the "* " prefix
                    const bullets = rawText
                        .split('\n')
                        .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
                        .map(line => line.replace(/^[\s*\-]+/, '').trim())
                        .filter(line => line.length > 0);

                    // Build a real <ul> with <li>s so CSS can style them
                    summaryResult.innerHTML = '';
                    if (bullets.length > 0) {
                        const ul = document.createElement('ul');
                        bullets.forEach(text => {
                            const li = document.createElement('li');
                            li.textContent = text;
                            ul.appendChild(li);
                        });
                        summaryResult.appendChild(ul);
                    } else {
                        // Fallback if the AI didn't return bullets
                        summaryResult.textContent = rawText;
                    }
                } catch (error) {
                    summaryResult.textContent = 'Error: ' + error.message;
                }

                loading.hidden = true;
            });
        });
    });
});
     


