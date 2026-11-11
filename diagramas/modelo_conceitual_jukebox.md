# Modelo Conceitual Entidade-Relacionamento — PROJETO JUKEBOX

Abaixo estão as versões atualizadas do diagrama conceitual na notação de **Peter Chen**, com nomenclatura formal de Engenharia de Software e Banco de Dados:

````carousel
![Modelo Conceitual JUKEBOX - Tema Escuro](C:/Users/Dougl/.gemini/antigravity/brain/22701303-ddfa-4d9e-9414-f5a4a94ad59a/modelo_conceitual_jukebox_dark.png)
<!-- slide -->
![Modelo Conceitual JUKEBOX - Tema Claro (Para Relatório PDF)](C:/Users/Dougl/.gemini/antigravity/brain/22701303-ddfa-4d9e-9414-f5a4a94ad59a/modelo_conceitual_jukebox_light.png)
````

---

## Padronização Formal Adotada

| Antes (Rascunho) | Agora (Formal / Acadêmico) | Justificativa Técnica |
| :--- | :--- | :--- |
| `<FEZ>` | **`<INTERPRETA>`** | Verbo técnico adequado para a relação entre Artista e Música. |
| `<POSSUI>` | **`<LANÇA>`** | Expressa formalmente a autoria/lançamento comercial do Álbum pelo Artista. |
| `<ESTA>` | **`<INTEGRA>`** | Indica que a faixa musical compõe/integra um determinado Álbum. |
| `<TEM>` | **`<CLASSIFICA>`** | Define que o Gênero musical categoriza/classifica a Música. |
| `ID` / `NOME` | **`id_musica`**, **`id_artista`**, **`id_album`**, **`id_genero`**, **`nome_genero` (Único)** | Identificadores explícitos no padrão *snake_case*, com `nome_genero` também demarcado como atributo único (`UNIQUE` / Chave Candidata). |
| `TITULO` / `DANCE` / `EXPLICIT` | **`titulo_musica`**, **`dancabilidade`**, **`duracao_ms`**, **`popularidade`**, **`improprio`** | Nomes descritivos em português sem abreviações informais (`improprio` mapeia a coluna booleana `explicit` do dataset). |
