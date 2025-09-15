<div align="center">

# ✅ Lista de Tarefas

Aplicação moderna, responsiva e acessível — rápida, leve e totalmente em **HTML + CSS + JavaScript (Vanilla)**.

<p>
  <img src="https://img.shields.io/badge/status-ativo-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/licenca-livre-blue?style=flat-square" alt="Licença" />
  <img src="https://img.shields.io/badge/tema-light%20|%20dark-444?style=flat-square" alt="Tema" />
  <img src="https://img.shields.io/badge/drag--and--drop-on-orange?style=flat-square" alt="Arrastar e Soltar" />
  <img src="https://img.shields.io/badge/busca-instantanea-purple?style=flat-square" alt="Busca" />
  <img src="https://img.shields.io/badge/tags-filtravel-green?style=flat-square" alt="Tags" />
  <img src="https://img.shields.io/badge/foco+pomodoro-ativo-red?style=flat-square" alt="Foco e Pomodoro" />
  <img src="https://img.shields.io/badge/export/import-JSON-lightgrey?style=flat-square" alt="Export Import" />
</p>

<sub>Foco em simplicidade, fluidez e produtividade diária.</sub>

</div>

---

## ✨ Principais Funcionalidades

| Categoria | Recurso | Descrição |
|-----------|---------|-----------|
| Básico | ➕ Criar / ✏️ Editar / ✅ Concluir | Fluxo rápido, edição inline e marcação instantânea |
| Organização | 🧭 Filtros | Todas • Ativas • Concluídas |
| Ordem | 🧲 Drag & Drop | Reordenar visualmente (SortableJS) |
| Aparência | 🌗 Tema persistente | Claro / Escuro com memória | 
| Persistência | 💾 LocalStorage | Nada sai do seu navegador |
| Acesso | ♿ Acessibilidade | aria-live, foco consistente, mensagens claras |
| Busca | 🔍 Instantânea | Filtra por título ou tag em tempo real |
| Tags | 🏷️ Chips filtráveis | Digite múltiplas tags, clique para filtrar/remover |
| Exportação | 📤 JSON | Baixe um snapshot das tarefas |
| Importação | 📥 JSON | Junta (merge) sem duplicar IDs |
| Foco | 🎯 Modo Foco | Isola 1 tarefa e minimiza distração |
| Produtividade | ⏱️ Pomodoro 25:00 | Start / Pause / Reset dentro do foco |
| Feedback | 🔢 Contador | Itens restantes dinâmicos |
| Visual | ✨ Animações | Entrada, edição, conclusão e filtro suavizados |

---

## 🧪 Fluxo Rápido de Uso
1. Digite o título da tarefa e pressione Enter (ou clique ➕)
2. Opcional: adicione tags (separadas por espaço ou vírgula) antes de adicionar
3. Clique no título (Enter) para editar — Esc cancela
4. Marque o checkbox para concluir / desmarcar
5. Arraste pela alça (ícone de grip) para reordenar
6. Use filtros (Todas / Ativas / Concluídas) conforme necessário
7. Digite na busca para refinar instantaneamente (título + tags)
8. Clique em uma tag para filtrar; clique no chip de filtro para removê-la
9. Use Exportar para baixar, Importar para mesclar outra lista
10. Clique no alvo (🎯) ou botão de Foco para isolar uma tarefa e opcionalmente iniciar o Pomodoro

---

## 🏷️ Tags
| Ação | Como |
|------|------|
| Adicionar | Preencha o campo de tags junto da criação (espaço ou vírgula) |
| Formato | Aceita letras/números; `#` inicial é opcional |
| Visualização | Renderizadas como chips `#tag` abaixo do título |
| Filtrar | Clique na tag ou digite na busca |
| Remover filtro | Clique no chip em “Filtros Ativos” |

Máx. 10 tags por tarefa para evitar poluição visual.

---

## 🔍 Busca
- Instantânea (on input)
- Termo confronta: título (case insensitive) + tags
- Limpar rapidamente com o ícone de X
- Combina com filtros de estado (Ativas / Concluídas) e com filtros de tags

---

## 🎯 Modo Foco & ⏱️ Pomodoro
| Recurso | Detalhe |
|---------|---------|
| Foco | Esconde todas as outras tarefas para concentração total |
| Entrada | Botão “Foco” global ou ícone alvo da tarefa |
| Saída | Botão “Sair do Foco” | 
| Pomodoro | Timer 25:00 com Start / Pause / Reset |
| Finalização | Alerta simples ao chegar em 00:00 |
| Associação | O Pomodoro fica conceitualmente ligado à tarefa em foco |

Próximas melhorias planejadas: tempos configuráveis, pausa curta/longa, notificações.

---

## � Exportar / 📥 Importar
| Ação | Comportamento |
|------|--------------|
| Exportar | Gera arquivo `tarefas-export.json` com snapshot completo |
| Importar | Lê arquivo externo; adiciona tarefas inexistentes (merge por `id`) |
| Segurança | Nenhum envio externo; tudo roda local |

Recomendado versionar backups manualmente se usar intensamente.

---

## 💾 Persistência (LocalStorage)
| Chave | Conteúdo |
|-------|----------|
| `todo-items-v1` | Array de tarefas (inclui tags, datas, estado, ordem) |
| `todo-theme` | Tema atual (light/dark) |

Modelo da tarefa (JSON):
```json
{
  "id": "uuid",
  "title": "Texto",
  "completed": false,
  "createdAt": 1710000000000,
  "updatedAt": 1710000000000,
  "order": 0,
  "tags": ["prioridade", "estudo"]
}
```

---

## 🧱 Tecnologias & Dependências
| Categoria | Tecnologia | Uso |
|-----------|------------|-----|
| UI Base | Bootstrap 5 | Layout & utilitários |
| Ícones | Bootstrap Icons | Ações e estados |
| Animações | Animate.css + custom | Feedback visual |
| Drag & Drop | SortableJS | Reordenar tarefas |
| Datas | Day.js (defensivo) | Formatar timestamps |
| Fonte | Inter (Google Fonts) | Legibilidade |

---

## 🧩 Estrutura do Projeto
```
To-doList/
├─ index.html
├─ README.md
└─ assets/
   ├─ css/
   │  └─ style.css
   └─ js/
      └─ app.js
```

---

## ⌨️ Atalhos
| Ação | Tecla |
|------|-------|
| Adicionar tarefa | Enter no campo principal |
| Editar (entrar) | Enter sobre o título focado |
| Confirmar edição | Enter no campo de edição |
| Cancelar edição | Esc no campo de edição |
| Concluir | Espaço no checkbox (padrão navegador) |


---

## � Privacidade
Todos os dados residem apenas no seu navegador. Nenhum analytics, nenhum envio de rede.

---

## 🧭 Próximos Passos
- � PWA (manifest + cache offline)
- ☁️ Sincronização opcional (API)
- � Notificações desktop (conclusão Pomodoro) 
- 🧪 Testes automatizados
- ⚙️ Duração configurável do Pomodoro / ciclos
- 🌐 Multi-idioma

Sugestões e issues são bem-vindas.

---

## 🤝 Como Contribuir
1. Fork
2. Branch: `feature/nome` ou `fix/ajuste`
3. Commits convencionais: `feat: ...`, `fix: ...` etc.
4. Pull Request descrevendo contexto / motivação

---

## 👤 Autor
**Alvarengazy**

---


