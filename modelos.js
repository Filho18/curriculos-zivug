/* ===========================================================================
   REGISTO DE MODELOS DE CURRÍCULO
   ---------------------------------------------------------------------------
   Cada modelo tem:
     - nome / descricao : identificação
     - schema           : campos do formulário (gera a "folha de entrevista")
     - css              : estilos do CV (namespaced em .cv-doc)
     - render(d)        : recebe os dados preenchidos e devolve o HTML do CV

   Tipos de campo do schema:
     texto    -> input de uma linha
     textarea -> caixa multilinha
     imagem   -> upload de foto (guardado como dataURL base64)
     grupo    -> conjunto de subcampos (ex: contacto)
     lista    -> bloco repetível com subcampos (ex: experiência, educação)

   PARA ADICIONAR UM MODELO NOVO: duplicar um bloco abaixo, trocar o id (a
   chave do objeto) e ajustar schema/css/render. Depois redeploy do /site.
=========================================================================== */
window.MODELOS = {};

/* ---------------------------------------------------------------------------
   MODELO: profissional-pb
   "Black and White Simple Professional Resume" (Canva)
   Duas colunas, foto circular, cabeçalho cinza com nome grande.
--------------------------------------------------------------------------- */
window.MODELOS['profissional-pb'] = {
  nome: 'Profissional Preto & Branco',
  descricao: 'Clássico de duas colunas com foto circular e cabeçalho grande. Sóbrio, bom para áreas corporativas e criativas.',

  schema: [
    { key: 'foto',   label: 'Foto de perfil', tipo: 'imagem', ajuda: 'Foto nítida, de frente. Será recortada em círculo.' },
    { key: 'nome',   label: 'Nome', tipo: 'texto', obrigatorio: true, ajuda: 'Aparece em destaque no topo. Pode ser só o primeiro nome ou nome completo.' },
    { key: 'titulo', label: 'Cargo / título profissional', tipo: 'texto', obrigatorio: true, ajuda: 'Ex: Creative Director, Gestor de Marketing, Engenheiro Civil.' },

    { key: 'contacto', label: 'Contacto', tipo: 'grupo', campos: [
      { key: 'telefone', label: 'Telefone', tipo: 'texto' },
      { key: 'email',    label: 'Email', tipo: 'texto' },
      { key: 'morada',   label: 'Morada', tipo: 'texto' },
      { key: 'website',  label: 'Website / LinkedIn', tipo: 'texto' }
    ]},

    { key: 'resumo', label: 'Resumo profissional', tipo: 'textarea', obrigatorio: true, ajuda: 'Um parágrafo curto sobre quem és e o teu valor (3-5 linhas).' },

    { key: 'experiencia', label: 'Experiência profissional', tipo: 'lista', minimo: 1, item: [
      { key: 'cargo',   label: 'Cargo', tipo: 'texto' },
      { key: 'empresa', label: 'Empresa', tipo: 'texto' },
      { key: 'periodo', label: 'Período', tipo: 'texto', ajuda: 'Ex: 2016 - Presente' },
      { key: 'pontos',  label: 'Responsabilidades', tipo: 'textarea', ajuda: 'Uma por linha. Cada linha vira um ponto.' }
    ]},

    { key: 'educacao', label: 'Formação', tipo: 'lista', minimo: 1, item: [
      { key: 'titulo',    label: 'Instituição', tipo: 'texto' },
      { key: 'subtitulo', label: 'Curso / nível', tipo: 'texto' },
      { key: 'periodo',   label: 'Período', tipo: 'texto', ajuda: 'Ex: 2014 - 2016' }
    ]},

    { key: 'competencias', label: 'Competências', tipo: 'textarea', ajuda: 'Uma por linha. Cada linha vira um item da lista.' }
  ],

  css: `
.cv-doc{width:210mm;min-height:297mm;background:#fff;color:#1d1d1d;font-family:'Lora',Georgia,serif;box-sizing:border-box}
.cv-doc *{box-sizing:border-box}
.cv-head{display:flex;align-items:center;gap:30px;background:#f0f0f0;padding:34px 40px}
.cv-photo{width:140px;height:140px;border-radius:50%;object-fit:cover;flex:0 0 140px;background:#dcdcdc;border:1px solid #d2d2d2}
.cv-photo-ph{display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-size:12px;color:#888;text-align:center;line-height:1.3}
.cv-name{font-family:'Montserrat',sans-serif;font-weight:800;font-size:52px;letter-spacing:5px;line-height:1;text-transform:uppercase;margin:0}
.cv-role{font-family:'Montserrat',sans-serif;font-weight:600;font-size:15px;letter-spacing:7px;text-transform:uppercase;margin-top:12px;color:#333}
.cv-body{display:grid;grid-template-columns:36% 64%}
.cv-cell{padding-top:28px;padding-bottom:30px}
.cv-col1{grid-column:1;border-right:1px solid #e4e4e4;padding-left:40px;padding-right:26px}
.cv-col2{grid-column:2;padding-left:30px;padding-right:40px}
.cv-row1{grid-row:1}
.cv-row2{grid-row:2}
.cv-sec{margin-bottom:26px}
.cv-sec:last-child{margin-bottom:0}
.cv-sec-title{font-family:'Montserrat',sans-serif;font-weight:700;font-size:26px;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px}
.cv-contact-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:13px;word-break:break-word}
.cv-ico{width:24px;height:24px;border-radius:50%;background:#1d1d1d;display:flex;align-items:center;justify-content:center;flex:0 0 24px}
.cv-ico svg{width:12px;height:12px;fill:#fff}
.cv-edu-item,.cv-exp-item{display:flex;gap:10px;margin-bottom:16px}
.cv-edu-item:last-child,.cv-exp-item:last-child{margin-bottom:0}
.cv-dot{width:7px;height:7px;border-radius:50%;background:#1d1d1d;margin-top:6px;flex:0 0 7px}
.cv-edu-title{font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.5px}
.cv-edu-sub{font-size:13px}
.cv-edu-date{font-size:12px;color:#555}
.cv-skill-list{list-style:disc;padding-left:18px;font-size:13px;margin:0}
.cv-skill-list li{margin-bottom:7px}
.cv-summary{font-size:13.5px;line-height:1.65;margin:0}
.cv-exp-role{font-family:'Montserrat',sans-serif;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.5px}
.cv-exp-meta{font-size:13px;font-weight:700;margin:3px 0 8px}
.cv-exp-meta span{font-weight:400;color:#555}
.cv-exp-points{list-style:disc;padding-left:18px;font-size:13px;line-height:1.5;margin:0}
.cv-exp-points li{margin-bottom:4px}
`,

  render: function (d) {
    var esc = window.cvEsc;
    var linhas = window.cvLinhas;

    var ICO = {
      tel: '<svg viewBox="0 0 16 16"><path d="M11 10.5l-1.6 1.6a8 8 0 0 1-5.5-5.5L5.5 5 4 1H1C1 8 8 15 15 15v-3l-4-1.5z"/></svg>',
      mail: '<svg viewBox="0 0 16 16"><path d="M1 3h14v10H1z" fill="none"/><path d="M1 3h14v10H1V3zm1 1v.4l6 3.6 6-3.6V4H2zm12 1.8L8 9 2 5.8V12h12V5.8z"/></svg>',
      pin: '<svg viewBox="0 0 16 16"><path d="M8 0a5 5 0 0 0-5 5c0 3.5 5 11 5 11s5-7.5 5-11a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>',
      web: '<svg viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm5.9 5h-2.3a12 12 0 0 0-1-2.7A6 6 0 0 1 13.9 5zM8 2c.6.8 1.1 1.8 1.4 3H6.6C6.9 3.8 7.4 2.8 8 2zM2.3 10A6 6 0 0 1 2 8c0-.7.1-1.4.3-2h2.5a13.6 13.6 0 0 0 0 4H2.3zm.8 1h2.3c.3 1 .6 1.9 1 2.7A6 6 0 0 1 3.1 11zM5.8 5H3.1a6 6 0 0 1 3.3-2.7c-.5.8-.8 1.7-1 2.7zM8 14c-.6-.8-1.1-1.8-1.4-3h2.8c-.3 1.2-.8 2.2-1.4 3zm1.6-4H6.4a12 12 0 0 1 0-4h3.2a12 12 0 0 1 0 4zm.4 3.7c.4-.8.7-1.7 1-2.7h2.3a6 6 0 0 1-3.3 2.7zM11.2 10a13.6 13.6 0 0 0 0-4h2.5c.2.6.3 1.3.3 2s-.1 1.4-.3 2h-2.5z"/></svg>'
    };

    // --- Cabeçalho (foto + nome) ---
    var foto = d.foto
      ? '<img class="cv-photo" src="' + d.foto + '" alt="">'
      : '<div class="cv-photo cv-photo-ph">FOTO</div>';

    var head =
      '<div class="cv-head">' + foto +
        '<div class="cv-head-text">' +
          '<h1 class="cv-name">' + esc(d.nome) + '</h1>' +
          '<div class="cv-role">' + esc(d.titulo) + '</div>' +
        '</div>' +
      '</div>';

    // --- Contacto ---
    var c = d.contacto || {};
    function row(ico, val) { return val ? '<div class="cv-contact-row"><span class="cv-ico">' + ico + '</span><span>' + esc(val) + '</span></div>' : ''; }
    var contacto =
      '<div class="cv-sec"><h2 class="cv-sec-title">Contacto</h2>' +
        row(ICO.tel, c.telefone) + row(ICO.mail, c.email) +
        row(ICO.pin, c.morada) + row(ICO.web, c.website) +
      '</div>';

    // --- Educação ---
    var edu = (d.educacao || []).filter(function (e) { return e.titulo || e.subtitulo; }).map(function (e) {
      return '<div class="cv-edu-item"><span class="cv-dot"></span><div>' +
        '<div class="cv-edu-title">' + esc(e.titulo) + '</div>' +
        (e.subtitulo ? '<div class="cv-edu-sub">' + esc(e.subtitulo) + '</div>' : '') +
        (e.periodo ? '<div class="cv-edu-date">' + esc(e.periodo) + '</div>' : '') +
      '</div></div>';
    }).join('');
    var educacao = edu ? '<div class="cv-sec"><h2 class="cv-sec-title">Educação</h2>' + edu + '</div>' : '';

    // --- Competências ---
    var skills = linhas(d.competencias).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    var competencias = skills ? '<div class="cv-sec"><h2 class="cv-sec-title">Competências</h2><ul class="cv-skill-list">' + skills + '</ul></div>' : '';

    // --- Resumo ---
    var resumo = d.resumo ? '<div class="cv-sec"><h2 class="cv-sec-title">Resumo</h2><p class="cv-summary">' + esc(d.resumo) + '</p></div>' : '';

    // --- Experiência ---
    var exp = (d.experiencia || []).filter(function (e) { return e.cargo || e.empresa; }).map(function (e) {
      var pts = linhas(e.pontos).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('');
      return '<div class="cv-exp-item"><span class="cv-dot"></span><div>' +
        '<div class="cv-exp-role">' + esc(e.cargo) + '</div>' +
        '<div class="cv-exp-meta">' + esc(e.empresa) + (e.periodo ? ' <span>| ' + esc(e.periodo) + '</span>' : '') + '</div>' +
        (pts ? '<ul class="cv-exp-points">' + pts + '</ul>' : '') +
      '</div></div>';
    }).join('');
    var experiencia = exp ? '<div class="cv-sec"><h2 class="cv-sec-title">Experiência</h2>' + exp + '</div>' : '';

    // Grelha 2x2: títulos alinhados entre colunas como no original.
    //   linha 1: Contacto | Resumo
    //   linha 2: Educação + Competências | Experiência
    return head +
      '<div class="cv-body">' +
        '<div class="cv-cell cv-col1 cv-row1">' + contacto + '</div>' +
        '<div class="cv-cell cv-col2 cv-row1">' + resumo + '</div>' +
        '<div class="cv-cell cv-col1 cv-row2">' + educacao + competencias + '</div>' +
        '<div class="cv-cell cv-col2 cv-row2">' + experiencia + '</div>' +
      '</div>';
  }
};
