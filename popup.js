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

                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + API_KEY
                        },
                        body: JSON.stringify({
                            model: 'llama-3.3-70b-versatile',
                            messages: [{
                                role: 'user',
                                content: 'Summarize this text in a few bullet points:\n\n' + textToSummarize
                            }]
                        })
                    });

                    const data = await response.json();
                    console.log(data);
                    summaryResult.textContent = data.choices[0].message.content;
                } catch (error) {
                    summaryResult.textContent = 'Error: ' + error.message;
                }

                loading.hidden = true;
            });
        });
    });
});
     


