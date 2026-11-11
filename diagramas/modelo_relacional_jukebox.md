# Modelo Relacional — PROJETO JUKEBOX

Abaixo está o **Modelo Relacional (Lógico)** derivado diretamente do Modelo Conceitual (MER), mantendo 100% de fidelidade aos nomes das entidades, relacionamentos, atributos e tipos de dados definidos.

````carousel
![Modelo Relacional JUKEBOX - Padrão Clássico Elmasri & Navathe](C:/Users/Dougl/.gemini/antigravity/brain/22701303-ddfa-4d9e-9414-f5a4a94ad59a/modelo_relacional_elmasri.png)
<!-- slide -->
![Modelo Relacional JUKEBOX - Tema Claro Azul](C:/Users/Dougl/.gemini/antigravity/brain/22701303-ddfa-4d9e-9414-f5a4a94ad59a/modelo_relacional_jukebox_light.png)
<!-- slide -->
![Modelo Relacional JUKEBOX - Tema Escuro](C:/Users/Dougl/.gemini/antigravity/brain/22701303-ddfa-4d9e-9414-f5a4a94ad59a/modelo_relacional_jukebox_dark.png)
````

---

## 1. Esquema Relacional (Notação Textual Formal)

Pelas regras de mapeamento ER $\rightarrow$ Relacional:
* **Entidades Fortes (`MÚSICA`, `ARTISTA`, `ÁLBUM`, `GÊNERO`)** tornam-se relações (tabelas) com suas respectivas chaves primárias (`UUID`).
* **Relacionamento `1:N` (`INTEGRA` entre `ÁLBUM` e `MÚSICA`)**: A chave primária do lado `1` (`id_album`) propaga-se como Chave Estrangeira (`FK NOT NULL`, pois a participação de `MÚSICA` é total) na relação `MUSICA`.
* **Relacionamentos `N:M` (`INTERPRETA`, `LANCA`, `CLASSIFICA`)**: Tornam-se relações associativas próprias, cuja Chave Primária Composta é formada pelas chaves estrangeiras das entidades participantes.

### Lista de Relações:

1. $\text{ALBUM }(\underline{\text{id\_album}}: \text{UUID}, \text{nome\_album}: \text{str})$
2. $\text{ARTISTA }(\underline{\text{id\_artista}}: \text{UUID}, \text{nome\_artista}: \text{str})$
3. $\text{GENERO }(\underline{\text{id\_genero}}: \text{UUID}, \underline{\text{nome\_genero}}: \text{str [UNIQUE]})$
4. $\text{MUSICA }(\underline{\text{id\_musica}}: \text{UUID}, \text{titulo\_musica}: \text{str}, \text{duracao\_ms}: \text{int}, \text{popularidade}: \text{int}, \text{dancabilidade}: \text{float}, \text{improprio}: \text{bool}, \text{id\_album}: \text{UUID [FK]})$
   * $\text{id\_album} \rightarrow \text{ALBUM}(\text{id\_album})$ *(implementa o relacionamento `INTEGRA`)*
5. $\text{INTERPRETA }(\underline{\text{id\_musica}}: \text{UUID [FK]}, \underline{\text{id\_artista}}: \text{UUID [FK]})$
   * $\text{id\_musica} \rightarrow \text{MUSICA}(\text{id\_musica})$
   * $\text{id\_artista} \rightarrow \text{ARTISTA}(\text{id\_artista})$
6. $\text{LANCA }(\underline{\text{id\_artista}}: \text{UUID [FK]}, \underline{\text{id\_album}}: \text{UUID [FK]})$
   * $\text{id\_artista} \rightarrow \text{ARTISTA}(\text{id\_artista})$
   * $\text{id\_album} \rightarrow \text{ALBUM}(\text{id\_album})$
7. $\text{CLASSIFICA }(\underline{\text{id\_musica}}: \text{UUID [FK]}, \underline{\text{id\_genero}}: \text{UUID [FK]})$
   * $\text{id\_musica} \rightarrow \text{MUSICA}(\text{id\_musica})$
   * $\text{id\_genero} \rightarrow \text{GENERO}(\text{id\_genero})$

---

## 2. Script SQL (MySQL) — Criação das Tabelas

No MySQL, campos `UUID` são armazenados de forma padrão como `CHAR(36)` (podendo ser gerados automaticamente via função nativa `UUID()`).

```sql
CREATE DATABASE IF NOT EXISTS jukebox_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jukebox_db;

-- 1. Tabela ALBUM
CREATE TABLE album (
    id_album CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_album VARCHAR(255) NOT NULL
);

-- 2. Tabela ARTISTA
CREATE TABLE artista (
    id_artista CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_artista VARCHAR(255) NOT NULL
);

-- 3. Tabela GENERO (com nome_genero único conforme modelo conceitual)
CREATE TABLE genero (
    id_genero CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_genero VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Tabela MUSICA (inclui FK id_album referente ao relacionamento 1:N INTEGRA)
CREATE TABLE musica (
    id_musica CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    titulo_musica VARCHAR(255) NOT NULL,
    duracao_ms INT NOT NULL,
    popularidade INT NOT NULL CHECK (popularidade BETWEEN 0 AND 100),
    dancabilidade FLOAT NOT NULL CHECK (dancabilidade BETWEEN 0.0 AND 1.0),
    improprio BOOLEAN NOT NULL DEFAULT FALSE,
    id_album CHAR(36) NOT NULL,
    CONSTRAINT fk_musica_album
        FOREIGN KEY (id_album) REFERENCES album(id_album)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. Tabela Associativa INTERPRETA (N:M entre MUSICA e ARTISTA)
CREATE TABLE interpreta (
    id_musica CHAR(36) NOT NULL,
    id_artista CHAR(36) NOT NULL,
    PRIMARY KEY (id_musica, id_artista),
    CONSTRAINT fk_interpreta_musica
        FOREIGN KEY (id_musica) REFERENCES musica(id_musica)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_interpreta_artista
        FOREIGN KEY (id_artista) REFERENCES artista(id_artista)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Tabela Associativa LANCA (M:N entre ARTISTA e ALBUM)
CREATE TABLE lanca (
    id_artista CHAR(36) NOT NULL,
    id_album CHAR(36) NOT NULL,
    PRIMARY KEY (id_artista, id_album),
    CONSTRAINT fk_lanca_artista
        FOREIGN KEY (id_artista) REFERENCES artista(id_artista)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_lanca_album
        FOREIGN KEY (id_album) REFERENCES album(id_album)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Tabela Associativa CLASSIFICA (N:M entre MUSICA e GENERO)
CREATE TABLE classifica (
    id_musica CHAR(36) NOT NULL,
    id_genero CHAR(36) NOT NULL,
    PRIMARY KEY (id_musica, id_genero),
    CONSTRAINT fk_classifica_musica
        FOREIGN KEY (id_musica) REFERENCES musica(id_musica)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_classifica_genero
        FOREIGN KEY (id_genero) REFERENCES genero(id_genero)
        ON DELETE CASCADE ON UPDATE CASCADE
);
```
