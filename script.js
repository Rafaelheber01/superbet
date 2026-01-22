// Particles Configuration
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random positioning
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';

        particlesContainer.appendChild(particle);
    }
}

// Global Carousel Logic
class Carousel {
    constructor(elementId, options = {}) {
        this.container = document.getElementById(elementId);
        if (!this.container) return;

        this.track = this.container.querySelector('[id$="Track"]');
        this.slides = Array.from(this.track.children);
        this.nextBtn = this.container.parentElement.querySelector('.next');
        this.prevBtn = this.container.parentElement.querySelector('.prev');
        this.dotsContainer = this.container.parentElement.querySelector('[id$="Dots"]');

        this.currentIndex = 0;
        this.slideWidth = this.slides[0].getBoundingClientRect().width;
        this.autoplayInterval = null;
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;

        this.options = {
            autoplay: true,
            autoplaySpeed: 5000,
            gap: 16,
            ...options
        };

        this.init();
    }

    init() {
        // Create dots if container exists
        if (this.dotsContainer) {
            this.updateDots();
        }

        // Event Listeners
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());

        // Touch events for swipe
        this.track.addEventListener('touchstart', this.touchStart(this));
        this.track.addEventListener('touchend', this.touchEnd(this));
        this.track.addEventListener('touchmove', this.touchMove(this));

        // Window resize
        window.addEventListener('resize', () => {
            this.slideWidth = this.slides[0].getBoundingClientRect().width;
            this.updateSlidePosition();
        });

        // Start autoplay
        if (this.options.autoplay) {
            this.startAutoplay();
            this.container.addEventListener('mouseenter', () => this.stopAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());
        }

        // Initial setup
        this.slides.forEach((slide, index) => {
            slide.style.minWidth = '100%';
            // Add gap logic if needed, simplify for now
        });

        if (this.dotsContainer) {
            Array.from(this.dotsContainer.children).forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
        }
    }

    updateDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }

    updateSlidePosition() {
        const translateX = -(this.currentIndex * 100);
        this.track.style.transform = `translateX(${translateX}%)`;

        // Update dots
        if (this.dotsContainer) {
            const dots = Array.from(this.dotsContainer.children);
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[this.currentIndex]) {
                dots[this.currentIndex].classList.add('active');
            }
        }

        // Update progress bar if exists (tutorial only)
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progress = ((this.currentIndex + 1) / this.slides.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlidePosition();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlidePosition();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlidePosition();
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), this.options.autoplaySpeed);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    // Touch handlers
    touchStart(instance) {
        return function (event) {
            instance.startPos = event.touches[0].clientX;
            instance.isDragging = true;
            instance.stopAutoplay();
        }
    }

    touchMove(instance) {
        return function (event) {
            if (instance.isDragging) {
                const currentPosition = event.touches[0].clientX;
                // Optional: add visual feedback during drag
            }
        }
    }

    touchEnd(instance) {
        return function (event) {
            instance.isDragging = false;
            const movedBy = event.changedTouches[0].clientX - instance.startPos;

            if (movedBy < -100) instance.nextSlide();
            if (movedBy > 100) instance.prevSlide();

            if (instance.options.autoplay) instance.startAutoplay();
        }
    }
}

// Countdown Timer Logic
function startCountdown() {
    // Set duration to 6 hours
    const duration = 6 * 60 * 60 * 1000;
    let endTime = localStorage.getItem('offerEndTime');

    if (!endTime || new Date().getTime() > parseInt(endTime)) {
        endTime = new Date().getTime() + duration;
        localStorage.setItem('offerEndTime', endTime);
    }

    const timerElement = document.querySelector('.timer-digits');

    function updateTimer() {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            // Reset timer for urgency effect
            endTime = new Date().getTime() + duration;
            localStorage.setItem('offerEndTime', endTime);
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerElement.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();

    // Tutorial Carousel
    new Carousel('tutorialCarousel', {
        autoplaySpeed: 4000
    });

    // Proofs Carousel - Scroll horizontal simples
    const proofsTrack = document.getElementById('proofsTrack');
    const proofsPrevBtn = document.getElementById('proofsPrevBtn');
    const proofsNextBtn = document.getElementById('proofsNextBtn');

    if (proofsTrack && proofsNextBtn && proofsPrevBtn) {
        const scrollAmount = 240; // Largura do card (220px) + gap (20px)

        proofsNextBtn.addEventListener('click', () => {
            proofsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        proofsPrevBtn.addEventListener('click', () => {
            proofsTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    // Start Countdown
    startCountdown();
});

// Scroll Animation Observer
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.step-card, .proof-card, .cta-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
