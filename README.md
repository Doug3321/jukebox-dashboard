# 🎧 Projeto Jukebox • Dashboard & Backend

Sistema desenvolvido para a disciplina **DCA3604 - Banco de Dados (2026.2)** da **Universidade Federal do Rio Grande do Norte (UFRN)**.

## 👥 Equipe
* Hélio Arruda Câmara Neto
* Mateus Anselmo do Nascimento
* Alexandre Lyra Melo dos Reis
* Douglas Gabriel da Silva Araujo

---

## 🏗️ Arquitetura

O projeto é dividido em camadas bem definidas:

* **Frontend (`/frontend`):**
  * Desenvolvido em **React + Vite** com **Recharts**.
  * Arquitetura em camadas: `views`, `controllers` (custom hooks), `services` (API + fallback mock) e `custom` (componentes reutilizáveis e tema).
  * Dashboard interativo com KPIs de agregação (`AVG`, `MAX`, `MIN`, `SUM`), gráficos de gêneros, artistas mais frequentes, distribuição de popularidade e conteúdo explícito.

* **Backend (`/backend`):**
  * Desenvolvido em **FastAPI** (Python).
  * Arquitetura limpa: `controllers` (rotas HTTP), `services` (regras e estatísticas), `repositories` (abstração de dados via interface), `entities` (modelos de domínio) e `schemas` (DTOs Pydantic).
  * Suporta duas fontes de dados via `DATA_SOURCE`:
    * `csv`: leitura e normalização em memória do `dataset.csv` (modo desenvolvimento/análise).
    * `mysql`: conexão com o banco relacional normalizado `jukebox_db`.

* **Modelagem e SQL (`/sql` e `/diagramas`):**
  * Scripts DDL para os dois schemas (`spotify_analise` e `jukebox_db`).
  * Diagramas Conceitual (MER) e Relacional (Elmasri & Navathe).

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* **Python 3.10+**
* **Node.js 18+** e **npm**

### 2. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
* API disponível em: `http://localhost:8000`
* Documentação interativa (Swagger): `http://localhost:8000/docs`

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
* Dashboard disponível em: `http://localhost:5173`
