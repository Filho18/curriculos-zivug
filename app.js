/* ===========================================================================
   APP — formulário dinâmico de currículo
   Lê ?modelo=X&token=Y, gera o formulário a partir do schema do modelo,
   mostra preview ao vivo, gera PDF e envia os dados para o Supabase.
=========================================================================== */

/* ---- Helpers globais (usados também pelo render dos modelos) ---- */
window.cvEsc = function (s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};
window.cvLinhas = function (s) {
  return String(s == null ? '' : s).split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
};

(function () {
  'use strict';

  // ---- Parâmetros da URL ----
  var params = new URLSearchParams(location.search);
  var modeloId = params.get('modelo') || Object.keys(window.MODELOS)[0];
  var token = params.get('token') || 'sem-token';
  var modelo = window.MODELOS[modeloId];

  if (!modelo) {
    document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif">Modelo desconhecido: <b>' + window.cvEsc(modeloId) + '</b>. Verifica o link.</div>';
    return;
  }

  document.getElementById('topo-modelo').textContent = modelo.nome;
  document.title = 'Currículo — ' + modelo.nome + ' — Zivug';

  // Injeta o CSS do modelo escolhido
  var styleEl = document.createElement('style');
  styleEl.textContent = modelo.css;
  document.head.appendChild(styleEl);

  // ---- Estado dos dados ----
  var dados = {};

  // Inicializa estrutura conforme o schema
  modelo.schema.forEach(function (campo) {
    if (campo.tipo === 'grupo') {
      dados[campo.key] = {};
    } else if (campo.tipo === 'lista') {
      dados[campo.key] = [];
      var min = campo.minimo || 1;
      for (var i = 0; i < min; i++) dados[campo.key].push(itemVazio(campo));
    } else {
      dados[campo.key] = '';
    }
  });

  function itemVazio(campo) {
    var o = {};
    campo.item.forEach(function (sc) { o[sc.key] = ''; });
    return o;
  }

  // ====================================================================
  //  CONSTRUÇÃO DO FORMULÁRIO
  // ====================================================================
  var form = document.getElementById('form');

  function labelHtml(campo) {
    return '<label>' + window.cvEsc(campo.label) + (campo.obrigatorio ? ' <span class="obrig">*</span>' : '') + '</label>';
  }
  function ajudaHtml(campo) {
    return campo.ajuda ? '<div class="ajuda">' + window.cvEsc(campo.ajuda) + '</div>' : '';
  }

  function construirCampoSimples(campo, valor, onInput, semLabel) {
    var div = document.createElement('div');
    div.className = 'campo';
    div.innerHTML = semLabel ? '' : labelHtml(campo);
    var input;
    if (campo.tipo === 'textarea') {
      input = document.createElement('textarea');
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.value = valor || '';
    input.addEventListener('input', function () { onInput(input.value); });
    div.appendChild(input);
    if (campo.ajuda) div.insertAdjacentHTML('beforeend', ajudaHtml(campo));
    return div;
  }

  function construirFoto(campo) {
    var div = document.createElement('div');
    div.className = 'campo';
    div.innerHTML = labelHtml(campo);
    var wrap = document.createElement('div');
    wrap.className = 'foto-wrap';
    var img = document.createElement('img');
    img.className = 'foto-preview';
    img.alt = '';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'foto-btn';
    btn.textContent = 'Escolher foto';
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.className = 'foto-input';
    btn.addEventListener('click', function () { inp.click(); });
    inp.addEventListener('change', function () {
      var file = inp.files[0];
      if (!file) return;
      redimensionarImagem(file, 600, function (dataUrl) {
        dados[campo.key] = dataUrl;
        img.src = dataUrl;
        btn.textContent = 'Trocar foto';
        atualizarPreview();
      });
    });
    wrap.appendChild(img);
    wrap.appendChild(btn);
    wrap.appendChild(inp);
    div.appendChild(wrap);
    if (campo.ajuda) div.insertAdjacentHTML('beforeend', ajudaHtml(campo));
    return div;
  }

  function construirGrupo(campo) {
    var bloco = document.createElement('div');
    bloco.className = 'bloco';
    bloco.innerHTML = '<div class="bloco-titulo">' + window.cvEsc(campo.label) + '</div>';
    var grid = document.createElement('div');
    grid.className = 'grupo-campos';
    campo.campos.forEach(function (sc) {
      grid.appendChild(construirCampoSimples(sc, dados[campo.key][sc.key], function (v) {
        dados[campo.key][sc.key] = v; atualizarPreview();
      }));
    });
    bloco.appendChild(grid);
    return bloco;
  }

  function construirLista(campo) {
    var bloco = document.createElement('div');
    bloco.className = 'bloco';
    bloco.innerHTML = '<div class="bloco-titulo">' + window.cvEsc(campo.label) + '</div>';
    var cont = document.createElement('div');
    bloco.appendChild(cont);

    function redesenhar() {
      cont.innerHTML = '';
      dados[campo.key].forEach(function (item, idx) {
        var box = document.createElement('div');
        box.className = 'lista-item';
        box.innerHTML = '<div class="lista-item-num">' + window.cvEsc(campo.label) + ' ' + (idx + 1) + '</div>';
        if (dados[campo.key].length > (campo.minimo || 1)) {
          var rem = document.createElement('button');
          rem.type = 'button';
          rem.className = 'btn-remover';
          rem.textContent = 'Remover';
          rem.addEventListener('click', function () {
            dados[campo.key].splice(idx, 1);
            redesenhar(); atualizarPreview();
          });
          box.appendChild(rem);
        }
        campo.item.forEach(function (sc) {
          box.appendChild(construirCampoSimples(sc, item[sc.key], function (v) {
            item[sc.key] = v; atualizarPreview();
          }));
        });
        cont.appendChild(box);
      });
      var add = document.createElement('button');
      add.type = 'button';
      add.className = 'btn-add';
      add.textContent = '+ Adicionar ' + campo.label.toLowerCase();
      add.addEventListener('click', function () {
        dados[campo.key].push(itemVazio(campo));
        redesenhar(); atualizarPreview();
      });
      cont.appendChild(add);
    }
    redesenhar();
    return bloco;
  }

  // Layout: os campos simples ANTES do primeiro grupo/lista agrupam-se num
  // bloco "Dados principais" (foto, nome, cargo). Depois disso, cada campo
  // simples solto (ex: resumo, competências) ganha o seu próprio bloco com
  // o seu próprio título — evita "Dados principais" repetido.
  var introBloco = null;   // bloco de abertura (acumula foto/nome/cargo)
  var introTerminou = false;

  function novoBloco(titulo) {
    var b = document.createElement('div');
    b.className = 'bloco';
    b.innerHTML = '<div class="bloco-titulo">' + window.cvEsc(titulo) + '</div>';
    form.appendChild(b);
    return b;
  }

  modelo.schema.forEach(function (campo) {
    if (campo.tipo === 'grupo') {
      form.appendChild(construirGrupo(campo));
      introTerminou = true;
    } else if (campo.tipo === 'lista') {
      form.appendChild(construirLista(campo));
      introTerminou = true;
    } else if (!introTerminou) {
      // campo simples de abertura
      if (!introBloco) introBloco = novoBloco('Dados principais');
      if (campo.tipo === 'imagem') {
        introBloco.appendChild(construirFoto(campo));
      } else {
        introBloco.appendChild(construirCampoSimples(campo, dados[campo.key], function (v) {
          dados[campo.key] = v; atualizarPreview();
        }));
      }
    } else {
      // campo simples solto depois de um grupo/lista → bloco próprio
      var bloco = novoBloco(campo.label);
      if (campo.tipo === 'imagem') {
        bloco.appendChild(construirFoto(campo));
      } else {
        bloco.appendChild(construirCampoSimples(campo, dados[campo.key], function (v) {
          dados[campo.key] = v; atualizarPreview();
        }, true /* semLabel: o título do bloco já mostra o nome */));
      }
    }
  });

  // ====================================================================
  //  PREVIEW
  // ====================================================================
  var cvDoc = document.getElementById('cv-doc');
  var previewScale = document.getElementById('preview-scale');

  function atualizarPreview() {
    cvDoc.innerHTML = modelo.render(dados);
  }

  function ajustarEscala() {
    // .cv-doc tem 210mm (~793px). Escala para caber na coluna do preview.
    var disponivel = previewScale.parentElement.clientWidth - 48;
    var larguraDoc = 794;
    var escala = Math.min(1, disponivel / larguraDoc);
    cvDoc.style.transform = 'scale(' + escala + ')';
    // ajusta a altura do wrapper para não cortar
    previewScale.style.width = (larguraDoc * escala) + 'px';
    previewScale.style.height = (cvDoc.offsetHeight * escala) + 'px';
  }

  window.addEventListener('resize', ajustarEscala);

  // ====================================================================
  //  PDF + ENVIO
  // ====================================================================
  var btnPdf = document.getElementById('btn-pdf');
  var estadoEnvio = document.getElementById('estado-envio');

  function nomeFicheiro() {
    var n = (dados.nome || 'curriculo').toString().trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return 'cv-' + (n || 'curriculo') + '.pdf';
  }

  function validar() {
    var faltam = [];
    modelo.schema.forEach(function (campo) {
      if (campo.obrigatorio && campo.tipo !== 'lista' && campo.tipo !== 'grupo') {
        if (!String(dados[campo.key] || '').trim()) faltam.push(campo.label);
      }
    });
    return faltam;
  }

  function setEstado(txt, classe) {
    estadoEnvio.textContent = txt;
    estadoEnvio.className = 'estado-envio' + (classe ? ' ' + classe : '');
  }

  // Cliente Supabase
  var supa = null;
  try {
    if (window.supabase && window.SUPA) {
      supa = window.supabase.createClient(window.SUPA.url, window.SUPA.anon);
    }
  } catch (e) { /* segue sem envio */ }

  function enviarSupabase() {
    if (!supa) return Promise.resolve({ skipped: true });
    return supa.from(window.SUPA.tabela).insert({
      token: token,
      modelo: modeloId,
      nome: dados.nome || null,
      dados: dados
    });
  }

  function gerarPDF() {
    // Renderiza um clone em tamanho real (sem escala). É posicionado em (0,0)
    // mas atrás do conteúdo (z-index negativo) — NÃO fora do ecrã com left
    // negativo, senão o html2canvas captura coordenadas negativas e sai branco.
    var holder = document.createElement('div');
    holder.style.position = 'fixed';
    holder.style.left = '0';
    holder.style.top = '0';
    holder.style.zIndex = '-1';
    holder.style.opacity = '0';        // invisível ao utilizador, mas renderizado
    holder.style.pointerEvents = 'none';
    var doc = document.createElement('div');
    doc.className = 'cv-doc';
    doc.style.transform = 'none';
    doc.style.background = '#ffffff';
    doc.innerHTML = modelo.render(dados);
    holder.appendChild(doc);
    document.body.appendChild(holder);

    var larguraPx = doc.offsetWidth || 794;

    var opt = {
      margin: 0,
      filename: nomeFicheiro(),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: larguraPx,
        width: larguraPx
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    return html2pdf().set(opt).from(doc).save().then(function () {
      if (holder.parentNode) document.body.removeChild(holder);
    }).catch(function (e) {
      if (holder.parentNode) document.body.removeChild(holder);
      throw e;
    });
  }

  btnPdf.addEventListener('click', function () {
    var faltam = validar();
    if (faltam.length) {
      setEstado('Falta preencher: ' + faltam.join(', '), 'erro');
      return;
    }
    btnPdf.disabled = true;
    setEstado('A gerar...', '');

    // Envia para o Supabase em paralelo; o PDF é o que o utilizador vê.
    enviarSupabase().then(function (r) {
      if (r && r.error) console.warn('Supabase:', r.error.message);
    }).catch(function (e) { console.warn('Supabase falhou:', e); });

    // Garante que as fontes (Montserrat/Lora) estão carregadas antes de capturar.
    var fontes = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fontes.then(gerarPDF).then(function () {
      setEstado('Currículo descarregado. Recebemos a tua informação ✓', 'ok');
      btnPdf.disabled = false;
    }).catch(function (e) {
      setEstado('Erro ao gerar o PDF: ' + e.message, 'erro');
      btnPdf.disabled = false;
    });
  });

  // ---- Botão de preview no mobile ----
  var painelPreview = document.querySelector('.painel-preview');
  var btnPreviewMobile = document.getElementById('btn-preview-mobile');
  btnPreviewMobile.addEventListener('click', function () {
    var aberto = painelPreview.classList.toggle('aberto');
    btnPreviewMobile.textContent = aberto ? 'Fechar pré-visualização' : 'Ver pré-visualização';
    if (aberto) { atualizarPreview(); ajustarEscala(); }
  });

  // ---- Arranque ----
  atualizarPreview();
  // pequeno atraso para as fontes/layout assentarem antes de medir
  setTimeout(ajustarEscala, 60);
  // re-mede sempre que o preview muda de altura
  var ro = new ResizeObserver(ajustarEscala);
  ro.observe(cvDoc);
})();
