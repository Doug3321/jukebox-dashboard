-- =============================================================================
-- PROJETO JUKEBOX - SCRIPT DDL DE CRIAÇÃO DO BANCO DE DADOS (MySQL 8.0)
-- Disciplina: DCA3604 - Banco de Dados (UFRN 2026.2)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS jukebox
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jukebox;

-- 1. TABELA ALBUM
CREATE TABLE IF NOT EXISTS album (
    id_album VARCHAR(64) NOT NULL,
    nome_album VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_album),
    INDEX idx_album_nome (nome_album)
) ENGINE=InnoDB;

-- 2. TABELA ARTISTA
CREATE TABLE IF NOT EXISTS artista (
    id_artista VARCHAR(64) NOT NULL,
    nome_artista VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_artista),
    INDEX idx_artista_nome (nome_artista)
) ENGINE=InnoDB;

-- 3. TABELA GENERO
CREATE TABLE IF NOT EXISTS genero (
    id_genero VARCHAR(64) NOT NULL,
    nome_genero VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (id_genero)
) ENGINE=InnoDB;

-- 4. TABELA MUSICA
CREATE TABLE IF NOT EXISTS musica (
    id_musica VARCHAR(64) NOT NULL,
    titulo_musica VARCHAR(255) NOT NULL,
    duracao_ms INT NOT NULL,
    popularidade INT NOT NULL,
    dancabilidade FLOAT NOT NULL,
    improprio BOOLEAN NOT NULL DEFAULT FALSE,
    id_album VARCHAR(64) NULL,
    PRIMARY KEY (id_musica),
    INDEX idx_musica_pop (popularidade),
    INDEX idx_musica_titulo (titulo_musica),
    CONSTRAINT fk_musica_album FOREIGN KEY (id_album)
        REFERENCES album (id_album) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. TABELA INTERPRETA (Relação N:M entre MUSICA e ARTISTA)
CREATE TABLE IF NOT EXISTS interpreta (
    id_musica VARCHAR(64) NOT NULL,
    id_artista VARCHAR(64) NOT NULL,
    PRIMARY KEY (id_musica, id_artista),
    CONSTRAINT fk_interpreta_musica FOREIGN KEY (id_musica)
        REFERENCES musica (id_musica) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_interpreta_artista FOREIGN KEY (id_artista)
        REFERENCES artista (id_artista) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. TABELA LANCA (Relação N:M entre ARTISTA e ALBUM)
CREATE TABLE IF NOT EXISTS lanca (
    id_artista VARCHAR(64) NOT NULL,
    id_album VARCHAR(64) NOT NULL,
    PRIMARY KEY (id_artista, id_album),
    CONSTRAINT fk_lanca_artista FOREIGN KEY (id_artista)
        REFERENCES artista (id_artista) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_lanca_album FOREIGN KEY (id_album)
        REFERENCES album (id_album) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. TABELA CLASSIFICA (Relação N:M entre MUSICA e GENERO)
CREATE TABLE IF NOT EXISTS classifica (
    id_musica VARCHAR(64) NOT NULL,
    id_genero VARCHAR(64) NOT NULL,
    PRIMARY KEY (id_musica, id_genero),
    CONSTRAINT fk_classifica_musica FOREIGN KEY (id_musica)
        REFERENCES musica (id_musica) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_classifica_genero FOREIGN KEY (id_genero)
        REFERENCES genero (id_genero) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
