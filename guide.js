// ===== Dark Mode Toggle =====
document.querySelector('.toggle-btn')?.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.querySelector('.toggle-btn').textContent =
        isDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode';
});

// ===== Clipboard Functionality =====
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

// ===== Load Steps =====
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

// ===== Collapsible Sections =====
function initializeCollapsibleSections() {
    // Main Steps
    document.querySelectorAll('.main-step-header').forEach(header => {
        const mainStep = header.parentElement;
        const mainContent = mainStep.querySelector('.main-step-content');
        const span = header.querySelector('span');

        mainStep.classList.add('collapsed');
        span.textContent = '+';
        span.setAttribute('aria-expanded', 'false');
        mainStep.setAttribute('aria-hidden', 'true');
        mainContent.style.maxHeight = '0';

        header.addEventListener('click', () => {
            const isExpanded = !mainStep.classList.toggle('collapsed');
            span.setAttribute('aria-expanded', isExpanded);
            mainStep.setAttribute('aria-hidden', !isExpanded);
            span.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';
            mainContent.style.maxHeight = isExpanded ? `${mainContent.scrollHeight}px` : '0';
        });
    });

    // Sub-Steps
    document.querySelectorAll('.sub-step-header').forEach(header => {
        const subStep = header.closest('.sub-step');
        const subStepContent = subStep.querySelector('.sub-step-content');
        const subStepSpan = header.querySelector('span');

        subStep.classList.add('collapsed');
        subStepContent.style.maxHeight = '0';

        header.addEventListener('click', () => {
            const isExpanded = !subStep.classList.toggle('collapsed');
            subStepContent.style.maxHeight = isExpanded ? `${subStepContent.scrollHeight}px` : '0';
            subStepSpan.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';
            header.setAttribute('aria-expanded', isExpanded);
        });
    });
}

// ===== Screenshot Toggle =====
function initializeScreenshotToggles() {
    document.querySelectorAll('.screenshot-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const container = toggle.nextElementSibling;
            const isExpanded = !container.classList.toggle('collapsed');
            const icon = toggle.querySelector('.toggle-icon');
            const text = toggle.querySelector('.toggle-text');

            // Update aria attribute
            toggle.setAttribute('aria-collapsed', !isExpanded);

            // Update icon and text
            icon.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';
            text.textContent = isExpanded ? 'Hide Screenshot' : 'Show Screenshot';

            // Update container height
            container.style.maxHeight = isExpanded ? `${container.scrollHeight}px` : '0';
        });
    });
}

// ===== Checklist Functionality =====
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

            if (checklistItems.length === 0) return;

            checklistItems.forEach(item => {
                item.addEventListener('change', () => {
                    const allChecked = Array.from(checklistItems).every(item => item.checked);

                    if (allChecked) {
                        subStepHeader.classList.add('checked');
                        subStep.classList.remove('expanded');
                        subStepContent.style.maxHeight = '0';
                        subStepSpan.style.transform = 'rotate(0deg)';

                        const nextSubStep = subSteps[subIndex + 1];
                        if (nextSubStep) {
                            const nextSubStepHeader = nextSubStep.querySelector('.sub-step-header');
                            const nextSubStepContent = nextSubStep.querySelector('.sub-step-content');
                            const nextSubStepSpan = nextSubStepHeader.querySelector('span');
                            nextSubStep.classList.add('expanded');
                            nextSubStepContent.style.maxHeight = `${nextSubStepContent.scrollHeight}px`;
                            nextSubStepSpan.style.transform = 'rotate(45deg)';
                        }

                        const allSubStepsChecked = Array.from(subSteps).every(subStep => {
                            const subStepHeader = subStep.querySelector('.sub-step-header');
                            return subStepHeader.classList.contains('checked');
                        });

                        if (allSubStepsChecked) {
                            mainStep.classList.add('collapsed');
                            mainStepContent.style.maxHeight = '0';
                            mainStepSpan.style.transform = 'rotate(0deg)';
                            mainStepHeader.classList.add('checked');

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

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    loadSteps();

    document.addEventListener('stepsLoaded', () => {
        document.querySelectorAll('.copy-btn').forEach(setupClipboard);
        initializeCollapsibleSections();
        initializeScreenshotToggles();
        initializeChecklist();
    });
});