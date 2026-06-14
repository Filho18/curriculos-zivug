# Currículos Zivug — formulário dinâmico

Site único que gera currículos a partir de modelos prontos. Cada pessoa abre um link com o modelo escolhido, preenche, vê o preview ao vivo e descarrega o PDF. Os dados são guardados no Supabase para a Zivug rever.

## Link

```
https://<site-netlify>/?modelo=<id-do-modelo>&token=<token-da-pessoa>
```

Ex.: `/?modelo=profissional-pb&token=ana-2026`

## Estrutura

- `index.html` — página do formulário
- `style.css` — estilos da interface
- `app.js` — form dinâmico, preview, geração de PDF, envio para o Supabase
- `config.js` — URL e anon key do Supabase
- `modelos.js` — todos os modelos (schema + css + render)

## Adicionar um modelo

Editar `modelos.js`, acrescentar `window.MODELOS['<id>'] = { nome, descricao, schema, css, render }` e fazer push. O Netlify reconstrói sozinho.

> Gerido pela skill `curriculos-ratos` no workspace Zivug.
