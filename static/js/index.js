// Reduced-motion preference: honored by every scripted scroll/animation below.
function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// More Works Dropdown Functionality
function setMoreWorksOpen(open) {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    if (!dropdown || !button) return;
    dropdown.classList.toggle('show', open);
    button.classList.toggle('active', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function moreWorksIsOpen() {
    const dropdown = document.getElementById('moreWorksDropdown');
    return !!(dropdown && dropdown.classList.contains('show'));
}

function toggleMoreWorks() {
    setMoreWorksOpen(!moreWorksIsOpen());
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    if (container && !container.contains(event.target)) {
        setMoreWorksOpen(false);
    }
});

// Close dropdown on escape key; if it was open, hand focus back to its button
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && moreWorksIsOpen()) {
        setMoreWorksOpen(false);
        const button = document.querySelector('.more-works-btn');
        if (button) button.focus();
    }
});

// Release waitlist modal — opened by any "Join Waitlist" trigger (top-right button, etc.).
// Focus management: remember the opener, move focus into the dialog, keep Tab cycling
// inside it while open, and hand focus back to the opener on close.
let waitlistOpener = null;

function openWaitlist() {
    const modal = document.getElementById('waitlistModal');
    if (!modal) return;
    waitlistOpener = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const closeBtn = modal.querySelector('.waitlist-modal-close');
    if (closeBtn) closeBtn.focus();
}

function closeWaitlist() {
    const modal = document.getElementById('waitlistModal');
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (waitlistOpener && typeof waitlistOpener.focus === 'function' && document.contains(waitlistOpener)) {
        waitlistOpener.focus();
    }
    waitlistOpener = null;

    // Reset the form + validation/status state so the popup opens clean next time.
    // (No-op on the embedded Google Form variant, which has no .release-form.)
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

// Close the waitlist modal on Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeWaitlist();
});

// Keep Tab cycling inside the open modal (the iframe's inner focus order is the
// browser's own; this loop covers the modal's chrome around it).
document.addEventListener('keydown', function(event) {
    if (event.key !== 'Tab') return;
    const modal = document.getElementById('waitlistModal');
    if (!modal || !modal.classList.contains('is-open')) return;
    const focusables = modal.querySelectorAll('button, a[href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
    } else if (!modal.contains(document.activeElement)) {
        event.preventDefault(); first.focus();
    }
});

// Clicking the dimmed backdrop closes the modal, like Escape.
document.addEventListener('click', function(event) {
    if (event.target && event.target.classList &&
        event.target.classList.contains('waitlist-modal-backdrop')) {
        closeWaitlist();
    }
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
            copyText.textContent = 'Copied!';

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
            copyText.textContent = 'Copied!';
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
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
}

// Show/hide scroll to top button (rAF-throttled: at most one class flip per frame)
(function () {
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            ticking = false;
            const scrollButton = document.querySelector('.scroll-to-top');
            if (!scrollButton) return;
            scrollButton.classList.toggle('visible', window.pageYOffset > 300);
        });
    }, { passive: true });
})();

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
          d: 'A quantized int8 DNN in the ONNX format is the input to the whole stack. It is first imported into MLIR as the ONNX dialect, the form the MIDAP HLC actually consumes. Every downstream IR, the microcode and all four execution paths are derived from it.' },
        { id: 'm1', g: 'compile', l: 'ONNX → TOSA', s: '+ operator fusion', x: 60, y: 94, w: 180, h: 46, xin: ['System spec'],
          d: 'Lowers the quantized ONNX operators to the TOSA dialect, then fuses supported groups of operations—such as convolution, activation and reduction—that execute as a pipeline on the NPU datapath into MIDAP’s coarser-grained L1 layer operations. Each fused op sequence is treated as a single unit during tiling and memory compilation, so its compute and memory operations can be planned together.' },
        { id: 'fused', g: 'art', l: 'Fused IR', s: '', x: 85, y: 152, w: 130, h: 30,
          d: 'A TOSA-derived IR organized around fused L1 layer operations. Each L1 layer operation represents a group of NPU datapath operations that will be tiled and memory-compiled together. Produced by ONNX → TOSA + fusion and consumed by Op tiling + memory compile.' },
        { id: 'm2', g: 'compile', l: 'Op tiling', s: '+ memory compile', x: 60, y: 196, w: 180, h: 46, xin: ['System spec'],
          d: 'Splits each L1 layer operation produced by fusion into tiles sized for MIDAP’s on-chip SRAM. From the tiling result, memory compilation generates memory reads, writes and data-transfer operations, and allocates storage for data in DRAM and on-chip SRAM. It then optimizes the memory-operation schedule to maximize on-chip SRAM utilization and minimize delays caused by data transfers.' },
        { id: 'l1', g: 'art', l: 'MIDAP L1 inst.', s: '', x: 85, y: 254, w: 130, h: 30,
          d: 'Tile-level L1 instructions with memory accesses, data transfers and on-chip SRAM allocation determined by memory compilation. Produced by Op tiling + memory compile and consumed by L1 → L2.' },
        { id: 'm3', g: 'compile', l: 'L1 → L2', s: 'lowering', x: 60, y: 298, w: 180, h: 46, xin: ['HW module info'],
          d: 'Lowers each L1 layer or DMA operation into control-aware L2 instructions. The resulting config, run and wait operations express how hardware modules are configured, launched and synchronized.' },
        { id: 'l2', g: 'art', l: 'MIDAP L2 inst.', s: '', x: 85, y: 356, w: 130, h: 30,
          d: 'The control-aware L2 instruction stream, expressed as explicit config, run and wait operations. Produced by L1 → L2, then run directly by the HL simulator and lowered to microcode by codegen.' },
        { id: 'm4', g: 'codegen', l: 'L2 → Microcode', s: 'codegen', x: 60, y: 430, w: 180, h: 46,
          d: 'Generates the hardware microcode from the L2 instruction stream. The microcode is the exact set of control words the NPU executes. It runs on the low-level simulator, the RTL simulator and the FPGA.' },
        { id: 'mc', g: 'art', l: 'Microcode', s: '', x: 85, y: 488, w: 130, h: 30,
          d: 'The hardware microcode, the exact control words the NPU executes. Produced by L2 → Microcode and run by the LL simulator, the RTL simulator and the FPGA.' },
        { id: 'hlsim', g: 'sim', l: 'Python HL Simulator', s: 'high-level · cycle-accurate', x: 430, y: 336, w: 196, h: 48, out: ['Performance estimation', 'Verification'],
          d: 'The high-level cycle-accurate simulator. It models the datapath, DRAM traffic and stalls cycle by cycle as it runs the L2 instruction stream. The simulator reports end-to-end latency plus a per-stage bottleneck breakdown. The RTL and FPGA runs are cross-validated against its predicted cycles.' },
        { id: 'llsim', g: 'sim', l: 'Python LL Simulator', s: 'low-level · microcode', x: 430, y: 430, w: 196, h: 46, out: ['Verification'],
          d: 'The low-level Python simulator. It runs the generated microcode instruction by instruction at the microcode level, checking functional correctness and producing the golden result before any RTL or hardware run.' },
        { id: 'rtlsim', g: 'hw', l: 'RTL Simulator', s: '', x: 430, y: 486, w: 196, h: 46, out: ['Performance estimation', 'Verification'],
          d: 'Runs the identical microcode against MIDAP’s RTL in simulation, exercising the real hardware description (adder-tree core, on-chip memory, AXI/APB, IBEX control core) at the signal level. Its cycle-accurate results are compared against the HL simulator’s predictions to confirm the model matches the hardware.' },
        { id: 'fpga', g: 'hw', l: 'FPGA', s: '', x: 430, y: 542, w: 196, h: 46, out: ['Performance estimation', 'Verification'],
          d: 'Maps the MIDAP design onto an FPGA and runs the same microcode on real hardware at speed. As the final validation level, the FPGA run confirms that the design works on a physical device and that its measured cycles line up with the simulator and RTL.' }
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
    var goHome = function () { pinned = false; cur = null; clearHi(); homePanel(); panel.classList.remove('is-active', 'is-away'); };

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
        if (panel.classList.contains('is-away')) return; // sheet hidden: nothing to dismiss here
        if (e.target.closest && e.target.closest('.fsnode')) return;
        goHome();
    });

    // The pinned sheet is position:fixed on phones, so on its own it would follow the reader out
    // of this section and cover up to 72vh of what comes next (Performance) or before it (Why
    // MIDAP). Tie it to the diagram: hide it while the diagram is off screen, bring it back when
    // the diagram returns. Hiding rather than resetting keeps the panel out of the flow either
    // way, so re-inserting it never shifts the page under the reader (measured: 424px jump).
    if (typeof IntersectionObserver === 'function') {
        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (pinned) panel.classList.toggle('is-away', !entry.isIntersecting);
            });
        }).observe(board);
    }

    homePanel();
}

document.addEventListener('DOMContentLoaded', function() {
    // Build the interactive full-stack flow diagram (no-op if its container is absent)
    buildFsFlow();
});
