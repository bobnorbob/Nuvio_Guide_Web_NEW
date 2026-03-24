// Dark mode toggle
document.querySelector('.toggle-btn').onclick = () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.toggle-btn').textContent =
        document.body.classList.contains('dark-mode') ? 'Disable Dark Mode' : 'Enable Dark Mode';
};

// Collapsible sections
document.addEventListener('DOMContentLoaded', () => {
    // Load steps
    loadSteps();

    // Initialize collapsible functionality after steps are loaded
    document.addEventListener('stepsLoaded', initializeCollapsible);
});

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
    // Get all headers and add click event listeners
    document.querySelectorAll('.main-step-header, .sub-step-header').forEach(header => {
        // Initialize step state
        const step = header.parentElement;
        const content = step.querySelector('.main-step-content, .sub-step-content');
        const span = header.querySelector('span');

        // Set initial state
        step.classList.add('collapsed');
        span.textContent = '▶'; // Right-pointing arrow as base
        span.setAttribute('aria-expanded', 'false');
        step.setAttribute('aria-hidden', 'true');
            content.style.maxHeight = '0';
        // Click handler with animation
        header.onclick = () => {
            // Toggle collapsed state
            const isCollapsed = step.classList.toggle('collapsed');

            // Update ARIA attributes
            span.setAttribute('aria-expanded', !isCollapsed);
            step.setAttribute('aria-hidden', isCollapsed);

            // Animate content
            animateContent(content, isCollapsed);

            // Update parent containers if needed
                        if (step.classList.contains('sub-step')) {
                updateParentMainStep(step);
            }
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

