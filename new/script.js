// Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        navbar.classList.toggle('mobile-menu-open');
      });

      // Close menu when clicking links
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
          navbar.classList.remove('mobile-menu-open');
        });
      });
    }

    // Page Load Animations
    window.addEventListener('load', () => {
      setTimeout(() => {
        const bgImage = document.querySelector('.bg-image');
        if (bgImage) bgImage.classList.add('loaded');
      }, 100);

      setTimeout(() => {
        const elements = ['.left-content', '.right-image', '.btn-group'];
        elements.forEach(selector => {
          const el = document.querySelector(selector);
          if (el) el.classList.add('show');
        });
      }, 600);

      handleScrollEffects();
      startAutoScroll();
      setupGamingTextAnimation();
    });

    // Gaming Text Animation System
    function setupGamingTextAnimation() {
      // Select headers, titles, buttons, AND the hero paragraph
      const targets = document.querySelectorAll(`
        h1:not(.processed),
        h2:not(.processed),
        h3:not(.processed),
        .course-main-title:not(.processed),
        .course-tag:not(.processed),
        .tag-line:not(.processed),
        .section-tagline:not(.processed),
        .btn-primary:not(.processed),
        .left-content p:not(.processed)
      `);

      targets.forEach(el => {
        el.classList.add('processed');
        const hasManualSpans = el.querySelector('.gaming-char');

        if (!hasManualSpans) {
          const originalHTML = el.innerHTML;
          const hasNestedSpan = el.querySelector('span');

          if (hasNestedSpan) {
            // Complex case: nested spans (like headers with colors)
            const walker = document.createTreeWalker(
              el,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
              // Preserve contentful text nodes
              if (node.textContent.length > 0 && !/^\s*[\r\n]+\s*$/.test(node.textContent)) {
                textNodes.push(node);
              }
            }

            let charIndex = 0;
            textNodes.forEach(textNode => {
              const text = textNode.textContent;
              const fragment = document.createDocumentFragment();

              [...text].forEach((char) => {
                if (/[\r\n\t]/.test(char)) {
                  fragment.appendChild(document.createTextNode(char));
                  return;
                }

                if (char === ' ') {
                  // Insert regular space text node logic
                  fragment.appendChild(document.createTextNode(' '));
                  charIndex++;
                } else {
                  const span = document.createElement('span');
                  span.textContent = char;
                  span.className = 'gaming-char';
                  span.style.setProperty('--i', charIndex);
                  fragment.appendChild(span);
                  charIndex++;
                }
              });

              textNode.parentNode.replaceChild(fragment, textNode);
            });
          } else {
            // Simple text wrapping
            const text = el.textContent.trim();
            el.innerHTML = '';
            [...text].forEach((char, index) => {
              if (char === ' ') {
                el.appendChild(document.createTextNode(' '));
              } else {
                const span = document.createElement('span');
                span.textContent = char;
                span.className = 'gaming-char';
                span.style.setProperty('--i', index);
                el.appendChild(span);
              }
            });
          }
        }
      });

      // IntersectionObserver
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          } else {
            entry.target.classList.remove('reveal-active');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      });

      document.querySelectorAll('.processed').forEach(el => observer.observe(el));
    }

    // Scroll Effects Handler
    const handleScrollEffects = () => {
      const nav = document.querySelector('.navbar');
      if (nav) {
        window.scrollY > 100 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');
      }

      const flipElements = document.querySelectorAll('.flip-reveal');
      const windowHeight = window.innerHeight;

      flipElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distanceFromCenter = Math.abs(viewportCenter - elementCenter);
        const maxDistance = windowHeight / 1.5;
        const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
        const scale = 1 - (0.15 * normalizedDistance);
        const rotation = -10 * normalizedDistance;
        const translateY = normalizedDistance * 40;
        const opacity = 1 - normalizedDistance;

        if (rect.top < windowHeight && rect.bottom > 0) {
          el.classList.add('active');
          el.style.transform = `scale(${scale}) rotateX(${rotation}deg) translateY(${translateY}px)`;
          el.style.opacity = opacity + 0.2;
        } else {
          el.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(handleScrollEffects);
    });

    // Horizontal Scroll Course Section
    window.addEventListener('scroll', () => {
      const wrapper = document.querySelector('.sticky-wrapper');
      const track = document.getElementById('courseTrack');
      const progress = document.getElementById('progressSegment');

      if (!wrapper || !track) return;

      const wrapperTop = wrapper.offsetTop;
      const wrapperHeight = wrapper.offsetHeight;
      const viewportHeight = window.innerHeight;

      let scrollFraction = (window.scrollY - wrapperTop) / (wrapperHeight - viewportHeight);
      scrollFraction = Math.max(0, Math.min(1, scrollFraction));

      const maxMove = track.scrollWidth - window.innerWidth;
      if (maxMove > 0) {
        track.style.transform = `translateX(-${scrollFraction * maxMove}px)`;
      }

      if (progress) progress.style.width = `${scrollFraction * 100}%`;
    });

    // Placed Students Auto-Scroll
    const psTrack = document.getElementById('autoTrack');
    const psProgressFill = document.querySelector('.progress-fill');
    const psCurrentNum = document.getElementById('current-number');
    const psCards = document.querySelectorAll('.placed-students-card');

    let psScrollPos = 0;
    let psIsPaused = false;

    if (psTrack) {
      psTrack.addEventListener('mouseenter', () => psIsPaused = true);
      psTrack.addEventListener('mouseleave', () => psIsPaused = false);
    }

    function startAutoScroll() {
      if (!psTrack) return;

      if (!psIsPaused) {
        psScrollPos += 1;
        const halfWidth = psTrack.scrollWidth / 2;
        if (psScrollPos >= halfWidth) psScrollPos = 0;
        psTrack.style.transform = `translateX(-${psScrollPos}px)`;
        updatePlacedStudentsUI(psScrollPos, halfWidth);
      }
      requestAnimationFrame(startAutoScroll);
    }

    function updatePlacedStudentsUI(pos, max) {
      if (psProgressFill) {
        const percentage = (pos / max) * 100;
        psProgressFill.style.width = `${percentage}%`;
      }
      psCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.left > 0 && rect.left < 250) {
          const index = card.getAttribute('data-index');
          if (index && psCurrentNum) psCurrentNum.innerText = index;
        }
      });
    }
    document.addEventListener('DOMContentLoaded', function () {
      const cards = document.querySelectorAll('.card');

      // Add click event to each card to mark it as active
      cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
          this.classList.add('card-active');
        });

        card.addEventListener('mouseleave', function () {
          this.classList.remove('card-active');
        });
      });

      // Close card when clicking anywhere outside
      document.addEventListener('click', function (event) {
        const clickedCard = event.target.closest('.card');

        // If click is outside all cards, remove hover state from all cards
        if (!clickedCard) {
          cards.forEach(card => {
            card.classList.remove('card-active');
            // Force remove hover state by triggering a reflow
            card.style.pointerEvents = 'none';
            setTimeout(() => {
              card.style.pointerEvents = 'auto';
            }, 10);
          });
        }
      });

      // Alternative: Close on touch for mobile devices
      document.addEventListener('touchstart', function (event) {
        const clickedCard = event.target.closest('.card');

        if (!clickedCard) {
          cards.forEach(card => {
            card.classList.remove('card-active');
            card.style.pointerEvents = 'none';
            setTimeout(() => {
              card.style.pointerEvents = 'auto';
            }, 10);
          });
        }
      });
    });
    // ......