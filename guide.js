// Dark mode toggle
document.querySelector('.toggle-btn').onclick = () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.toggle-btn').textContent =
        document.body.classList.contains('dark-mode') ? 'Disable Dark Mode' : 'Enable Dark Mode';
};

// Collapsible sections
document.addEventListener('DOMContentLoaded', () => {
    // Initialize clipboard functionality
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const apiKey = this.getAttribute('data-clipboard-text');
            const feedback = this.parentElement.querySelector('.copy-feedback');

            // Use the clipboard API if it is supported
            if (navigator.clipboard) {
                navigator.clipboard.writeText(apiKey).then(() => {
                    // Show feedback
                    feedback.classList.add('show');
                    setTimeout(() => {
                        feedback.classList.remove('show');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    fallbackCopyTextToClipboard(apiKey, this);
                });
            } else {
                // Fallback method for browsers that do not support the clipboard API
                fallbackCopyTextToClipboard(apiKey, this);
            }
        });
    });

    // Load steps
    loadSteps();

    // Initialize collapsible functionality after steps are loaded
    document.addEventListener('stepsLoaded', initializeCollapsible);

    // Initialize checklist functionality
    document.addEventListener('stepsLoaded', initializeChecklist);
});

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
            // Change button text to indicate success
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

async function loadSteps() {
    const stepsContainer = document.getElementById('steps-container');
    const stepFiles = [
        'steps/Register-For-Accounts.html',
        'steps/Configure-AIOStreams.html',
        'steps/Configure-AIOMetadata.html',
        'steps/Install-the-Nuvio-App.html'
    ];

        try {
        await Promise.all(stepFiles.map(async (file) => {
            try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            const html = await response.text();
            stepsContainer.insertAdjacentHTML('beforeend', html);
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
            stepsContainer.insertAdjacentHTML('beforeend',
                `<div class="error">Failed to load step: ${file}</div>`);
        }
        }));
    // Dispatch custom event when steps are loaded
    document.dispatchEvent(new Event('stepsLoaded'));
    } catch (error) {
        console.error('Error loading steps:', error);
    }
}

function initializeCollapsible() {
    const mainSteps = document.querySelectorAll('.main-step');

    mainSteps.forEach(mainStep => {
        const mainStepContent = mainStep.querySelector('.main-step-content');
        const subSteps = mainStep.querySelectorAll('.sub-step');

    subSteps.forEach(subStep => {
        const subStepHeader = subStep.querySelector('.sub-step-header');
            const subStepContent = subStep.querySelector('.sub-step-content');
            const subStepSpan = subStepHeader.querySelector('span');

            // Initialize state
            subStep.classList.add('collapsed');
            subStepContent.style.maxHeight = '0';
            subStepHeader.addEventListener('click', function() {
                subStep.classList.toggle('expanded');
                subStepContent.style.maxHeight = subStep.classList.contains('expanded') ? subStepContent.scrollHeight + 'px' : '0';

                 // Toggle the span icon
                if (subStep.classList.contains('expanded')) {
                    subStepSpan.style.transform = 'rotate(45deg)';
                } else {
                    subStepSpan.style.transform = 'rotate(0deg)';
                }

                // Calculate the total height of the expanded sub-steps
                let totalHeight = 0;
    subSteps.forEach(subStep => {
                    if (subStep.classList.contains('expanded')) {
                        totalHeight += subStep.querySelector('.sub-step-content').scrollHeight;
                    }
                });

                // Adjust the height of the main-step content
                mainStepContent.style.maxHeight = (mainStepContent.scrollHeight + totalHeight) + 'px';
            });
        });
    });

    // Also handle main step headers
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

        header.onclick = () => {
            const isCollapsed = mainStep.classList.toggle('collapsed');

            // Update ARIA attributes
            span.setAttribute('aria-expanded', !isCollapsed);
            mainStep.setAttribute('aria-hidden', isCollapsed);

             // Toggle the span icon
        if (isCollapsed) {
            span.style.transform = 'rotate(0deg)';
        } else {
            span.style.transform = 'rotate(45deg)';
        }

            // Animate content
            animateContent(mainContent, isCollapsed);
        };
        });
}

function animateContent(content, isCollapsed) {
    requestAnimationFrame(() => {
        if (isCollapsed) {
            // Collapsing animation
            content.style.maxHeight = '0';
            content.style.paddingTop = '0';
            content.style.paddingBottom = '0';
        } else {
            // Expanding animation
            content.style.maxHeight = 'none';
            const fullHeight = content.scrollHeight + 'px';
            content.style.maxHeight = '0';
            content.style.paddingTop = '';
            content.style.paddingBottom = '';

            setTimeout(() => {
                content.style.maxHeight = fullHeight;
            }, 10);
        }
    });
}

function updateParentMainStep(subStep) {
    const mainStep = subStep.closest('.main-step');
    if (mainStep) {
        const mainContent = mainStep.querySelector('.main-step-content');
        if (mainContent) {
            mainContent.style.maxHeight = 'none';
            const mainFullHeight = mainContent.scrollHeight + 'px';
            mainContent.style.maxHeight = mainFullHeight;
        }
    }
}

function initializeChecklist() {
    const subSteps = document.querySelectorAll('.sub-step');

    subSteps.forEach((subStep, index) => {
        const checklistItems = subStep.querySelectorAll('.checklist-item input[type="checkbox"]');
        const subStepHeader = subStep.querySelector('.sub-step-header');
        const subStepContent = subStep.querySelector('.sub-step-content');
        const subStepSpan = subStepHeader.querySelector('span');
        const mainStep = subStep.closest('.main-step');
        const mainStepContent = mainStep.querySelector('.main-step-content');

        checklistItems.forEach(checklistItem => {
            checklistItem.addEventListener('change', function() {
                let allChecked = true;
                checklistItems.forEach(item => {
                    if (!item.checked) {
                        allChecked = false;
                    }
                });

                if (allChecked) {
                    subStepHeader.classList.add('checked');
                    // Auto-collapse the current sub-step
                    subStep.classList.remove('expanded');
                    subStepContent.style.maxHeight = '0';
                    subStepSpan.style.transform = 'rotate(0deg)';

                    // Open the next sub-step if it exists
                    if (index < subSteps.length - 1) {
                        const nextSubStep = subSteps[index + 1];
                        const nextSubStepHeader = nextSubStep.querySelector('.sub-step-header');
                        const nextSubStepContent = nextSubStep.querySelector('.sub-step-content');
                        const nextSubStepSpan = nextSubStepHeader.querySelector('span');
                        nextSubStep.classList.add('expanded');
                        nextSubStepContent.style.maxHeight = nextSubStepContent.scrollHeight + 'px';
                        nextSubStepSpan.style.transform = 'rotate(45deg)';

                        // Calculate the total height of the expanded sub-steps
                        let totalHeight = 0;
                        subSteps.forEach(subStep => {
                            if (subStep.classList.contains('expanded')) {
                                totalHeight += subStep.querySelector('.sub-step-content').scrollHeight;
                            }
                        });

                        // Adjust the height of the main-step content
                        mainStepContent.style.maxHeight = (mainStepContent.scrollHeight + totalHeight) + 'px';
                    }
                } else {
                    subStepHeader.classList.remove('checked');
                }
            });
        });
    });
}

