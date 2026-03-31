// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadSteps();
    document.addEventListener('stepsLoaded', () => {
        document.querySelectorAll('.copy-btn').forEach(setupClipboard);
        initializeMainSteps();
        initializeSubSteps();
        initializeChecklist();
    });
});

// Dark mode toggle (Library)
document.querySelector('.toggle-btn').addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.querySelector('.toggle-btn').textContent =
        isDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode';
});

// Clipboard
function setupClipboard(button) {
    button.addEventListener('click', async function() {
        const apiKey = this.getAttribute('data-clipboard-text');
        try {
            await navigator.clipboard.writeText(apiKey);
            // Success feedback
        } catch (err) {
            console.error('Failed to copy text: ', err);
            fallbackCopyTextToClipboard(apiKey, this);
        }
    });
}

function fallbackCopyTextToClipboard(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = 0;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        // Success feedback
    } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
    }
    document.body.removeChild(textarea);
}

// Load steps
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
        await Promise.all(stepFiles.map(async file => {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            const html = await response.text();
            stepsContainer.insertAdjacentHTML('beforeend', html);
        }));
        document.dispatchEvent(new Event('stepsLoaded'));
    } catch (error) {
        console.error('Error loading steps:', error);
        stepsContainer.insertAdjacentHTML('beforeend', `<div class="error">Failed to load steps. See console for details.</div>`);
    }
}

// Initialize collapsible sections
// Main Steps
function initializeMainSteps() {
    document.querySelectorAll('.main-step').forEach(mainStep => {
        const header = mainStep.querySelector('.main-step-header');
        const mainContent = mainStep.querySelector('.main-step-content');
        const span = header.querySelector('span');

        // Initialize as collapsed
        mainStep.classList.add('collapsed');
        mainContent.style.maxHeight = '0';
        span.setAttribute('aria-expanded', 'false');
        mainStep.setAttribute('aria-hidden', 'true');
        mainContent.style.maxHeight = '0';

        header.addEventListener('click', () => {
            const isCollapsed = mainStep.classList.toggle('collapsed');
            span.setAttribute('aria-expanded', !isCollapsed);
            mainStep.setAttribute('aria-hidden', isCollapsed);
            animateContent(mainContent, isCollapsed);
        });
    });
}

//Sub Steps
function initializeSubSteps() {
    document.querySelectorAll('.main-step').forEach(mainStep => {
        const subSteps = mainStep.querySelectorAll('.sub-step');
        subSteps.forEach(subStep => {
            const subStepHeader = subStep.querySelector('.sub-step-header');
            const subStepContent = subStep.querySelector('.sub-step-content');
            const subStepSpan = subStepHeader.querySelector('span');

            // Initialize as collapsed
            subStep.classList.add('collapsed');
            subStepContent.style.maxHeight = '0';
            subStepSpan.setAttribute('aria-expanded', 'false');
            subStepSpan.style.transform = 'rotate(0deg)';
            subStep.setAttribute('aria-hidden', 'true');

            subStepHeader.addEventListener('click', () => {
                const isCollapsed = subStep.classList.toggle('collapsed');
                const isExpanded = !isCollapsed;
                subStepSpan.setAttribute('aria-expanded', !isExpanded);
                subStepSpan.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(45deg)';
                subStep.setAttribute('aria-hidden', isCollapsed);

                // Add or remove the 'expanded' class based on the collapsed state
                if (isExpanded) {
                    subStep.classList.add('expanded');
                } else {
                    subStep.classList.remove('expanded');
                }

                animateContent(subStepContent, isCollapsed);

                // Use requestAnimationFrame to ensure the DOM is fully updated
                requestAnimationFrame(() => {
                    // Recalculate the height of the main-step-content
                    let totalHeight = 0;
                    subSteps.forEach(currentSubStep => {
                        const currentSubStepContent = currentSubStep.querySelector('.sub-step-content');
                        if (currentSubStep.classList.contains('expanded')) {
                            totalHeight += currentSubStepContent.scrollHeight;
                        }
                    });

                    // Update the main-step-content height
                    mainContent.style.maxHeight = 'none';
                    mainContent.style.maxHeight = `${mainContent.scrollHeight + totalHeight}px`;
                });
            });
        });
    });
}

// Animate content
function animateContent(content, isCollapsed) {
    requestAnimationFrame(() => {
        if (isCollapsed) {
            content.style.maxHeight = '0';
        } else {
            content.style.maxHeight = `${content.scrollHeight}px`;
        }
    });
}

function updateParentMainStep(subStep) {
    const mainStep = subStep.closest('.main-step');
    if (mainStep) {
        const mainContent = mainStep.querySelector('.main-step-content');
        if (mainContent) {
            mainContent.style.maxHeight = 'none';
            mainContent.style.maxHeight = `${mainContent.scrollHeight}px`;
        }
    }
}

// Screenshot toggle
document.addEventListener('stepsLoaded', () => {
    document.querySelectorAll('.screenshot-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const container = toggle.nextElementSibling;
            const isExpanded = container.classList.toggle('expanded');
            const icon = toggle.querySelector('.toggle-icon');
            const text = toggle.querySelector('.toggle-text');

            // Update UI
            toggle.setAttribute('aria-expanded', isExpanded);
            icon.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';
            text.textContent = isExpanded ? 'Hide Screenshot' : 'Show Screenshot';

            // Use a small timeout to allow the DOM to update
            setTimeout(() => {
                requestAnimationFrame(() => {
                    if (container.closest('.sub-step-content')) {
                        const subStepContent = container.closest('.sub-step-content');
                        subStepContent.style.maxHeight = 'none';
                        subStepContent.style.maxHeight = `${subStepContent.scrollHeight}px`;

                        const subStep = container.closest('.sub-step');
                        const mainStep = subStep.closest('.main-step');

                        if (mainStep) {
                            const mainContent = mainStep.querySelector('.main-step-content');
                            const subSteps = mainStep.querySelectorAll('.sub-step');

                            // Recalculate the height of the main-step-content
                            let totalHeight = 0;
                            subSteps.forEach(currentSubStep => {
                                const currentSubStepContent = currentSubStep.querySelector('.sub-step-content');
                                if (currentSubStep.classList.contains('expanded')) {
                                    currentSubStepContent.style.maxHeight = 'none';
                                    currentSubStepContent.style.maxHeight = `${currentSubStepContent.scrollHeight}px`;
                                    totalHeight += currentSubStepContent.scrollHeight;
                                }
                            });

                            // Update the main-step-content height
                            mainContent.style.maxHeight = 'none';
                            mainContent.style.maxHeight = `${mainContent.scrollHeight + totalHeight}px`;
                        }
                    }
                });
            }, 100); // Reduced delay to 100ms (still allows DOM to settle)
        });
    });
});

// Checklist
function initializeChecklist() {
    document.querySelectorAll('.main-step').forEach((mainStep, mainIndex) => {
        const subSteps = mainStep.querySelectorAll('.sub-step');
        const mainStepHeader = mainStep.querySelector('.main-step-header');
        const mainStepContent = mainStep.querySelector('.main-step-content');
        const mainStepSpan = mainStepHeader.querySelector('span');

        subSteps.forEach((subStep, subIndex) => {
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
                        const nextSubStep = subSteps[subIndex + 1];
                        if (nextSubStep) {
                            const nextSubStepHeader = nextSubStep.querySelector('.sub-step-header');
                            const nextSubStepContent = nextSubStep.querySelector('.sub-step-content');
                            const nextSubStepSpan = nextSubStepHeader.querySelector('span');
                            nextSubStep.classList.add('expanded');
                            nextSubStepContent.style.maxHeight = `${nextSubStepContent.scrollHeight}px`;
                            nextSubStepSpan.style.transform = 'rotate(45deg)';
                            updateParentMainStep(nextSubStep);
                        }

                        // Check if all sub-steps are checked
                        const allSubStepsChecked = Array.from(subSteps).every(subStep => {
                            const subStepHeader = subStep.querySelector('.sub-step-header');
                            return subStepHeader.classList.contains('checked');
                        });

                        if (allSubStepsChecked) {
                            // Collapse the main-step
                            mainStep.classList.add('collapsed');
                            mainStepContent.style.maxHeight = '0';
                            mainStepSpan.style.transform = 'rotate(0deg)';
                            mainStepHeader.classList.add('checked');

                            // Open the next main-step if it exists
                            const nextMainStep = document.querySelectorAll('.main-step')[mainIndex + 1];
                            if (nextMainStep) {
                                const nextMainStepHeader = nextMainStep.querySelector('.main-step-header');
                                const nextMainStepContent = nextMainStep.querySelector('.main-step-content');
                                const nextMainStepSpan = nextMainStepHeader.querySelector('span');

                                nextMainStep.classList.remove('collapsed');
                                nextMainStepContent.style.maxHeight = `${nextMainStepContent.scrollHeight}px`;
                                nextMainStepSpan.style.transform = 'rotate(45deg)';
                            }
                        }
                    } else {
                        subStepHeader.classList.remove('checked');
                    }
                });
            });
        });
    });
}