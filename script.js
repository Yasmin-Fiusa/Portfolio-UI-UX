// Custom Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Add a slight delay for the outline
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Add hover effect to links and buttons
    const interactables = document.querySelectorAll('a, button, .project-card, .slider-btn');

    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });
}

// Scroll animations (Intersection Observer)
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Stop observing once revealed
        }
    });
};

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// =========================================================================
//   LIGHTBOX GALLERY LOGIC
// =========================================================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.getElementById('lightbox-close');
const prevBtn = document.getElementById('lightbox-prev');
const nextBtn = document.getElementById('lightbox-next');

let currentGallery = [];
let currentIndex = 0;

// Setup click events on project image containers
const projectWraps = document.querySelectorAll('.project-image-wrap');

projectWraps.forEach(wrap => {
    // === Slider Logic (In-card Navigation) ===
    const images = Array.from(wrap.querySelectorAll('.project-img'));
    
    if (images.length > 1) {
        let currentSlide = 0;
        
        // 1. Create Arrow Buttons
        const leftArrow = document.createElement('button');
        leftArrow.className = 'slider-btn prev-btn';
        leftArrow.innerHTML = '&#10094;'; // <
        
        const rightArrow = document.createElement('button');
        rightArrow.className = 'slider-btn next-btn';
        rightArrow.innerHTML = '&#10095;'; // >
        
        // 2. Create Dots Container
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';
        
        const dots = [];
        
        images.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
            
            // Dot click event
            dot.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevents Lightbox
                goToSlide(idx);
            });
            
            dots.push(dot);
            dotsContainer.appendChild(dot);
        });
        
        // Append elements to wrap
        wrap.appendChild(leftArrow);
        wrap.appendChild(rightArrow);
        wrap.appendChild(dotsContainer);
        
        // Navigation function
        function goToSlide(index) {
            // Hide current
            images[currentSlide].style.display = 'none';
            dots[currentSlide].classList.remove('active');
            
            // Show new
            currentSlide = index;
            images[currentSlide].style.display = 'block';
            dots[currentSlide].classList.add('active');
        }
        
        // Arrow Events
        leftArrow.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents Lightbox
            let newIndex = (currentSlide - 1 + images.length) % images.length;
            goToSlide(newIndex);
        });
        
        rightArrow.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents Lightbox
            let newIndex = (currentSlide + 1) % images.length;
            goToSlide(newIndex);
        });
    }

    // === Lightbox Logic ===
    wrap.addEventListener('click', (e) => {
        // Prevent Lightbox if clicking exactly on overlay button
        if(e.target.closest('.slider-btn') || e.target.closest('.slider-dot')) return;
        
        if (images.length === 0) return;

        currentGallery = images.map(img => img.src);
        
        // Start Lightbox exactly from the image the user is currently looking at in the slider
        const activeImg = wrap.querySelector('.project-img[style*="block"]') || images[0];
        currentIndex = images.indexOf(activeImg) !== -1 ? images.indexOf(activeImg) : 0;

        updateLightboxImage();
        
        // Show/hide navigation buttons if only 1 image
        if (currentGallery.length > 1) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
});

function updateLightboxImage() {
    if (!lightboxImg) return;
    // Fade effect 
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
        lightboxImg.src = currentGallery[currentIndex];
        lightboxImg.style.opacity = 1;
    }, 200);
}

// Close Lightbox
if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        // Close if clicking outside the image (on the modal background)
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Next / Prev navigation
if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentGallery.length > 1) {
            currentIndex = (currentIndex + 1) % currentGallery.length;
            updateLightboxImage();
        }
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentGallery.length > 1) {
            currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
            updateLightboxImage();
        }
    });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight' && currentGallery.length > 1) {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateLightboxImage();
    }
    if (e.key === 'ArrowLeft' && currentGallery.length > 1) {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateLightboxImage();
    }
});
