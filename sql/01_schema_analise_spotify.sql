-- ============================================================================
-- UNIVERSIDADE FEDERAL DO RIO GRANDE DO NORTE (UFRN)
-- DCA3604 - BANCO DE DADOS (2026.2) - AVALIAÇÃO DE UNIDADE 2
-- GRUPO: Hélio Arruda, Mateus Anselmo, Alexandre Lyra, Douglas Gabriel
-- ============================================================================
-- SCHEMA 1: ANÁLISE DE DADOS PÚBLICOS (SPOTIFY TRACKS DATASET - KAGGLE)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS spotify_analise
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE spotify_analise;

-- 1. Tabela Bruta para Importação do CSV do Kaggle (114.000 registros)
CREATE TABLE IF NOT EXISTS spotify_tracks_raw (
    row_id INT PRIMARY KEY,
    track_id VARCHAR(64) NOT NULL,
    artists TEXT NOT NULL,
    album_name VARCHAR(500) NOT NULL,
    track_name VARCHAR(500) NOT NULL,
    popularity INT NOT NULL,
    duration_ms INT NOT NULL,
    explicit BOOLEAN NOT NULL,
    danceability FLOAT NOT NULL,
    energy FLOAT NOT NULL,
    track_key INT,
    loudness FLOAT,
    mode INT,
    speechiness FLOAT,
    acousticness FLOAT,
    instrumentalness FLOAT,
    liveness FLOAT,
    valence FLOAT,
    tempo FLOAT,
    time_signature INT,
    track_genre VARCHAR(100) NOT NULL,
    INDEX idx_track_genre (track_genre),
    INDEX idx_track_id (track_id),
    INDEX idx_popularity (popularity)
);

-- ============================================================================
-- VIEWS ANALÍTICAS (SCHEMA 1)
-- ============================================================================

-- VIEW 1: Estatísticas Agregadas por Gênero Musical (AVG, MAX, MIN, SUM, COUNT)
CREATE OR REPLACE VIEW vw_estatisticas_por_genero AS
SELECT 
    track_genre AS genero,
    COUNT(*) AS total_registros,
    COUNT(DISTINCT track_id) AS faixas_unicas,
    ROUND(AVG(popularity), 2) AS media_popularidade,
    MAX(popularity) AS max_popularidade,
    MIN(popularity) AS min_popularidade,
    ROUND(AVG(danceability), 3) AS media_dancabilidade,
    MAX(danceability) AS max_dancabilidade,
    MIN(danceability) AS min_dancabilidade,
    ROUND(AVG(energy), 3) AS media_energia,
    ROUND(AVG(duration_ms) / 1000.0, 1) AS media_duracao_seg,
    ROUND(SUM(duration_ms) / 3600000.0, 2) AS soma_duracao_horas,
    SUM(CASE WHEN explicit = 1 THEN 1 ELSE 0 END) AS total_explicitas
FROM spotify_tracks_raw
GROUP BY track_genre;

-- VIEW 2: Comparativo de Conteúdo Explícito vs. Livre (Agregações Globais)
CREATE OR REPLACE VIEW vw_comparativo_explicito AS
SELECT 
    CASE WHEN explicit = 1 THEN 'Explícito (Impróprio)' ELSE 'Livre (Limpo)' END AS classificacao,
    COUNT(*) AS total_faixas,
    ROUND(AVG(popularity), 2) AS media_popularidade,
    MAX(popularity) AS max_popularidade,
    MIN(popularity) AS min_popularidade,
    ROUND(AVG(danceability), 3) AS media_dancabilidade,
    ROUND(AVG(energy), 3) AS media_energia,
    ROUND(SUM(duration_ms) / 3600000.0, 2) AS soma_horas_audio
FROM spotify_tracks_raw
GROUP BY explicit;

-- ============================================================================
-- CONSULTAS DE ANÁLISE E AGREGAÇÃO EXIGIDAS (MAX, MIN, AVG, SUM, COUNT)
-- ============================================================================

-- Consulta 1: Resumo Estatístico Global do Dataset (MAX, MIN, AVG, SUM, COUNT)
SELECT 
    COUNT(*) AS total_linhas_csv,
    COUNT(DISTINCT track_id) AS total_musicas_unicas,
    COUNT(DISTINCT track_genre) AS total_generos,
    ROUND(AVG(popularity), 2) AS popularidade_media,
    MAX(popularity) AS popularidade_maxima,
    MIN(popularity) AS popularidade_minima,
    ROUND(AVG(danceability), 3) AS dancabilidade_media,
    MAX(danceability) AS dancabilidade_maxima,
    MIN(danceability) AS dancabilidade_minima,
    ROUND(AVG(duration_ms) / 60000.0, 2) AS duracao_media_minutos,
    ROUND(MAX(duration_ms) / 60000.0, 2) AS maior_duracao_minutos,
    ROUND(MIN(duration_ms) / 1000.0, 2) AS menor_duracao_segundos,
    ROUND(SUM(duration_ms) / 3600000.0, 2) AS soma_total_horas_musica
FROM spotify_tracks_raw;

-- Consulta 2: Top 15 Gêneros Mais Populares com Funções de Agregação
SELECT * FROM vw_estatisticas_por_genero
ORDER BY media_popularidade DESC
LIMIT 15;

-- Consulta 3: Top 15 Gêneros Mais Dançantes
SELECT * FROM vw_estatisticas_por_genero
ORDER BY media_dancabilidade DESC
LIMIT 15;

-- Consulta 4: Identificação de Músicas Polimórficas (Mesmo track_id em múltiplos gêneros)
-- Esta descoberta na Análise de Dados justificou o relacionamento N:M (CLASSIFICA) no Schema 2!
SELECT 
    track_id,
    MAX(track_name) AS titulo_musica,
    MAX(artists) AS artistas,
    COUNT(DISTINCT track_genre) AS qtd_generos,
    GROUP_CONCAT(DISTINCT track_genre ORDER BY track_genre SEPARATOR ', ') AS lista_generos,
    MAX(popularity) AS popularidade
FROM spotify_tracks_raw
GROUP BY track_id
HAVING COUNT(DISTINCT track_genre) > 1
ORDER BY qtd_generos DESC, popularidade DESC
LIMIT 20;
