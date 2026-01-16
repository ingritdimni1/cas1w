// TechFlow Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navButtons = document.querySelector('.nav-buttons');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');

            // Create mobile menu if it doesn't exist
            let mobileMenu = document.querySelector('.mobile-menu');
            if (!mobileMenu) {
                mobileMenu = document.createElement('div');
                mobileMenu.className = 'mobile-menu';
                mobileMenu.innerHTML = `
                    <ul class="mobile-nav-links">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#how-it-works">How It Works</a></li>
                        <li><a href="#pricing">Pricing</a></li>
                        <li><a href="#testimonials">Testimonials</a></li>
                    </ul>
                    <div class="mobile-nav-buttons">
                        <a href="#" class="btn btn-ghost">Log In</a>
                        <a href="#" class="btn btn-primary">Get Started</a>
                    </div>
                `;
                document.querySelector('.navbar').appendChild(mobileMenu);

                // Add mobile menu styles dynamically
                const style = document.createElement('style');
                style.textContent = `
                    .mobile-menu {
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: white;
                        padding: 1.5rem;
                        border-top: 1px solid #e5e7eb;
                        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                    }
                    .mobile-menu.active {
                        display: block;
                    }
                    .mobile-nav-links {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    }
                    .mobile-nav-links a {
                        font-size: 1rem;
                        font-weight: 500;
                        color: #4b5563;
                        padding: 0.5rem 0;
                    }
                    .mobile-nav-buttons {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    .mobile-menu-btn.active span:nth-child(1) {
                        transform: rotate(45deg) translate(5px, 5px);
                    }
                    .mobile-menu-btn.active span:nth-child(2) {
                        opacity: 0;
                    }
                    .mobile-menu-btn.active span:nth-child(3) {
                        transform: rotate(-45deg) translate(5px, -5px);
                    }
                `;
                document.head.appendChild(style);
            }

            mobileMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    document.addEventListener('click', function(e) {
        if (e.target.closest('.mobile-nav-links a')) {
            const mobileMenu = document.querySelector('.mobile-menu');
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        }
    });

    // Pricing Toggle
    const toggleSwitch = document.querySelector('.toggle-switch');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    const prices = document.querySelectorAll('.price');
    let isAnnual = false;

    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', function() {
            isAnnual = !isAnnual;
            this.classList.toggle('active');

            // Update labels
            toggleLabels.forEach((label, index) => {
                if (isAnnual) {
                    label.classList.toggle('active', index === 1);
                } else {
                    label.classList.toggle('active', index === 0);
                }
            });

            // Update prices with animation
            prices.forEach(price => {
                const monthly = price.dataset.monthly;
                const annual = price.dataset.annual;

                price.style.opacity = '0';
                setTimeout(() => {
                    price.textContent = isAnnual ? annual : monthly;
                    price.style.opacity = '1';
                }, 150);
            });
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            navbar.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScrollY = currentScrollY;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .step, .pricing-card, .testimonial-card');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animationDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    // Add animation styles
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        .feature-card, .step, .pricing-card, .testimonial-card {
            transition: opacity 0.3s ease;
        }
        .animate-fade-in-up {
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(animationStyle);

    // Stats counter animation
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const text = stat.textContent;
            const hasK = text.includes('K');
            const hasM = text.includes('M');
            const hasPercent = text.includes('%');

            let target = parseFloat(text.replace(/[^0-9.]/g, ''));
            let current = 0;
            const increment = target / 50;
            const duration = 1500;
            const stepTime = duration / 50;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }

                let display = Math.floor(current);
                if (hasK) display = current.toFixed(0) + 'K+';
                else if (hasM) display = current.toFixed(0) + 'M+';
                else if (hasPercent) display = current.toFixed(1) + '%';
                else display = current.toFixed(0) + '+';

                stat.textContent = display;
            }, stepTime);
        });
    }

    // Form validation (for future contact forms)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.feature-icon svg').style.transform = 'scale(1.1)';
        });
        card.addEventListener('mouseleave', function() {
            this.querySelector('.feature-icon svg').style.transform = 'scale(1)';
        });
    });

    // Add icon animation styles
    const iconStyle = document.createElement('style');
    iconStyle.textContent = `
        .feature-icon svg {
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(iconStyle);

    console.log('TechFlow website loaded successfully!');
});
