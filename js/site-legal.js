/*
 * RMIRA Advocacia — aviso de cookies + aviso de segurança antifraude.
 * Vanilla JS, sem dependências. Injeta markup e estilo próprios;
 * usa os custom properties (--navy, --brass, --cyan-ink etc.) já
 * definidos em cada página, então herda a identidade visual local
 * sem precisar declarar cores/fontes de novo.
 *
 * Não define nem lê nenhum cookie. O único estado que grava é uma
 * chave de localStorage (rmira_legal_ack) só para lembrar que o
 * aviso já foi visto — preferência de interface, não rastreamento.
 */
(function () {
  'use strict';

  var ACK_KEY = 'rmira_legal_ack_v1';
  var ANTIFRAUD_KEY = 'rmira_antifraud_ack_v1';

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'html') node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(c);
    });
    return node;
  }

  function injectStyle() {
    var css = ''
      + '.rmira-legal-bar{position:fixed;left:0;right:0;bottom:0;z-index:200;'
      + 'background:rgba(11,34,48,0.97);backdrop-filter:saturate(150%) blur(10px);'
      + 'border-top:1px solid rgba(184,145,80,0.35);'
      + 'padding:0.95rem 1.5rem;display:flex;align-items:center;justify-content:center;gap:1.5rem;'
      + 'flex-wrap:wrap;transform:translateY(110%);transition:transform 0.4s ease;}'
      + '.rmira-legal-bar.rmira-show{transform:translateY(0);}'
      + '.rmira-legal-bar-in{max-width:1100px;width:100%;display:flex;align-items:center;'
      + 'justify-content:space-between;gap:1.5rem;flex-wrap:wrap;}'
      + '.rmira-legal-text{font-family:var(--sans);font-size:0.8125rem;line-height:1.55;color:#c8d8e8;max-width:62ch;margin:0;}'
      + '.rmira-legal-text a{color:#79c5f0;text-decoration:underline;text-underline-offset:2px;}'
      + '.rmira-legal-text a:hover{color:#ffffff;}'
      + '.rmira-legal-actions{display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;flex:none;}'
      + '.rmira-btn{font-family:var(--sans);font-size:0.8rem;font-weight:500;border-radius:4px;'
      + 'padding:0.55rem 1.1rem;cursor:pointer;border:1px solid transparent;white-space:nowrap;}'
      + '.rmira-btn-primary{background:var(--cyan,#0b9ee1);color:#08202e;border-color:var(--cyan,#0b9ee1);}'
      + '.rmira-btn-primary:hover{background:#3fbcf2;}'
      + '.rmira-btn-ghost{background:transparent;color:#b9cbd9;border-color:rgba(184,145,80,0.4);}'
      + '.rmira-btn-ghost:hover{color:#fff;border-color:rgba(184,145,80,0.8);}'
      + '.rmira-btn:focus-visible{outline:2px solid var(--cyan,#0b9ee1);outline-offset:2px;}'
      + '@media (max-width:720px){.rmira-legal-bar{padding:1rem;}.rmira-legal-bar-in{flex-direction:column;align-items:stretch;text-align:left;}'
      + '.rmira-legal-actions{width:100%;}.rmira-legal-actions .rmira-btn{flex:1;text-align:center;padding:0.85rem 1.1rem;min-height:44px;}}'
      + ''
      + '.rmira-modal-overlay{position:fixed;inset:0;z-index:300;background:rgba(6,17,24,0.72);'
      + 'display:flex;align-items:center;justify-content:center;padding:1.5rem;opacity:0;pointer-events:none;'
      + 'transition:opacity 0.25s ease;}'
      + '.rmira-modal-overlay.rmira-show{opacity:1;pointer-events:auto;}'
      + '.rmira-modal{background:var(--bg,#fcfcfa);border-radius:8px;max-width:560px;width:100%;'
      + 'max-height:85vh;overflow-y:auto;padding:0;box-shadow:0 20px 60px rgba(0,0,0,0.35);'
      + 'transform:translateY(12px) scale(0.98);transition:transform 0.25s ease;border:1px solid var(--line,rgba(13,42,74,0.13));}'
      + '.rmira-modal-overlay.rmira-show .rmira-modal{transform:translateY(0) scale(1);}'
      + '.rmira-modal-head{padding:1.5rem 1.75rem 1.1rem;border-bottom:1px solid var(--line,rgba(13,42,74,0.13));'
      + 'display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;}'
      + '.rmira-modal-head h2{font-family:var(--serif);font-weight:400;font-size:1.3rem;color:var(--ink,#0d2a4a);margin:0;line-height:1.25;}'
      + '.rmira-modal-close{background:none;border:none;cursor:pointer;font-size:1.4rem;line-height:1;'
      + 'color:var(--muted,#5e6d7d);padding:0.25rem 0.4rem;border-radius:4px;flex:none;}'
      + '.rmira-modal-close:hover{color:var(--ink,#0d2a4a);}'
      + '.rmira-modal-close:focus-visible{outline:2px solid var(--cyan-ink,#0d76b9);outline-offset:2px;}'
      + '.rmira-modal-body{padding:1.25rem 1.75rem 1.75rem;font-family:var(--sans);font-size:0.875rem;'
      + 'line-height:1.7;color:var(--body,#36465a);}'
      + '.rmira-modal-body p{margin:0 0 1rem;}'
      + '.rmira-modal-body p:last-child{margin-bottom:0;}'
      + '.rmira-modal-body a{color:var(--cyan-ink,#0d76b9);}'
      + '.rmira-modal-body ul{margin:0 0 1rem 1.1rem;padding:0;}'
      + '.rmira-modal-body li{margin-bottom:0.5rem;}'
      + '.rmira-modal-foot{padding:1rem 1.75rem 1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap;'
      + 'border-top:1px solid var(--line,rgba(13,42,74,0.13));}'
      + '.rmira-btn-solid{background:var(--navy,#0b2230);color:#f5f8fb;}'
      + '.rmira-btn-solid:hover{background:#132d3d;}'
      + '.rmira-btn-outline{background:transparent;color:var(--cyan-ink,#0d76b9);border-color:var(--line,rgba(13,42,74,0.25));}'
      + '.rmira-btn-outline:hover{border-color:var(--cyan-ink,#0d76b9);}'
      + '.rmira-prefs-item{border:1px solid var(--line,rgba(13,42,74,0.13));border-radius:6px;'
      + 'padding:1rem 1.1rem;margin-bottom:0.85rem;}'
      + '.rmira-prefs-item:last-child{margin-bottom:0;}'
      + '.rmira-prefs-item-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:0.4rem;}'
      + '.rmira-prefs-item-head strong{font-family:var(--sans);font-size:0.875rem;color:var(--ink,#0d2a4a);font-weight:600;}'
      + '.rmira-tag{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;'
      + 'padding:0.15rem 0.5rem;border-radius:20px;flex:none;}'
      + '.rmira-tag-on{background:rgba(11,158,225,0.12);color:var(--cyan-ink,#0d76b9);}'
      + '.rmira-tag-off{background:rgba(94,109,125,0.12);color:var(--muted,#5e6d7d);}'
      + '.rmira-prefs-item p{font-size:0.8125rem;margin:0;color:var(--muted,#5e6d7d);}'
      + '.rmira-footer-security{color:#79c5f0 !important;font-weight:500;}';

    var style = document.createElement('style');
    style.setAttribute('data-rmira-legal', '');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function trapFocus(container, overlay) {
    function onKeydown(e) {
      if (e.key === 'Escape') {
        closeOverlay(overlay);
        return;
      }
      if (e.key !== 'Tab') return;
      var focusables = container.querySelectorAll('button, a[href]');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener('keydown', onKeydown);
    return onKeydown;
  }

  function openOverlay(overlay) {
    var lastFocused = document.activeElement;
    overlay._lastFocused = lastFocused;
    overlay.classList.add('rmira-show');
    var modal = overlay.querySelector('.rmira-modal');
    var closeBtn = overlay.querySelector('.rmira-modal-close');
    if (closeBtn) closeBtn.focus();
    overlay._keyHandler = trapFocus(modal, overlay);
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay(overlay) {
    overlay.classList.remove('rmira-show');
    document.body.style.overflow = '';
    if (overlay._lastFocused && overlay._lastFocused.focus) {
      overlay._lastFocused.focus();
    }
  }

  function buildModal(id, titleText, bodyHtml, footButtons) {
    var overlay = el('div', {
      class: 'rmira-modal-overlay',
      id: id,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': id + '-title'
    });
    var modal = el('div', { class: 'rmira-modal' });
    var head = el('div', { class: 'rmira-modal-head' }, [
      el('h2', { id: id + '-title', html: titleText }),
      el('button', {
        class: 'rmira-modal-close',
        type: 'button',
        'aria-label': 'Fechar'
      }, [document.createTextNode('×')])
    ]);
    var body = el('div', { class: 'rmira-modal-body', html: bodyHtml });
    modal.appendChild(head);
    modal.appendChild(body);
    if (footButtons && footButtons.length) {
      var foot = el('div', { class: 'rmira-modal-foot' });
      footButtons.forEach(function (b) { foot.appendChild(b); });
      modal.appendChild(foot);
    }
    overlay.appendChild(modal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay(overlay);
    });
    head.querySelector('.rmira-modal-close').addEventListener('click', function () {
      closeOverlay(overlay);
    });
    document.body.appendChild(overlay);
    return overlay;
  }

  function buildPreferencesModal() {
    var body = ''
      + '<p>Este site não utiliza cookies de análise, de funcionalidade opcional ou de publicidade/marketing. '
      + 'Nenhuma dessas categorias está ativa hoje, então não há nada para você ativar ou desativar aqui — '
      + 'preferimos mostrar isso com clareza a simular escolhas que não mudam nada.</p>'
      + '<div class="rmira-prefs-item">'
      + '<div class="rmira-prefs-item-head"><strong>Estritamente necessários</strong><span class="rmira-tag rmira-tag-on">Sempre ativo</span></div>'
      + '<p>Cookies técnicos eventualmente definidos pela rede de distribuição do site (Cloudflare), como proteção '
      + 'contra tráfego malicioso, podem ocorrer na camada de rede, fora do controle do conteúdo do site. Não '
      + 'requerem consentimento por serem indispensáveis à prestação segura do serviço.</p>'
      + '</div>'
      + '<div class="rmira-prefs-item">'
      + '<div class="rmira-prefs-item-head"><strong>Análise / estatística</strong><span class="rmira-tag rmira-tag-off">Não utilizado</span></div>'
      + '<p>Nenhuma ferramenta de analytics está instalada neste site.</p>'
      + '</div>'
      + '<div class="rmira-prefs-item">'
      + '<div class="rmira-prefs-item-head"><strong>Funcionalidade</strong><span class="rmira-tag rmira-tag-off">Não utilizado</span></div>'
      + '<p>O site não usa cookies para lembrar preferências de navegação.</p>'
      + '</div>'
      + '<div class="rmira-prefs-item">'
      + '<div class="rmira-prefs-item-head"><strong>Publicidade / marketing</strong><span class="rmira-tag rmira-tag-off">Não utilizado</span></div>'
      + '<p>Nenhum pixel ou tag de publicidade está instalado neste site.</p>'
      + '</div>'
      + '<p style="margin-top:1.25rem">Detalhes completos na <a href="/privacidade/#cookies">Política de Privacidade</a>.</p>';

    var okBtn = el('button', { class: 'rmira-btn rmira-btn-solid', type: 'button' }, [document.createTextNode('Entendi')]);
    var overlay = buildModal('rmira-prefs-modal', 'Cookies e tecnologias utilizadas', body, [okBtn]);
    okBtn.addEventListener('click', function () { closeOverlay(overlay); });
    return overlay;
  }

  function buildAntifraudModal() {
    var body = ''
      + '<p>A RMIRA Advocacia não solicita pagamentos, transferências, dados bancários ou documentos pessoais '
      + 'por WhatsApp, redes sociais, ou e-mails fora do domínio <strong>@rmira.com.br</strong>.</p>'
      + '<p>Antes de atender a qualquer solicitação em nome do escritório — especialmente pedidos de urgência, '
      + 'cobrança ou envio de dados sensíveis — verifique o domínio do remetente e confirme diretamente com o '
      + 'escritório pelo canal oficial abaixo.</p>'
      + '<p>Comunicações suspeitas devem ser reportadas por esse mesmo canal.</p>'
      + '<p>Este site também não usa cookies de rastreamento, análise ou publicidade — apenas o que for '
      + 'estritamente necessário para funcionar com segurança. Detalhes na '
      + '<a href="/privacidade/">Política de Privacidade</a>.</p>'
      + '<p><strong>Canal oficial de confirmação:</strong><br>'
      + '<a href="mailto:contato@rmira.com.br">contato@rmira.com.br</a> &middot; '
      + '<a href="https://rmira.com.br" target="_blank" rel="noopener">rmira.com.br</a></p>';
    var fullBtn = el('a', { class: 'rmira-btn rmira-btn-outline', href: '/seguranca/' }, [document.createTextNode('Ver aviso completo')]);
    var okBtn = el('button', { class: 'rmira-btn rmira-btn-solid', type: 'button' }, [document.createTextNode('Entendi')]);
    var overlay = buildModal('rmira-antifraud-modal', 'Aviso de segurança', body, [fullBtn, okBtn]);
    okBtn.addEventListener('click', function () { closeOverlay(overlay); });
    return overlay;
  }

  function buildBar(prefsOverlay) {
    var text = el('p', {
      class: 'rmira-legal-text',
      html: 'Este site não utiliza cookies de análise, funcionalidade ou publicidade — apenas o que é '
        + 'estritamente necessário para funcionar com segurança. Veja a '
        + '<a href="/privacidade/">Política de Privacidade</a>.'
    });
    var prefsBtn = el('button', { class: 'rmira-btn rmira-btn-ghost', type: 'button' }, [document.createTextNode('Preferências')]);
    var okBtn = el('button', { class: 'rmira-btn rmira-btn-primary', type: 'button' }, [document.createTextNode('Entendi')]);
    var actions = el('div', { class: 'rmira-legal-actions' }, [prefsBtn, okBtn]);
    var inner = el('div', { class: 'rmira-legal-bar-in' }, [text, actions]);
    var bar = el('div', { class: 'rmira-legal-bar', role: 'region', 'aria-label': 'Aviso de cookies' }, [inner]);
    document.body.appendChild(bar);

    function dismiss() {
      bar.classList.remove('rmira-show');
      try { localStorage.setItem(ACK_KEY, String(Date.now())); } catch (e) { /* storage indisponível: só não lembra na próxima visita */ }
    }
    okBtn.addEventListener('click', dismiss);
    prefsBtn.addEventListener('click', function () {
      openOverlay(prefsOverlay);
    });

    var acknowledged = false;
    try { acknowledged = !!localStorage.getItem(ACK_KEY); } catch (e) { /* segue como não confirmado */ }
    if (!acknowledged) {
      window.setTimeout(function () { bar.classList.add('rmira-show'); }, 400);
    }
    return bar;
  }

  function wireFooterSecurityLinks(antifraudOverlay) {
    var links = document.querySelectorAll('a[data-rmira-security-trigger]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        // No /seguranca/ full page itself, let the link navigate normally.
        if (window.location.pathname.indexOf('/seguranca') === 0) return;
        e.preventDefault();
        openOverlay(antifraudOverlay);
      });
    });
  }

  function autoShowAntifraud(antifraudOverlay) {
    // Já está na página completa do aviso — não precisa do modal por cima.
    if (window.location.pathname.indexOf('/seguranca') === 0) return;
    var seen = false;
    try { seen = !!localStorage.getItem(ANTIFRAUD_KEY); } catch (e) { /* segue como não visto */ }
    if (seen) return;
    window.setTimeout(function () {
      openOverlay(antifraudOverlay);
      try { localStorage.setItem(ANTIFRAUD_KEY, String(Date.now())); } catch (e) { /* só não lembra na próxima visita */ }
    }, 600);
  }

  function init() {
    injectStyle();
    var prefsOverlay = buildPreferencesModal();
    var antifraudOverlay = buildAntifraudModal();
    buildBar(prefsOverlay);
    wireFooterSecurityLinks(antifraudOverlay);
    autoShowAntifraud(antifraudOverlay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
