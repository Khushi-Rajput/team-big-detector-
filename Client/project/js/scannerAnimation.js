/**
 * Interactive Hero ATS Scanner Animation & 3D Tilt HUD
 * Inspired by the reference machine and modern AI SaaS interfaces.
 */

export function initScannerAnimation() {
    const scannerMachine = document.getElementById('atsScannerMachine');
    const dialNeedle = document.getElementById('dialNeedle');
    const consoleScore = document.getElementById('consoleScore');
    const consoleProgressBar = document.getElementById('consoleProgressBar');
    const highlightElements = document.querySelectorAll('.highlight-pill');

    if (!scannerMachine) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Subtle 3D Perspective Parallax on Mouse Move
    if (!prefersReducedMotion) {
        const visualWrapper = document.querySelector('.hero-visual-wrapper');
        if (visualWrapper) {
            visualWrapper.addEventListener('mousemove', (e) => {
                const rect = visualWrapper.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Restrained angles (max ~5 degrees)
                const rotateY = (x / (rect.width / 2)) * 5;
                const rotateX = -(y / (rect.height / 2)) * 5;

                scannerMachine.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            visualWrapper.addEventListener('mouseleave', () => {
                scannerMachine.style.transform = 'rotateX(0deg) rotateY(0deg)';
            });
        }
    }

    // 2. Continuous Timed Scanner Loop (Simulating scan phases)
    let scanCycle = 0;
    const scores = [88, 92, 95, 89];

    function runMachineCycle() {
        if (prefersReducedMotion) return;

        scanCycle = (scanCycle + 1) % scores.length;
        const targetScore = scores[scanCycle];

        // Animate Analog Gauge Needle (-45deg to +45deg)
        if (dialNeedle) {
            const needleAngle = -40 + (targetScore / 100) * 80;
            dialNeedle.style.transform = `rotate(${needleAngle}deg)`;
        }

        // Pulse Highlights sequentially
        highlightElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.5)';
                setTimeout(() => {
                    el.style.boxShadow = 'none';
                }, 1200);
            }, index * 400);
        });

        // Update Console Score
        if (consoleScore) {
            consoleScore.textContent = `${targetScore}/100`;
        }

        if (consoleProgressBar) {
            consoleProgressBar.style.width = `${targetScore}%`;
        }
    }

    // Interval to coordinate scanner cycles every 4.5 seconds
    const intervalId = setInterval(runMachineCycle, 4500);
    // Initial run
    runMachineCycle();

    return () => clearInterval(intervalId);
}
