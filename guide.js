// Dark mode toggle
document.querySelector('.toggle-btn').addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.querySelector('.toggle-btn').textContent =
        isDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode';
});

// Reusable clipboard setup function
function setupClipboard(button) {
    button.addEventListener('click', async function() {
        const apiKey = this.getAttribute('data-clipboard-text');
        const feedback = this.parentElement.querySelector('.copy-feedback');
        const icon = this.querySelector('.icon');

        try {
            await navigator.clipboard.writeText(apiKey);
            this.classList.add('copied');
            if (feedback) {
                feedback.classList.add('show');
                setTimeout(() => feedback.classList.remove('show'), 2000);
            }
            setTimeout(() => this.classList.remove('copied'), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback to execCommand
            const textarea = document.createElement('textarea');
            textarea.value = apiKey;
            textarea.style.position = 'fixed';
            textarea.style.opacity = 0;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            this.classList.add('copied');
            if (feedback) {
                feedback.classList.add('show');
                setTimeout(() => feedback.classList.remove('show'), 2000);
            }
            setTimeout(() => this.classList.remove('copied'), 2000);
        }
    });
}

function fallbackCopyTextToClipboard(text, button) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    // Select and copy the text
    textarea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        } else {
            console.error('Fallback: Could not copy text');
        }
    } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
    }

    // Remove the temporary textarea element
    document.body.removeChild(textarea);
}

// Collapsible sections
document.addEventListener('DOMContentLoaded', () => {
    // Initialize clipboard for existing buttons
    document.querySelectorAll('.copy-btn').forEach(setupClipboard);

    // Load steps
    loadSteps();

    // Initialize checklist functionality
    document.addEventListener('stepsLoaded', initializeChecklist);

    // Re-initialize clipboard after steps are loaded
    document.addEventListener('stepsLoaded', () => {
        document.querySelectorAll('.copy-btn').forEach(setupClipboard);
    });
});

async function loadSteps() {
    const stepsContainer = document.getElementById('steps-container');
    if (!stepsContainer) {
        console.error('Steps container not found!');
        return;
    }

    const stepFiles = [
        'steps/Register-For-Accounts.html',
        'steps/Configure-AIOStreams.html',
        'steps/Configure-AIOMetadata.html',
        'steps/Install-the-Nuvio-App.html'
    ];

    try {
        const responses = await Promise.all(
            stepFiles.map(file =>
                fetch(file)
                    .then(response => {
                        if (!response.ok) throw new Error(`Failed to load ${file}`);
                        return response.text();
                    })
                    .then(html => {
                        stepsContainer.insertAdjacentHTML('beforeend', html);
                    })
                    .catch(error => {
                        console.error(`Error loading ${file}:`, error);
                        stepsContainer.insertAdjacentHTML('beforeend',
                            `<div class="error">Failed to load step: ${file}</div>`);
                    })
            )
        );
        document.dispatchEvent(new Event('stepsLoaded'));
    } catch (error) {
        console.error('Error loading steps:', error);
        stepsContainer.insertAdjacentHTML('beforeend',
            `<div class="error">Failed to load steps. See console for details.</div>`);
    }
}

// Initialize collapsible behavior for main steps
function initializeMainSteps() {
    document.querySelectorAll('.main-step-header').forEach(header => {
        const mainStep = header.parentElement;
        const mainContent = mainStep.querySelector('.main-step-content');
        const span = header.querySelector('span');

        // Initialize state
        mainStep.classList.add('collapsed');
        span.textContent = '+';
        span.setAttribute('aria-expanded', 'false');
        mainStep.setAttribute('aria-hidden', 'true');
        mainContent.style.maxHeight = '0';

        header.addEventListener('click', () => {
            const isCollapsed = mainStep.classList.toggle('collapsed');
            span.setAttribute('aria-expanded', !isCollapsed);
            mainStep.setAttribute('aria-hidden', isCollapsed);
            span.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(45deg)';
            animateContent(mainContent, isCollapsed);
        });
    });
}

// Initialize collapsible behavior for sub-steps
function initializeSubSteps() {
    const mainSteps = document.querySelectorAll('.main-step');
    mainSteps.forEach(mainStep => {
        const subSteps = mainStep.querySelectorAll('.sub-step');
        const mainContent = mainStep.querySelector('.main-step-content');

        subSteps.forEach(subStep => {
            const subStepHeader = subStep.querySelector('.sub-step-header');
            const subStepContent = subStep.querySelector('.sub-step-content');
            const subStepSpan = subStepHeader.querySelector('span');

            // Initialize state
            subStep.classList.add('collapsed');
            subStepContent.style.maxHeight = '0';

            subStepHeader.addEventListener('click', () => {
                const isExpanded = subStep.classList.toggle('expanded');
                subStepContent.style.maxHeight = isExpanded ? `${subStepContent.scrollHeight}px` : '0';
                subStepSpan.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';

                // Recalculate the height of the main-step-content
                let totalHeight = 0;
                subSteps.forEach(currentSubStep => {
                    const currentSubStepContent = currentSubStep.querySelector('.sub-step-content');
                    if (currentSubStep.classList.contains('expanded')) {
                        totalHeight += currentSubStepContent.scrollHeight;
                    }
                });

                // Update the main-step-content height
                mainContent.style.maxHeight = mainContent.scrollHeight + totalHeight + 'px';
            });
        });
    });
}

// Call both functions after steps are loaded
document.addEventListener('stepsLoaded', () => {
    initializeMainSteps();
    initializeSubSteps();
});

function animateContent(content, isCollapsed) {
    requestAnimationFrame(() => {
        if (isCollapsed) {
            // Collapse
            content.style.maxHeight = '0';
            content.style.paddingTop = '0';
            content.style.paddingBottom = '0';
            content.style.overflow = 'hidden';
        } else {
            // Expand
            content.style.maxHeight = 'none';
            const fullHeight = `${content.scrollHeight}px`;
            content.style.maxHeight = '0';
            content.style.paddingTop = '';
            content.style.paddingBottom = '';
            content.style.overflow = 'hidden';
            // Force reflow before setting maxHeight
            requestAnimationFrame(() => {
                content.style.maxHeight = fullHeight;
            });
        }
    });
}

function updateParentMainStep(subStep) {
    const mainStep = subStep.closest('.main-step');
    if (mainStep) {
        const mainContent = mainStep.querySelector('.main-step-content');
        if (mainContent) {
            const subSteps = mainStep.querySelectorAll('.sub-step');
            let totalHeight = 0;

            subSteps.forEach(currentSubStep => {
                if (currentSubStep.classList.contains('expanded')) {
                    const currentSubStepContent = currentSubStep.querySelector('.sub-step-content');
                    totalHeight += currentSubStepContent.scrollHeight;
                }
            });

            mainContent.style.maxHeight = mainContent.scrollHeight + totalHeight + 'px';
        }
    }
}

function initializeChecklist() {
    document.querySelectorAll('.sub-step').forEach((subStep, index) => {
        const checklistItems = subStep.querySelectorAll('.checklist-item input[type="checkbox"]');
        const subStepHeader = subStep.querySelector('.sub-step-header');
        const subStepContent = subStep.querySelector('.sub-step-content');
        const subStepSpan = subStepHeader.querySelector('span');

        // Skip if no checklist items
        if (checklistItems.length === 0) return;

        checklistItems.forEach(item => {
            item.addEventListener('change', () => {
                const allChecked = Array.from(checklistItems).every(item => item.checked);

                if (allChecked) {
                    subStepHeader.classList.add('checked');
                    // Collapse current sub-step
                    subStep.classList.remove('expanded');
                    subStepContent.style.maxHeight = '0';
                    subStepSpan.style.transform = 'rotate(0deg)';

                    // Open next sub-step if it exists
                    const nextSubStep = document.querySelectorAll('.sub-step')[index + 1];
                    if (nextSubStep) {
                        const nextSubStepHeader = nextSubStep.querySelector('.sub-step-header');
                        const nextSubStepContent = nextSubStep.querySelector('.sub-step-content');
                        const nextSubStepSpan = nextSubStepHeader.querySelector('span');
                        nextSubStep.classList.add('expanded');
                        nextSubStepContent.style.maxHeight = `${nextSubStepContent.scrollHeight}px`;
                        nextSubStepSpan.style.transform = 'rotate(45deg)';
                        updateParentMainStep(nextSubStep);
                    }
                } else {
                    subStepHeader.classList.remove('checked');
                }
            });
        });
    });
}