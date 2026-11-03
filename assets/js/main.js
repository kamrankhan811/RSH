/* Rasheed Surgical Hospital Lodhran: homepage interactions. No dependencies. */
(function () {
	'use strict';

	// Footer year.
	document.querySelectorAll('[data-year]').forEach(function (el) {
		el.textContent = new Date().getFullYear();
	});

	// Mobile navigation.
	var toggle = document.querySelector('.nav-toggle');
	var nav = document.getElementById('primary-nav');
	var desktop = window.matchMedia('(min-width: 960px)');

	function setNav(open) {
		if (!toggle || !nav) { return; }
		toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		nav.classList.toggle('is-open', open);
	}

	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			setNav(toggle.getAttribute('aria-expanded') !== 'true');
		});
		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && nav.classList.contains('is-open')) {
				setNav(false);
				toggle.focus();
			}
		});
		nav.addEventListener('click', function (event) {
			if (event.target.closest('a')) { setNav(false); }
		});
		var onChange = function (e) { if (e.matches) { setNav(false); } };
		if (desktop.addEventListener) { desktop.addEventListener('change', onChange); }
		else if (desktop.addListener) { desktop.addListener(onChange); }
	}

	// Doctors carousel: scroll by one card, buttons hide when not needed.
	var track = document.querySelector('[data-carousel-track]');
	var prev = document.querySelector('[data-carousel-prev]');
	var next = document.querySelector('[data-carousel-next]');

	if (track && prev && next) {
		var step = function () {
			var card = track.querySelector('.doc');
			return card ? card.getBoundingClientRect().width + 18 : track.clientWidth;
		};
		var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var go = function (dir) {
			track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
		};
		prev.addEventListener('click', function () { go(-1); });
		next.addEventListener('click', function () { go(1); });

		var update = function () {
			var max = track.scrollWidth - track.clientWidth - 2;
			prev.disabled = track.scrollLeft <= 2;
			next.disabled = track.scrollLeft >= max;
		};
		track.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		update();
	}

	// Hero slider: fade, dots, prev/next, pause button, swipe, arrow keys.
	// Autoplay stops on hover/focus and never starts for reduced-motion users (WCAG 2.2.2).
	var slider = document.querySelector('[data-slider]');
	if (slider) {
		var slides = slider.querySelectorAll('.slide');
		var dots = slider.querySelectorAll('[data-slider-dot]');
		var toggleBtn = slider.querySelector('[data-slider-toggle]');
		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var current = 0;
		var timer = null;
		var paused = reduceMotion; // user choice via the pause button
		var held = false;          // temporary hold while hovered or focused

		var show = function (index) {
			current = (index + slides.length) % slides.length;
			slides.forEach(function (slide, i) {
				var active = i === current;
				slide.classList.toggle('is-active', active);
				if (active) {
					slide.removeAttribute('aria-hidden');
					slide.removeAttribute('inert');
				} else {
					slide.setAttribute('aria-hidden', 'true');
					slide.setAttribute('inert', '');
				}
			});
			dots.forEach(function (dot, i) {
				if (i === current) { dot.setAttribute('aria-current', 'true'); }
				else { dot.removeAttribute('aria-current'); }
			});
		};

		var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
		var start = function () {
			stop();
			if (!paused && !held) { timer = setInterval(function () { show(current + 1); }, 6000); }
		};
		var setPaused = function (value) {
			paused = value;
			if (toggleBtn) {
				toggleBtn.setAttribute('data-paused', value ? 'true' : 'false');
				toggleBtn.setAttribute('aria-label', value ? 'Play slideshow' : 'Pause slideshow');
			}
			start();
		};

		slider.querySelector('[data-slider-prev]').addEventListener('click', function () { show(current - 1); start(); });
		slider.querySelector('[data-slider-next]').addEventListener('click', function () { show(current + 1); start(); });
		dots.forEach(function (dot) {
			dot.addEventListener('click', function () { show(parseInt(dot.getAttribute('data-slider-dot'), 10)); start(); });
		});
		if (toggleBtn) { toggleBtn.addEventListener('click', function () { setPaused(!paused); }); }

		slider.addEventListener('mouseenter', function () { held = true; stop(); });
		slider.addEventListener('mouseleave', function () { held = false; start(); });
		slider.addEventListener('focusin', function () { held = true; stop(); });
		slider.addEventListener('focusout', function (e) {
			if (!slider.contains(e.relatedTarget)) { held = false; start(); }
		});
		slider.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowLeft') { show(current - 1); }
			if (e.key === 'ArrowRight') { show(current + 1); }
		});

		var touchX = null;
		slider.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
		slider.addEventListener('touchend', function (e) {
			if (touchX === null) { return; }
			var dx = e.changedTouches[0].clientX - touchX;
			if (Math.abs(dx) > 50) { show(current + (dx < 0 ? 1 : -1)); start(); }
			touchX = null;
		}, { passive: true });

		show(0);
		setPaused(paused);
	}
})();
