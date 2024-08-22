document.addEventListener('DOMContentLoaded', function() {
    const pageTitle = document.getElementById('page-title');
    const serverInput = document.getElementById('server-input');
    const redirectButton = document.getElementById('redirect-button');
    const errorHint = document.getElementById('error-hint');

    // Load the last used server from storage
    browser.storage.local.get('lastUsedServer').then(result => {
        if (result.lastUsedServer) {
            serverInput.value = result.lastUsedServer;
        }
    });

    // Get the redirect URL from the background script
    browser.runtime.sendMessage({action: "getRedirectUrl"})
        .then(redirectUrl => {
            if (redirectUrl) {
                pageTitle.textContent = "Sharing to:";
                redirectButton.addEventListener('click', function() {
                    const server = serverInput.value.trim();
                    if (server) {
                        // Save the server for future use
                        browser.storage.local.set({ lastUsedServer: server });

                        const encodedUrl = encodeURIComponent(redirectUrl);
                        const mastodonShareUrl = `https://${server}/share?text=${encodedUrl}`;
                        browser.tabs.create({ url: mastodonShareUrl });
                    } else {
                        serverInput.classList.add('error');
                        errorHint.style.display = 'block';
                    }
                });
            } else {
                pageTitle.textContent = "No shareable content found";
                redirectButton.disabled = true;
                serverInput.disabled = true;
            }
        })
        .catch(error => {
            console.error("Error getting redirect URL:", error);
            pageTitle.textContent = "Error occurred";
            redirectButton.disabled = true;
            serverInput.disabled = true;
        });

    serverInput.addEventListener('input', () => {
        if (serverInput.value.trim() !== '') {
            serverInput.classList.remove('error');
            errorHint.style.display = 'none';
        }
    });
});