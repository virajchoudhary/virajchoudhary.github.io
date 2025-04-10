document.addEventListener('DOMContentLoaded', () => {

    try {
        const navigationEntries = performance.getEntriesByType("navigation");
        if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
            if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('/index.html')) {
                console.warn("Non-standard refresh behavior: Redirecting to home page.");
                window.location.href = 'index.html';
            }
        }
        else if (window.performance && performance.navigation && performance.navigation.type === performance.navigation.TYPE_RELOAD) {
            if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('/index.html')) {
                console.warn("Non-standard refresh behavior (fallback): Redirecting to home page.");
                window.location.href = 'index.html';
            }
        }
    } catch (e) {
        console.error("Error checking navigation type for refresh redirect:", e);
    }


    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                const children = entry.target.querySelectorAll('.reveal-child');
                let baseDelay = parseFloat(entry.target.style.transitionDelay || 0);
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${(index * 0.1) + baseDelay + 0.1}s`;
                });

                observer.unobserve(entry.target);
            }
        });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    const elementsToReveal = document.querySelectorAll('.reveal-fade-in');
    elementsToReveal.forEach(el => {
        intersectionObserver.observe(el);
    });


    const header = document.getElementById('site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    document.body.classList.add('loaded');

});