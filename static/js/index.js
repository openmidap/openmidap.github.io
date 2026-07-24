window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Release waitlist modal — opened by any "Join Waitlist" trigger (top-right button, etc.).
function openWaitlist() {
    const modal = document.getElementById('waitlistModal');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const email = document.getElementById('wl-email');
    if (email) email.focus();
}

function closeWaitlist() {
    const modal = document.getElementById('waitlistModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    // Reset the form + validation/status state so the popup opens clean next time.
    const form = modal.querySelector('.release-form');
    if (form) {
        form.reset();
        const status = form.querySelector('.release-form-status');
        if (status) { status.textContent = ''; status.className = 'release-form-status'; }
        const err = form.querySelector('.field-error');
        if (err) { err.textContent = ''; err.classList.remove('is-visible'); }
        form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Auto-open the waitlist popup once per browser session, so a first-time visitor can
// sign up immediately. It does NOT reopen on later reloads in the same session; a fresh
// session (or cleared sessionStorage) shows it again. No-op on pages without the modal.
function maybeAutoOpenWaitlist() {
    if (!document.getElementById('waitlistModal')) return;
    try {
        if (sessionStorage.getItem('waitlistAutoShown') === '1') return;
        sessionStorage.setItem('waitlistAutoShown', '1');
    } catch (e) { /* storage blocked (private mode): fall through and open this once */ }
    openWaitlist();
}

// Close the waitlist modal on Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeWaitlist();
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Copy a code / command block to the clipboard (Quickstart, reproduction, etc.)
// Reusable: attach with onclick="copyCode(this)" and either a data-copy-target
// selector or a sibling <pre> inside a .code-block wrapper.
function copyCode(btn) {
    const sel = btn.getAttribute('data-copy-target');
    let target = sel ? document.querySelector(sel) : null;
    if (!target) {
        const wrap = btn.closest('.code-block') || btn.parentElement;
        target = wrap ? (wrap.querySelector('pre code') || wrap.querySelector('pre')) : null;
    }
    if (!target) return;

    const text = target.innerText;
    const label = btn.querySelector('.copy-code-text');
    const done = function () {
        btn.classList.add('copied');
        if (label) label.textContent = 'Copied!';
        setTimeout(function () {
            btn.classList.remove('copied');
            if (label) label.textContent = 'Copy';
        }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
            fallbackCopy(text);
            done();
        });
    } else {
        fallbackCopy(text);
        done();
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

// ============================================================
// Full-stack flow — interactive SVG pipeline (focus mode).
// Selecting a node highlights it + its inputs/outputs, dims the
// rest, and shows its description + connections in the side panel.
// The node array N + edge array E are the single source of truth
// (module descriptions live here, not duplicated in the HTML).
// ============================================================
function buildFsFlow() {
    var board = document.getElementById('fsflow');
    var panel = document.getElementById('fspanel');
    if (!board || !panel) return;

    var SVGNS = 'http://www.w3.org/2000/svg';
    var el = function (name, attrs) {
        var e = document.createElementNS(SVGNS, name);
        attrs = attrs || {};
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        return e;
    };
    var esc = function (s) {
        return (s || '').replace(/[&<>]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
        });
    };

    var GROUPS = {
        in:      'Input',
        compile: 'Compiler pass',
        codegen: 'Codegen',
        art:     'Artifact',
        sim:     'Simulator',
        hw:      'Hardware'
    };

    // Node model — coordinates are in the 0 0 680 610 viewBox.
    var N = [
        { id: 'onnx', g: 'in', l: 'ONNX', s: 'int8 · ONNX dialect', x: 60, y: 16, w: 180, h: 40,
          d: 'A quantized int8 DNN in the ONNX format is the input to the whole stack. It is first imported into MLIR as the ONNX dialect, the form the MIDAP HLC compiler actually consumes. Every downstream IR, the microcode and all four execution paths are derived from it.' },
        { id: 'm1', g: 'compile', l: 'ONNX → TOSA', s: '+ operator fusion', x: 60, y: 94, w: 180, h: 46, xin: ['System spec'],
          d: 'Lowers the quantized ONNX operators to the TOSA dialect, then fuses adjacent ops (convolution, activation, reduction) into MIDAP’s coarser-grained L1 layer operations. Fusion lets a whole layer stream through the datapath in one pass, so intermediate feature maps stay on-chip instead of spilling to DRAM.' },
        { id: 'fused', g: 'art', l: 'Fused IR', s: '', x: 85, y: 152, w: 130, h: 30,
          d: 'Timing-independent fused L1 layer operations in the TOSA-derived IR. Produced by ONNX → TOSA + fusion and consumed by Op tiling + memory compile.' },
        { id: 'm2', g: 'compile', l: 'Op tiling', s: '+ memory compile', x: 60, y: 196, w: 180, h: 46, xin: ['System spec'],
          d: 'Splits each fused layer into tiles sized for MIDAP’s on-chip SRAM, then assigns every tile to a specific memory bank in advance. Each tile is therefore already in fast on-chip memory, right where the compute core will read it.' },
        { id: 'l1', g: 'art', l: 'MIDAP L1 inst.', s: '', x: 85, y: 254, w: 130, h: 30,
          d: 'Tile-level L1 instructions bound to specific SRAM banks but still timing-independent. Produced by Op tiling + memory compile and consumed by L1 → L2.' },
        { id: 'm3', g: 'compile', l: 'L1 → L2', s: 'lowering', x: 60, y: 298, w: 180, h: 46, xin: ['HW module info'],
          d: 'Lowers each timing-independent L1 layer or DMA op into the timing-aware L2 IR. The L2 IR is a schedule of explicit config, run and wait operations that set when the core computes and when it stalls on DMA.' },
        { id: 'l2', g: 'art', l: 'MIDAP L2 inst.', s: '', x: 85, y: 356, w: 130, h: 30,
          d: 'The timing-aware L2 instruction stream of explicit config, run and wait operations. Produced by L1 → L2, then run directly by the HL simulator and lowered to microcode by codegen.' },
        { id: 'm4', g: 'codegen', l: 'L2 → Microcode', s: 'codegen', x: 60, y: 430, w: 180, h: 46,
          d: 'Generates the hardware microcode from the L2 instruction stream. The microcode is the exact set of control words the NPU executes. It runs on the low-level simulator, the RTL simulator and the FPGA.' },
        { id: 'mc', g: 'art', l: 'Microcode', s: '', x: 85, y: 488, w: 130, h: 30,
          d: 'The hardware microcode, the exact control words the NPU executes. Produced by L2 → Microcode and run by the LL simulator, the RTL simulator and the FPGA.' },
        { id: 'hlsim', g: 'sim', l: 'Python HL Simulator', s: 'high-level · cycle-accurate', x: 430, y: 336, w: 196, h: 48, out: ['Performance estimation', 'Verification'],
          d: 'The high-level cycle-accurate simulator. It models the datapath, DRAM traffic and stalls cycle by cycle as it runs the L2 instruction stream. The simulator reports end-to-end latency plus a per-stage bottleneck breakdown. The RTL and FPGA runs are cross-validated against its predicted cycles.' },
        { id: 'llsim', g: 'sim', l: 'Python LL Simulator', s: 'low-level · microcode', x: 430, y: 430, w: 196, h: 46, out: ['Verification'],
          d: 'The low-level Python simulator. It runs the generated microcode instruction by instruction at the microcode level, checking functional correctness and producing the golden result before any RTL or hardware run.' },
        { id: 'rtlsim', g: 'hw', l: 'RTL Simulator', s: 'Synopsys VCS', x: 430, y: 486, w: 196, h: 46, out: ['Performance estimation', 'Verification'],
          d: 'Runs the identical microcode on MIDAP’s RTL in a Synopsys VCS simulation, exercising the real hardware description (adder-tree core, on-chip memory, AXI/APB, IBEX control core) at the signal level. Its cycle-accurate results are compared against the HL simulator’s predictions to confirm the model matches the hardware.' },
        { id: 'fpga', g: 'hw', l: 'FPGA', s: 'Xilinx KCU1500', x: 430, y: 542, w: 196, h: 46, out: ['Performance estimation', 'Verification'],
          d: 'Maps the MIDAP design onto a Xilinx KCU1500 FPGA and runs the same microcode on real hardware at speed. As the final validation level, the FPGA run confirms that the design works on a physical device and that its measured cycles line up with the simulator and RTL.' }
    ];
    var byId = {};
    N.forEach(function (m) { byId[m.id] = m; });

    var E = [
        ['onnx', 'm1'], ['m1', 'fused'], ['fused', 'm2'], ['m2', 'l1'], ['l1', 'm3'],
        ['m3', 'l2'], ['l2', 'm4'], ['l2', 'hlsim'], ['m4', 'mc'],
        ['mc', 'llsim'], ['mc', 'rtlsim'], ['mc', 'fpga']
    ];

    // ---- SVG scaffold ----
    var VBW = 680, VBH = 610;
    while (board.firstChild && board.firstChild.nodeName !== 'NOSCRIPT') {
        board.removeChild(board.firstChild);
    }
    var svg = el('svg', { viewBox: '0 0 ' + VBW + ' ' + VBH, role: 'presentation', 'class': 'fsflow-svg' });

    var defs = el('defs');
    [['fsarrow', 'var(--text-light)'], ['fsarrowH', 'var(--primary-color)']].forEach(function (a) {
        var mk = el('marker', { id: a[0], viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
        mk.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: a[1] }));
        defs.appendChild(mk);
    });
    svg.appendChild(defs);

    // Decorative layer: MIDAP HLC container, "COMPILE" rail, Simulate/Emulate verbs.
    var deco = el('g', { 'class': 'fsdeco' });
    deco.appendChild(el('rect', { x: 42, y: 70, width: 216, height: 328, rx: 14, 'class': 'fs-hlc' }));
    var hlc = el('text', { x: 56, y: 90, 'class': 'fs-hlc-label' }); hlc.textContent = 'MIDAP HLC'; deco.appendChild(hlc);
    var rail = el('text', { x: 24, y: 236, 'class': 'fs-rail', transform: 'rotate(-90 24 236)' }); rail.textContent = 'COMPILE'; deco.appendChild(rail);
    svg.appendChild(deco);

    // ---- edges ----
    var anchor = function (m, side) {
        return side === 'r' ? { x: m.x + m.w, y: m.y + m.h / 2 }
             : side === 'l' ? { x: m.x, y: m.y + m.h / 2 }
             : side === 't' ? { x: m.x + m.w / 2, y: m.y }
             : { x: m.x + m.w / 2, y: m.y + m.h };
    };
    var dpath = function (a, b) {
        var s, e;
        if (b.x >= a.x + a.w - 4) { s = anchor(a, 'r'); e = anchor(b, 'l'); }
        else if (a.x >= b.x + b.w - 4) { s = anchor(a, 'l'); e = anchor(b, 'r'); }
        else { s = anchor(a, 'b'); e = anchor(b, 't'); }
        if (Math.abs(e.x - s.x) > Math.abs(e.y - s.y)) {
            var dx = Math.max(24, Math.abs(e.x - s.x) * 0.4);
            return 'M' + s.x + ',' + s.y + ' C' + (s.x + dx) + ',' + s.y + ' ' + (e.x - dx) + ',' + e.y + ' ' + e.x + ',' + e.y;
        }
        var dy = Math.max(16, Math.abs(e.y - s.y) * 0.4);
        return 'M' + s.x + ',' + s.y + ' C' + s.x + ',' + (s.y + dy) + ' ' + e.x + ',' + (e.y - dy) + ' ' + e.x + ',' + e.y;
    };
    var edgeG = el('g', { 'class': 'fsedges' });
    var edgeEls = [];
    E.forEach(function (pair) {
        var a = byId[pair[0]], b = byId[pair[1]];
        if (!a || !b) return;
        var p = el('path', { 'class': 'fsedge', d: dpath(a, b), 'marker-end': 'url(#fsarrow)' });
        p.dataset.f = pair[0]; p.dataset.t = pair[1];
        edgeG.appendChild(p); edgeEls.push(p);
    });
    svg.appendChild(edgeG);

    // ---- nodes ----
    var nodeEls = {};
    var nodeG = el('g', { 'class': 'fsnodes' });
    N.forEach(function (m) {
        var g = el('g', { 'class': 'fsnode fsnode--' + m.g, tabindex: '0', role: 'button', 'aria-label': m.l + (m.s ? ', ' + m.s : '') });
        g.dataset.id = m.id;
        g.appendChild(el('rect', { x: m.x, y: m.y, width: m.w, height: m.h, rx: (m.g === 'art' ? 15 : 10) }));
        var t1 = el('text', { x: m.x + m.w / 2, y: m.y + (m.s ? m.h / 2 - 3 : m.h / 2 + 1), 'class': 'fsn-l', 'text-anchor': 'middle' });
        t1.textContent = m.l; g.appendChild(t1);
        if (m.s) {
            var t2 = el('text', { x: m.x + m.w / 2, y: m.y + m.h / 2 + 12, 'class': 'fsn-s', 'text-anchor': 'middle' });
            t2.textContent = m.s; g.appendChild(t2);
        }
        nodeG.appendChild(g); nodeEls[m.id] = g;
    });
    svg.appendChild(nodeG);
    board.insertBefore(svg, board.firstChild);

    // ---- interaction ----
    var pinned = false, cur = null;
    var neighbors = function (id) {
        var set = {}; set[id] = true;
        edgeEls.forEach(function (p) {
            if (p.dataset.f === id) set[p.dataset.t] = true;
            if (p.dataset.t === id) set[p.dataset.f] = true;
        });
        return set;
    };
    var clearHi = function () {
        N.forEach(function (m) { nodeEls[m.id].classList.remove('dim', 'hot', 'lit'); });
        edgeEls.forEach(function (p) { p.classList.remove('hot', 'dim'); p.setAttribute('marker-end', 'url(#fsarrow)'); });
    };
    var applyHi = function (id) {
        clearHi();
        var set = neighbors(id);
        N.forEach(function (m) {
            if (m.id === id) nodeEls[m.id].classList.add('hot');
            else if (set[m.id]) nodeEls[m.id].classList.add('lit');
            else nodeEls[m.id].classList.add('dim');
        });
        edgeEls.forEach(function (p) {
            if (p.dataset.f === id || p.dataset.t === id) { p.classList.add('hot'); p.setAttribute('marker-end', 'url(#fsarrowH)'); }
            else p.classList.add('dim');
        });
    };
    var linkList = function (ids) {
        if (!ids.length) return '<span class="fsp-none">None</span>';
        return ids.map(function (id) {
            return '<button type="button" class="fsp-link" data-goto="' + id + '">' + esc(byId[id].l) + '</button>';
        }).join('');
    };
    // static (non-node) labels, e.g. a simulator's performance estimation / verification
    var textList = function (items) {
        if (!items.length) return '<span class="fsp-none">None</span>';
        return items.map(function (t) { return '<span class="fsp-out">' + esc(t) + '</span>'; }).join('');
    };
    var renderPanel = function (id) {
        var m = byId[id];
        var ins = E.filter(function (e) { return e[1] === id; }).map(function (e) { return e[0]; });
        var outs = E.filter(function (e) { return e[0] === id; }).map(function (e) { return e[1]; });
        var isArt = m.g === 'art';
        var isInput = m.g === 'in';
        var outHtml = m.out ? textList(m.out) : linkList(outs);
        // input side = predecessor node link(s) plus any static side-inputs (spec / HW info)
        var inHtml = (ins.length ? linkList(ins) : '') + (m.xin ? textList(m.xin) : '');
        if (!inHtml) inHtml = '<span class="fsp-none">None</span>';
        // the source (input) node has no predecessor, so show only the "To" side
        var fromDiv = isInput ? '' : ('<div><p class="fsp-iohdr">' + (isArt ? 'From' : 'Input') + '</p>' + inHtml + '</div>');
        var toDiv = '<div><p class="fsp-iohdr">' + ((isArt || isInput) ? 'To' : 'Output') + '</p>' + outHtml + '</div>';
        panel.innerHTML =
            '<button type="button" class="fsp-close" data-reset="1" aria-label="Close">✕</button>' +
            '<p class="fsp-eyebrow">' + esc(GROUPS[m.g]) + '</p>' +
            '<h3 class="fsp-title">' + esc(m.l) + '</h3>' +
            (m.s ? '<p class="fsp-sub">' + esc(m.s) + '</p>' : '') +
            '<p class="fsp-desc">' + esc(m.d) + '</p>' +
            '<div class="fsp-io' + (isInput ? ' fsp-io--single' : '') + '">' + fromDiv + toDiv + '</div>' +
            '<button type="button" class="fsp-reset" data-reset="1">↺ Show whole pipeline</button>';
    };
    var homePanel = function () {
        panel.innerHTML =
            '<p class="fsp-eyebrow">Full-stack flow</p>' +
            '<h3 class="fsp-title">One model, every level</h3>' +
            '<p class="fsp-desc">A quantized ONNX model is compiled to Fused IR, then to L1 and L2 instructions and finally to hardware microcode. The same program then runs on the high-level simulator, the low-level simulator, the RTL simulator and the FPGA. <strong>Hover or tap any box</strong> to highlight its inputs and outputs and read what it does.</p>' +
            '<div class="fsp-legend">' +
                '<span><i class="fsp-sw fsp-sw--compile"></i>Compiler / codegen</span>' +
                '<span><i class="fsp-sw fsp-sw--sim"></i>Simulator</span>' +
                '<span><i class="fsp-sw fsp-sw--hw"></i>RTL / FPGA</span>' +
                '<span><i class="fsp-sw fsp-sw--art"></i>Artifact (IR / microcode)</span>' +
            '</div>';
    };
    var show = function (id) { applyHi(id); renderPanel(id); panel.classList.toggle('is-active', pinned); };
    var goHome = function () { pinned = false; cur = null; clearHi(); homePanel(); panel.classList.remove('is-active'); };

    Object.keys(nodeEls).forEach(function (id) {
        var g = nodeEls[id];
        g.addEventListener('mouseenter', function () { if (!pinned) { cur = id; show(id); } });
        g.addEventListener('focus', function () { if (!pinned) { cur = id; show(id); } });
        g.addEventListener('click', function () {
            if (pinned && cur === id) { goHome(); }
            else { pinned = true; cur = id; show(id); }
        });
        g.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinned = true; cur = id; show(id); }
            else if (e.key === 'Escape') { goHome(); g.blur(); }
        });
    });
    board.addEventListener('mouseleave', function () { if (pinned && cur) { show(cur); } else { goHome(); } });

    panel.addEventListener('click', function (e) {
        var t = e.target;
        var goto = t.getAttribute && t.getAttribute('data-goto');
        if (goto && nodeEls[goto]) { pinned = true; cur = goto; show(goto); nodeEls[goto].focus(); return; }
        if (t.getAttribute && t.getAttribute('data-reset')) { goHome(); }
    });

    // Mobile: tapping outside the bottom sheet (not on a node, not inside the panel) closes it.
    // Node taps are handled by the node's own click handler; panel taps stay open.
    document.addEventListener('click', function (e) {
        if (!pinned) return;
        if (typeof window.matchMedia === 'function' && !window.matchMedia('(max-width: 900px)').matches) return;
        if (panel.contains(e.target)) return;
        if (e.target.closest && e.target.closest('.fsnode')) return;
        goHome();
    });

    homePanel();
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

    // Build the interactive full-stack flow diagram (no-op if its container is absent)
    buildFsFlow();

    // Auto-open the waitlist popup on the first load of the session
    maybeAutoOpenWaitlist();

})
