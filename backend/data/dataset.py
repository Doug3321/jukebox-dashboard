
import pandas as pd
import uuid

from sqlalchemy import create_engine


# ==================================================
# 1. CONFIGURACAO DO MYSQL
# ==================================================
import os
from pathlib import Path

USUARIO = os.getenv("DB_USER", "root")
SENHA = os.getenv("DB_PASSWORD", "root123")
HOST = os.getenv("DB_HOST", "localhost")
PORTA = os.getenv("DB_PORT", "3306")
BANCO = os.getenv("DB_NAME", "jukebox")

engine = create_engine(
    f"mysql+pymysql://{USUARIO}:{SENHA}@{HOST}:{PORTA}/{BANCO}",
    pool_pre_ping=True
)


# ==================================================
# 2. FUNCAO PARA GERAR UUID
# ==================================================

def novo_uuid():
    return str(uuid.uuid4())


# ==================================================
# 3. LEITURA DO DATASET
# ==================================================

diretorio_atual = Path(__file__).resolve().parent
arquivo_csv = diretorio_atual / "datasetFiltrado.csv"
if not arquivo_csv.exists():
    arquivo_csv = diretorio_atual / "dataset.csv"

print(f"\nLendo dataset de {arquivo_csv}...")

df = pd.read_csv(arquivo_csv)

# Colunas que serao utilizadas
colunas = [
    "track_id",
    "track_name",
    "artists",
    "album_name",
    "popularity",
    "duration_ms",
    "danceability",
    "explicit",
    "track_genre"
]

# Verifica se as colunas existem
faltantes = set(colunas) - set(df.columns)

if faltantes:
    raise ValueError(
        f"Colunas ausentes no dataset: {faltantes}"
    )

df = df[colunas].copy()

print(f"Total de linhas originais: {len(df)}")


# ==================================================
# 4. LIMPEZA DOS DADOS
# ==================================================

# Remove registros sem identificador ou informacoes
# essenciais para o modelo.

df = df.dropna(
    subset=[
        "track_id",
        "track_name",
        "artists",
        "album_name",
        "track_genre"
    ]
)

# Limpa espacos dos campos textuais
for coluna in [
    "track_id",
    "track_name",
    "artists",
    "album_name",
    "track_genre"
]:
    df[coluna] = df[coluna].astype(str).str.strip()

# Remove campos vazios
for coluna in [
    "track_id",
    "track_name",
    "artists",
    "album_name",
    "track_genre"
]:
    df = df[df[coluna] != ""]

# Converte campos numericos
df["duration_ms"] = pd.to_numeric(
    df["duration_ms"], errors="coerce"
)

df["popularity"] = pd.to_numeric(
    df["popularity"], errors="coerce"
)

df["danceability"] = pd.to_numeric(
    df["danceability"], errors="coerce"
)

# Converte explicit para booleano
df["explicit"] = (
    df["explicit"]
    .astype(str)
    .str.strip()
    .str.lower()
    .map({
        "true": True,
        "false": False
    })
)

# Remove registros com dados invalidos
df = df.dropna(
    subset=[
        "duration_ms",
        "popularity",
        "danceability",
        "explicit"
    ]
)

# Verifica valores dentro dos intervalos esperados
df = df[
    (df["duration_ms"] >= 0) &
    (df["popularity"].between(0, 100)) &
    (df["danceability"].between(0, 1))
]

print(f"Total de linhas validas: {len(df)}")


# ==================================================
# 5. DICIONARIOS E ESTRUTURAS DE DADOS
# ==================================================

# O track_id sera utilizado para identificar
# musicas unicas.

musicas = {}

artistas = {}
albuns = {}
generos = {}

# Listas das tabelas principais
dados_musica = []
dados_artista = []
dados_album = []
dados_genero = []

# Conjuntos dos relacionamentos
dados_interpreta = set()
dados_lanca = set()
dados_classifica = set()


# ==================================================
# 6. PROCESSAMENTO DAS MUSICAS
# ==================================================

print("\nProcessando registros...")

for _, linha in df.iterrows():

    track_id = linha["track_id"]

    # ----------------------------------------------
    # ALBUM
    # ----------------------------------------------

    nome_album = linha["album_name"]

    if nome_album not in albuns:

        id_album = novo_uuid()

        albuns[nome_album] = id_album

        dados_album.append({
            "id_album": id_album,
            "nome_album": nome_album
        })

    id_album = albuns[nome_album]


    # ----------------------------------------------
    # MUSICA
    # ----------------------------------------------

    # Verifica se o track_id ja existe.
    # Se existir, reutiliza o UUID.
    # Se nao existir, cria uma nova musica.

    if track_id not in musicas:

        id_musica = novo_uuid()

        musicas[track_id] = id_musica

        dados_musica.append({
            "id_musica": id_musica,
            "titulo_musica": linha["track_name"],
            "duracao_ms": int(linha["duration_ms"]),
            "popularidade": int(linha["popularity"]),
            "dancabilidade": float(linha["danceability"]),
            "improprio": bool(linha["explicit"]),
            "id_album": id_album
        })

    id_musica = musicas[track_id]


    # ----------------------------------------------
    # ARTISTAS
    # ----------------------------------------------

    lista_artistas = [
        artista.strip()
        for artista in linha["artists"].split(";")
        if artista.strip()
    ]

    for nome_artista in lista_artistas:

        if nome_artista not in artistas:

            id_artista = novo_uuid()

            artistas[nome_artista] = id_artista

            dados_artista.append({
                "id_artista": id_artista,
                "nome_artista": nome_artista
            })

        id_artista = artistas[nome_artista]

        # Relacionamento entre musica e artista
        dados_interpreta.add(
            (id_musica, id_artista)
        )

        # Relacionamento entre artista e album
        dados_lanca.add(
            (id_artista, id_album)
        )


    # ----------------------------------------------
    # GENEROS
    # ----------------------------------------------

    nome_genero = linha["track_genre"]

    if nome_genero not in generos:

        id_genero = novo_uuid()

        generos[nome_genero] = id_genero

        dados_genero.append({
            "id_genero": id_genero,
            "nome_genero": nome_genero
        })

    id_genero = generos[nome_genero]

    # Uma musica pode possuir varios generos.
    # O conjunto evita relacionamentos duplicados.

    dados_classifica.add(
        (id_musica, id_genero)
    )


# ==================================================
# 7. CONVERSAO DOS RELACIONAMENTOS
# ==================================================

print("\nOrganizando relacionamentos...")

df_interpreta = pd.DataFrame(
    list(dados_interpreta),
    columns=["id_musica", "id_artista"]
)

df_lanca = pd.DataFrame(
    list(dados_lanca),
    columns=["id_artista", "id_album"]
)

df_classifica = pd.DataFrame(
    list(dados_classifica),
    columns=["id_musica", "id_genero"]
)


# ==================================================
# 8. CRIACAO DOS DATAFRAMES
# ==================================================

tabelas = {

    "album": pd.DataFrame(dados_album),

    "artista": pd.DataFrame(dados_artista),

    "genero": pd.DataFrame(dados_genero),

    "musica": pd.DataFrame(dados_musica),

    "interpreta": df_interpreta,

    "lanca": df_lanca,

    "classifica": df_classifica

}


# ==================================================
# 9. RESUMO ANTES DA IMPORTACAO
# ==================================================

print("\n==========================================")
print("RESUMO DOS DADOS")
print("==========================================")

for tabela, dados in tabelas.items():

    print(
        f"{tabela}: {len(dados)} registros"
    )

print("------------------------------------------")
print(f"Musicas unicas: {len(musicas)}")
print(f"Artistas unicos: {len(artistas)}")
print(f"Albuns unicos: {len(albuns)}")
print(f"Generos unicos: {len(generos)}")
print("==========================================")


# ==================================================
# 10. IMPORTACAO PARA O MYSQL
# ==================================================

print("\nIniciando importacao para o MySQL...")

ordem = [
    "album",
    "artista",
    "genero",
    "musica",
    "interpreta",
    "lanca",
    "classifica"
]

try:

    # Todas as insercoes ficam dentro de uma transacao.
    # Se ocorrer erro, as insercoes serao revertidas.

    with engine.begin() as conexao:

        for tabela in ordem:

            dados = tabelas[tabela]

            if not dados.empty:

                dados.to_sql(
                    name=tabela,
                    con=conexao,
                    if_exists="append",
                    index=False,
                    chunksize=1000,
                    method="multi"
                )

                print(
                    f"{tabela}: {len(dados)} registros inseridos."
                )

    print("\n==========================================")
    print("IMPORTACAO CONCLUIDA COM SUCESSO!")
    print("==========================================")

except Exception as erro:

    print("\nERRO DURANTE A IMPORTACAO!")

    print(erro)

finally:

    engine.dispose()
