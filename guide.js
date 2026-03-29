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
        try {
            await navigator.clipboard.writeText(apiKey);
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
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

            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
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
        // Reuse the success logic from setupClipboard
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
    }

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

            if (isExpanded) {
                container.style.maxHeight = 'none'; // Reset max-height to get the correct scrollHeight
                container.style.maxHeight = `${container.scrollHeight}px`;
            } else {
                container.style.maxHeight = '0';
            }

            // Use a small timeout to allow the DOM to update
            setTimeout(() => {
                if (container.closest('.sub-step-content')) {
                    const subStepContent = container.closest('.sub-step-content');
                    subStepContent.style.maxHeight = 'none';
                    subStepContent.style.maxHeight = `${subStepContent.scrollHeight}px`;

                    const subStep = container.closest('.sub-step');
                    updateParentMainStep(subStep);

                    const mainStep = subStep.closest('.main-step');
                    if (mainStep) {
                        const mainContent = mainStep.querySelector('.main-step-content');
                        if (mainContent) {
                            mainContent.style.maxHeight = 'none';
                            mainContent.style.maxHeight = `${mainContent.scrollHeight}px`;
                        }
                    }
                }
            }, 50);
        });
    });
});
    
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
                subStepHeader.setAttribute('aria-expanded', isExpanded);

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
    console.log('updateParentMainStep called'); // Debugging log
    const mainStep = subStep.closest('.main-step');
    if (mainStep) {
        const mainContent = mainStep.querySelector('.main-step-content');
        if (mainContent) {
            console.log('Updating mainContent height'); // Debugging log
            // Reset max-height to get the correct scrollHeight
            mainContent.style.maxHeight = 'none';
            console.log('Current scrollHeight:', mainContent.scrollHeight); // Debugging log
            // Set max-height to the scrollHeight
            mainContent.style.maxHeight = `${mainContent.scrollHeight}px`;
        } else {
            console.log('mainContent not found'); // Debugging log
        }    
    } else {
        console.log('mainStep not found'); // Debugging log
    }
}

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