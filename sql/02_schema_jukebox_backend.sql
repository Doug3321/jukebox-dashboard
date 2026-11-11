-- ============================================================================
-- UNIVERSIDADE FEDERAL DO RIO GRANDE DO NORTE (UFRN)
-- DCA3604 - BANCO DE DADOS (2026.2) - AVALIAÇÃO DE UNIDADE 2
-- GRUPO: Hélio Arruda, Mateus Anselmo, Alexandre Lyra, Douglas Gabriel
-- ============================================================================
-- SCHEMA 2: BACKEND DO PROJETO JUKEBOX (7 TABELAS NORMALIZADAS + VIEWS + CRUD)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS jukebox_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jukebox_db;

-- 1. Tabela ALBUM (Entidade Forte)
CREATE TABLE IF NOT EXISTS album (
    id_album CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_album VARCHAR(255) NOT NULL
);

-- 2. Tabela ARTISTA (Entidade Forte)
CREATE TABLE IF NOT EXISTS artista (
    id_artista CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_artista VARCHAR(255) NOT NULL
);

-- 3. Tabela GENERO (Entidade Forte com restrição UNIQUE em nome_genero)
CREATE TABLE IF NOT EXISTS genero (
    id_genero CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_genero VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Tabela MUSICA (Entidade Forte + FK id_album implementando o relacionamento 1:N INTEGRA)
CREATE TABLE IF NOT EXISTS musica (
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

-- 5. Tabela Associativa INTERPRETA (Relacionamento N:M entre MUSICA e ARTISTA)
CREATE TABLE IF NOT EXISTS interpreta (
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

-- 6. Tabela Associativa LANCA (Relacionamento M:N entre ARTISTA e ALBUM)
CREATE TABLE IF NOT EXISTS lanca (
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

-- 7. Tabela Associativa CLASSIFICA (Relacionamento N:M entre MUSICA e GENERO)
CREATE TABLE IF NOT EXISTS classifica (
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

-- ============================================================================
-- VIEWS DO BACKEND JUKEBOX (SCHEMA 2)
-- ============================================================================

-- VIEW 1: Catálogo Completo Desnormalizado para o Frontend Jukebox (JOIN das 7 tabelas)
CREATE OR REPLACE VIEW vw_catalogo_completo_jukebox AS
SELECT 
    m.id_musica,
    m.titulo_musica,
    a.id_album,
    a.nome_album,
    GROUP_CONCAT(DISTINCT ar.nome_artista ORDER BY ar.nome_artista SEPARATOR '; ') AS artistas,
    GROUP_CONCAT(DISTINCT g.nome_genero ORDER BY g.nome_genero SEPARATOR ', ') AS generos,
    m.duracao_ms,
    ROUND(m.duracao_ms / 60000.0, 2) AS duracao_min,
    m.popularidade,
    m.dancabilidade,
    m.improprio
FROM musica m
INNER JOIN album a ON m.id_album = a.id_album
LEFT JOIN interpreta i ON m.id_musica = i.id_musica
LEFT JOIN artista ar ON i.id_artista = ar.id_artista
LEFT JOIN classifica c ON m.id_musica = c.id_musica
LEFT JOIN genero g ON c.id_genero = g.id_genero
GROUP BY 
    m.id_musica, m.titulo_musica, a.id_album, a.nome_album, 
    m.duracao_ms, m.popularidade, m.dancabilidade, m.improprio;

-- VIEW 2: Ranking de Artistas no Jukebox (Agregação com COUNT, AVG, MAX, MIN, SUM)
CREATE OR REPLACE VIEW vw_ranking_artistas AS
SELECT 
    ar.id_artista,
    ar.nome_artista,
    COUNT(DISTINCT i.id_musica) AS total_musicas,
    COUNT(DISTINCT l.id_album) AS total_albuns,
    ROUND(AVG(m.popularidade), 1) AS media_popularidade,
    MAX(m.popularidade) AS maior_popularidade,
    MIN(m.popularidade) AS menor_popularidade,
    ROUND(AVG(m.dancabilidade), 3) AS media_dancabilidade,
    ROUND(SUM(m.duracao_ms) / 60000.0, 1) AS soma_duracao_minutos
FROM artista ar
INNER JOIN interpreta i ON ar.id_artista = i.id_artista
INNER JOIN musica m ON i.id_musica = m.id_musica
LEFT JOIN lanca l ON ar.id_artista = l.id_artista
GROUP BY ar.id_artista, ar.nome_artista;

-- VIEW 3: Estatísticas do Catálogo Jukebox por Gênero (AVG, MAX, MIN, SUM)
CREATE OR REPLACE VIEW vw_resumo_generos_jukebox AS
SELECT 
    g.id_genero,
    g.nome_genero,
    COUNT(DISTINCT c.id_musica) AS qtd_musicas,
    ROUND(AVG(m.popularidade), 1) AS media_popularidade,
    MAX(m.popularidade) AS max_popularidade,
    MIN(m.popularidade) AS min_popularidade,
    ROUND(AVG(m.dancabilidade), 3) AS media_dancabilidade,
    ROUND(SUM(m.duracao_ms) / 60000.0, 1) AS total_minutos
FROM genero g
INNER JOIN classifica c ON g.id_genero = c.id_genero
INNER JOIN musica m ON c.id_musica = m.id_musica
GROUP BY g.id_genero, g.nome_genero;

-- ============================================================================
-- OPERAÇÕES CRUD DO DASHBOARD (EXEMPLOS DE TRANSAÇÕES EXECUTADAS PELO BACKEND)
-- ============================================================================

-- [CREATE / INSERT]: Inserção de nova música normalizada nas 7 tabelas
-- SET @id_alb = UUID(); SET @id_art = UUID(); SET @id_gen = UUID(); SET @id_mus = UUID();
-- INSERT INTO album (id_album, nome_album) VALUES (@id_alb, 'After Hours');
-- INSERT INTO artista (id_artista, nome_artista) VALUES (@id_art, 'The Weeknd');
-- INSERT IGNORE INTO genero (id_genero, nome_genero) VALUES (@id_gen, 'synth-pop');
-- INSERT INTO musica (id_musica, titulo_musica, duracao_ms, popularidade, dancabilidade, improprio, id_album)
--   VALUES (@id_mus, 'Blinding Lights', 200040, 95, 0.514, FALSE, @id_alb);
-- INSERT INTO lanca (id_artista, id_album) VALUES (@id_art, @id_alb);
-- INSERT INTO interpreta (id_musica, id_artista) VALUES (@id_mus, @id_art);
-- INSERT INTO classifica (id_musica, id_genero) VALUES (@id_mus, @id_gen);

-- [READ / SELECT]: Consulta parametrizada com filtros no catálogo
-- SELECT * FROM vw_catalogo_completo_jukebox WHERE titulo_musica LIKE '%Love%' ORDER BY popularidade DESC;

-- [UPDATE / ALTERAÇÃO]: Atualização de atributos de uma música existente
-- UPDATE musica SET titulo_musica = 'Blinding Lights (Remastered)', popularidade = 98, dancabilidade = 0.550, improprio = FALSE WHERE id_musica = @id_mus;

-- [DELETE / REMOÇÃO REAL]: Exclusão física da música no banco de dados
-- Graças à cláusula ON DELETE CASCADE nas tabelas associativas (interpreta e classifica),
-- o SGBD remove automaticamente os vínculos N:M antes de remover o registro em musica:
-- DELETE FROM musica WHERE id_musica = @id_mus;
