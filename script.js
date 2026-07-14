// ============================================
// SAYLLON RIBEIRO — Booking System + UI
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    // Scroll Reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.revealDelay;
                if (delay) {
                    setTimeout(() => entry.target.classList.add('revealed'), parseInt(delay));
                } else {
                    entry.target.classList.add('revealed');
                }
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

    // Header scroll
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 80);
    });

    // Mobile menu
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('nav--open');
        hamburger.classList.toggle('hamburger--active');
    });
    document.querySelectorAll('.nav__link').forEach(l => {
        l.addEventListener('click', () => {
            nav.classList.remove('nav--open');
            hamburger.classList.remove('hamburger--active');
        });
    });
    document.addEventListener('click', e => {
        if (!header.contains(e.target) && nav.classList.contains('nav--open')) {
            nav.classList.remove('nav--open');
            hamburger.classList.remove('hamburger--active');
        }
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const h = this.getAttribute('href');
            if (h === '#') return;
            e.preventDefault();
            const t = document.querySelector(h);
            if (t) window.scrollTo({top: t.getBoundingClientRect().top + window.pageYOffset - 70, behavior:'smooth'});
        });
    });

    // Date input: set min to today
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});

// ===== BOOKING SYSTEM =====
let bookingState = { servico: null, unidade: null, data: null, hora: null, preco: 0 };
let currentStep = 1;
const TOTAL_STEPS = 4;

function openBookingModal() {
    document.getElementById('bookingOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    resetBooking();
}

function closeBookingModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('bookingOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ESC key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('bookingOverlay');
        if (overlay.classList.contains('active')) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

function resetBooking() {
    bookingState = { servico: null, unidade: null, data: null, hora: null, preco: 0 };
    currentStep = 1;
    showStep(1);
}

function showStep(step) {
    document.querySelectorAll('.booking-step').forEach(el => el.style.display = 'none');
    const el = document.querySelector(`.booking-step[data-step="${step}"]`);
    if (el) el.style.display = 'block';

    // Dots
    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i < step);
    });

    // Back button
    document.getElementById('bookingBack').style.display = step > 1 ? 'block' : 'none';

    currentStep = step;
}

function nextBookingStep() {
    if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
}

function prevBookingStep() {
    if (currentStep > 1) showStep(currentStep - 1);
}

// Step 1: Select servico
document.addEventListener('click', e => {
    const btn = e.target.closest('#servicoOptions .booking-opcao');
    if (!btn) return;
    document.querySelectorAll('#servicoOptions .booking-opcao').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    bookingState.servico = btn.dataset.value;
    bookingState.preco = parseInt(btn.dataset.preco);
    nextBookingStep();
});

// Step 2: Select unidade
document.addEventListener('click', e => {
    const btn = e.target.closest('#unidadeOptions .booking-opcao');
    if (!btn) return;
    document.querySelectorAll('#unidadeOptions .booking-opcao').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    bookingState.unidade = btn.dataset.value;
    nextBookingStep();
});

// Step 3: Date + time
document.addEventListener('click', e => {
    const btn = e.target.closest('.booking-horario');
    if (!btn) return;
    document.querySelectorAll('.booking-horario').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    bookingState.hora = btn.dataset.time;
});

document.getElementById('bookingDate')?.addEventListener('change', function() {
    bookingState.data = this.value;
    checkStep3Complete();
});

function checkStep3Complete() {
    if (bookingState.data && bookingState.hora) {
        updateResumo();
        nextBookingStep();
    }
}

// Watch time selection to trigger step 4
const timeObserver = new MutationObserver(() => {
    const selected = document.querySelector('.booking-horario.selected');
    if (selected && bookingState.data && currentStep === 3) {
        checkStep3Complete();
    }
});
const horariosContainer = document.getElementById('horariosContainer');
if (horariosContainer) {
    timeObserver.observe(horariosContainer, { childList: true, subtree: true, attributes: true });
}

// Fix: also trigger on click
document.addEventListener('click', e => {
    const btn = e.target.closest('.booking-horario');
    if (btn && bookingState.data && currentStep === 3) {
        setTimeout(checkStep3Complete, 50);
    }
});

function updateResumo() {
    const nomes = {
        corte:'Corte Masculino', barba:'Barba Completa', 'combo-corte-barba':'Corte + Barba',
        hidratacao:'Hidratacao', 'corte-infantil':'Corte Infantil', 'combo-completo':'Combo Completo'
    };
    const unid = { 'vila-margarida':'Vila Margarida', orla:'Orla Morena' };
    document.getElementById('resServico').textContent = nomes[bookingState.servico] || bookingState.servico;
    document.getElementById('resUnidade').textContent = unid[bookingState.unidade] || bookingState.unidade;
    document.getElementById('resData').textContent = bookingState.data || '—';
    document.getElementById('resHora').textContent = bookingState.hora || '—';
    document.getElementById('resPreco').textContent = `R$ ${bookingState.preco}`;

    // Update WhatsApp link
    const msg = `Olá! Gostaria de agendar:%0A%0A✂️ *${nomes[bookingState.servico] || bookingState.servico}*%0A📍 ${unid[bookingState.unidade] || bookingState.unidade}%0A📅 ${bookingState.data} às ${bookingState.hora}%0A💰 R$ ${bookingState.preco}`;
    document.getElementById('bookingConfirmBtn').href = `https://wa.me/5567993227005?text=${msg}`;
}

// Keyboard: Enter to next step
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('bookingOverlay').classList.contains('active')) {
        // Only if modal is open
    }
});

console.log('✦ Sayllon Ribeiro Barbearia carregado!');
