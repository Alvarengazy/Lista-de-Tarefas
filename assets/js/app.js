(function(){
  const DEBUG = true;
  const log = {
    info: (...a)=> DEBUG && console.info('[Lista]', ...a),
    warn: (...a)=> DEBUG && console.warn('[Lista]', ...a),
    error: (...a)=> DEBUG && console.error('[Lista]', ...a)
  };
  log.info('Script inicializando...');
  const dom = {
    form: document.getElementById('taskForm'),
    input: document.getElementById('taskInput'),
    tagsInput: document.getElementById('tagsInput'),
    list: document.getElementById('taskList'),
    itemsLeft: document.getElementById('itemsLeft'),
    clearCompleted: document.getElementById('clearCompleted'),
    filterButtons: document.querySelectorAll('[data-filter]'),
    toggleTheme: document.getElementById('toggleTheme'),
    year: document.getElementById('year'),
    lastSaved: document.getElementById('lastSaved'),
    search: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    focusModeBtn: document.getElementById('focusModeBtn'),
    pomodoroBtn: document.getElementById('pomodoroBtn'),
    focusPanel: document.getElementById('focusPanel'),
    focusTaskText: document.getElementById('focusTaskText'),
    exitFocusBtn: document.getElementById('exitFocusBtn'),
    pomodoroPanel: document.getElementById('pomodoroPanel'),
    pomodoroTimer: document.getElementById('pomodoroTimer'),
    pomodoroStart: document.getElementById('pomodoroStart'),
    pomodoroPause: document.getElementById('pomodoroPause'),
    pomodoroReset: document.getElementById('pomodoroReset'),
    activeFilters: document.getElementById('activeFilters')
  };

  const STORAGE_KEY = 'todo-items-v1';
  const THEME_KEY = 'todo-theme';
  let tasks = []; // {id, title, completed, createdAt, updatedAt, order, tags:[]}
  let currentFilter = 'all'; // valores internos permanecem em inglês para simplicidade
  let searchTerm = '';
  let tagFilters = new Set();
  let focusTaskId = null;

  // Pomodoro
  let pomodoroTotal = 25 * 60; // segundos
  let pomodoroRemaining = pomodoroTotal;
  let pomodoroInterval = null;

  function uuid(){
    try {
      if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
      }
    } catch(e) { /* ignore */ }
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(16).slice(2,10);
  }

  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); updateLastSaved(); }
  function load(){
    try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); tasks = Array.isArray(data)? data: []; } catch { tasks = []; }
  }

  function safeDayjs(ts){
    if (typeof dayjs === 'function') return dayjs(ts);
    // Fallback mínimo se dayjs não carregar
    return { format: () => new Date(ts || Date.now()).toLocaleTimeString('pt-BR') };
  }

  function updateLastSaved(){
    if(!dom.lastSaved) return;
    dom.lastSaved.classList.remove('d-none');
    try {
      dom.lastSaved.textContent = 'Salvo ' + safeDayjs().format('HH:mm:ss');
    } catch(e){
      dom.lastSaved.textContent = 'Salvo';
      log.warn('Falha ao formatar horário de salvamento', e);
    }
  }

  function persistOrder(){
    [...dom.list.children].forEach((li, index) => {
      const id = li.getAttribute('data-id');
      const task = tasks.find(t=>t.id===id); if(task){ task.order = index; task.updatedAt = Date.now(); }
    });
    save();
  }

  function parseTags(raw){
    if(!raw) return [];
    return raw.split(/[,\s]+/).map(t=> t.trim().replace(/^#+/,'').toLowerCase()).filter(Boolean).slice(0,10);
  }

  function addTask(title){
    const now = Date.now();
    const tags = parseTags(dom.tagsInput?.value || '');
    const task = { id: uuid(), title: title.trim(), completed:false, createdAt: now, updatedAt: now, order: tasks.length ? Math.max(...tasks.map(t=>t.order||0))+1 : 0, tags };
    tasks.push(task);
    save();
    renderTask(task, true, {animateNew:true});
    updateCounters();
    if(dom.tagsInput) dom.tagsInput.value='';
  }

  function updateTask(id, patch){
    const task = tasks.find(t=>t.id===id); if(!task) return;
    Object.assign(task, patch, {updatedAt: Date.now()});
    save();
  }

  function deleteTask(id){
    tasks = tasks.filter(t=>t.id!==id);
    save();
    const li = dom.list.querySelector('[data-id="'+id+'"]');
    if(li){ li.classList.add('slide-out'); setTimeout(()=> li.remove(), 290); }
    updateCounters();
  }

  function toggleComplete(id){
    const task = tasks.find(t=>t.id===id); if(!task) return;
    task.completed = !task.completed; task.updatedAt = Date.now(); save();
    const li = dom.list.querySelector('[data-id="'+id+'"]');
    if(li){
      const titleEl = li.querySelector('.task-title');
      titleEl.classList.toggle('completed', task.completed);
      li.classList.remove('anim-pulse-complete');
      void li.offsetWidth; // reflow para reiniciar animação
      li.classList.add('anim-pulse-complete');
    }
    updateCounters();
  }

  function clearCompleted(){
    const completedIds = tasks.filter(t=>t.completed).map(t=>t.id);
    if(!completedIds.length) return;
    tasks = tasks.filter(t=>!t.completed); save();
    completedIds.forEach(id=>{
      const li = dom.list.querySelector('[data-id="'+id+'"]');
      if(li){ li.classList.add('slide-out'); setTimeout(()=> li.remove(), 280); }
    });
    updateCounters();
  }

  function filteredTasks(){
    let list = tasks;
    if(currentFilter==='active') list = list.filter(t=>!t.completed);
    else if(currentFilter==='completed') list = list.filter(t=>t.completed);
    if(searchTerm){
      const term = searchTerm.toLowerCase();
      list = list.filter(t=> t.title.toLowerCase().includes(term) || (t.tags||[]).some(tag=> tag.includes(term)) );
    }
    if(tagFilters.size){
      list = list.filter(t=> (t.tags||[]).some(tag=> tagFilters.has(tag)));
    }
    return list;
  }

  function formatDate(ts){
    try { return safeDayjs(ts).format('DD MMM YYYY HH:mm'); }
    catch(e){ return new Date(ts).toLocaleString('pt-BR'); }
  }

  function render(){
    dom.list.classList.add('anim-filter-fade');
    dom.list.innerHTML='';
    filteredTasks().sort((a,b)=> (a.order||0)-(b.order||0)).forEach(t=> renderTask(t,false));
    updateCounters();
  }

  function renderTask(task, prepend, opts={}){
    if(currentFilter==='active' && task.completed) return;
    if(currentFilter==='completed' && !task.completed) return;
    const li = document.createElement('li');
    li.className='list-group-item fade-in';
    li.setAttribute('data-id', task.id);
    li.innerHTML = `
      <div class="task-item" draggable="false">
        <div class="form-check d-flex align-items-start pt-1">
          <input class="form-check-input mt-0" type="checkbox" ${task.completed?'checked':''} aria-label="Concluir tarefa" />
        </div>
        <div class="task-content">
          <div class="task-title ${task.completed?'completed':''}" tabindex="0">${escapeHtml(task.title)}</div>
          <input class="form-control form-control-sm edit-field" maxlength="140" />
          <div class="task-meta">Criada: ${formatDate(task.createdAt)}</div>
          ${(task.tags && task.tags.length)? `<div class="task-tags">${task.tags.map(t=> `<span class='task-tag' data-tag='${t}'>#${t}</span>`).join('')}</div>`:''}
        </div>
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn-icon" data-action="edit" title="Editar" aria-label="Editar tarefa"><i class="bi bi-pencil-square"></i></button>
          <button class="btn-icon" data-action="delete" title="Remover" aria-label="Remover tarefa"><i class="bi bi-trash3"></i></button>
          <span class="btn-icon cursor-move text-secondary" data-drag-handle title="Arrastar" aria-label="Reordenar"><i class="bi bi-grip-vertical"></i></span>
          <button class="btn-icon" data-action="focus" title="Focar" aria-label="Focar tarefa"><i class="bi bi-bullseye"></i></button>
        </div>
      </div>`;
    if(opts.animateNew){
      li.classList.add('anim-scale-in','task-recent');
      const titleEl = li.querySelector('.task-title');
      if(document.documentElement.getAttribute('data-theme')==='dark'){
        titleEl.classList.add('task-title-nova');
        setTimeout(()=> titleEl.classList.remove('task-title-nova'), 2400);
      }
      setTimeout(()=> li.classList.remove('task-recent'), 1600);
    }
    if(prepend) dom.list.prepend(li); else dom.list.append(li);
  }

  function updateCounters(){
    const active = tasks.filter(t=>!t.completed).length;
    dom.itemsLeft.textContent = active + (active===1 ? ' item restante' : ' itens restantes');
  }

  function updateActiveFiltersUI(){
    if(!dom.activeFilters) return;
    dom.activeFilters.innerHTML = '';
    tagFilters.forEach(tag=>{
      const span = document.createElement('span');
      span.className='tag-chip active';
      span.textContent = '#'+tag;
      span.title='Remover filtro '+tag;
      span.addEventListener('click', ()=>{ tagFilters.delete(tag); updateActiveFiltersUI(); render(); });
      dom.activeFilters.append(span);
    });
    if(!tagFilters.size && !searchTerm){
      dom.activeFilters.innerHTML = '<span class="text-secondary">Nenhum filtro ativo</span>';
    }
  }

  function setFilter(filter){
    currentFilter = filter;
    dom.filterButtons.forEach(btn=> btn.classList.toggle('active', btn.getAttribute('data-filter')===filter));
    render();
  }

  function setSearch(value){
    searchTerm = value.trim();
    if(dom.clearSearch){ dom.clearSearch.classList.toggle('d-none', !searchTerm); }
    render();
    updateActiveFiltersUI();
  }

  function toggleTagFilter(tag){
    if(tagFilters.has(tag)) tagFilters.delete(tag); else tagFilters.add(tag);
    updateActiveFiltersUI();
    render();
  }

  // Export / Import
  function exportTasks(){
    const data = JSON.stringify({ exportedAt: new Date().toISOString(), tasks }, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tarefas-export.json';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function importTasks(file){
    const reader = new FileReader();
    reader.onload = e=>{
      try {
        const json = JSON.parse(e.target.result);
        if(Array.isArray(json.tasks)){
          let added = 0;
            json.tasks.forEach(t=>{
              if(!tasks.find(x=>x.id===t.id)) { tasks.push(t); added++; }
            });
          save();
          console.info('[Lista] Importação concluída. Adicionados:', added);
          render();
        }
      } catch(err){ console.error('Falha ao importar', err); }
    };
    reader.readAsText(file);
  }

  // Foco / Pomodoro
  function enterFocus(taskId){
    focusTaskId = taskId;
    if(dom.focusPanel){ dom.focusPanel.classList.remove('d-none'); }
    updateFocusPanel();
  }

  function exitFocus(){
    focusTaskId = null;
    if(dom.focusPanel){ dom.focusPanel.classList.add('d-none'); }
    stopPomodoro();
    showAllTasks();
  }

  function showAllTasks(){
    [...dom.list.children].forEach(li=> li.classList.remove('focus-hidden'));
  }

  function updateFocusPanel(){
    if(!dom.focusTaskText) return;
    const task = tasks.find(t=> t.id===focusTaskId);
    if(!task){ exitFocus(); return; }
    dom.focusTaskText.textContent = task.title + (task.tags?.length? '  '+task.tags.map(t=>'#'+t).join(' '):'');
    // Esconde outras
    [...dom.list.children].forEach(li=>{
      const id = li.getAttribute('data-id');
      li.classList.toggle('focus-hidden', id!==focusTaskId);
    });
  }

  function updatePomodoroDisplay(){
    if(!dom.pomodoroTimer) return;
    const m = Math.floor(pomodoroRemaining/60).toString().padStart(2,'0');
    const s = (pomodoroRemaining%60).toString().padStart(2,'0');
    dom.pomodoroTimer.textContent = `${m}:${s}`;
  }

  function startPomodoro(){
    if(pomodoroInterval) return;
    if(dom.pomodoroPanel) dom.pomodoroPanel.classList.remove('d-none');
    pomodoroInterval = setInterval(()=>{
      pomodoroRemaining--;
      if(pomodoroRemaining<=0){
        pomodoroRemaining = 0; updatePomodoroDisplay(); stopPomodoro(); alert('Pomodoro finalizado!'); return;
      }
      updatePomodoroDisplay();
    }, 1000);
  }

  function pausePomodoro(){
    if(pomodoroInterval){ clearInterval(pomodoroInterval); pomodoroInterval=null; }
  }

  function resetPomodoro(){
    pausePomodoro();
    pomodoroRemaining = pomodoroTotal; updatePomodoroDisplay();
  }

  function stopPomodoro(){ pausePomodoro(); resetPomodoro(); if(dom.pomodoroPanel) dom.pomodoroPanel.classList.add('d-none'); }

  function escapeHtml(str){
    return str.replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function enterEditMode(li){
    li.classList.add('editing');
    const titleEl = li.querySelector('.task-title');
    const input = li.querySelector('.edit-field');
    input.value = titleEl.textContent.trim();
    input.focus();
    input.select();
    li.classList.add('anim-edit-highlight');
  }

  function exitEditMode(li, saveChanges){
    if(!li.classList.contains('editing')) return;
    const id = li.getAttribute('data-id');
    const input = li.querySelector('.edit-field');
    if(saveChanges){
      const newTitle = input.value.trim();
      if(newTitle){
        updateTask(id, {title:newTitle});
        li.querySelector('.task-title').textContent = newTitle;
      }
    }
    li.classList.remove('editing');
  }

  function setupDrag(){
    if (typeof Sortable === 'undefined') { log.warn('SortableJS não carregado. Reordenar indisponível.'); return; }
    try {
      new Sortable(dom.list, { animation: 150, handle: '[data-drag-handle]', ghostClass: 'dragging', onEnd: persistOrder });
      log.info('Reordenamento (SortableJS) inicializado');
    } catch(e){ log.error('Erro ao inicializar drag', e); }
  }

  function restoreTheme(){
    const saved = localStorage.getItem(THEME_KEY);
    if(saved){ document.documentElement.setAttribute('data-theme', saved); updateThemeButton(); }
  }

  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme')||'light';
    const next = current==='light'? 'dark':'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeButton();
  }

  function updateThemeButton(){
    const isDark = document.documentElement.getAttribute('data-theme')==='dark';
    const moon = dom.toggleTheme.querySelector('[data-icon-light]');
    const sun = dom.toggleTheme.querySelector('[data-icon-dark]');
    if(isDark){ moon.classList.add('d-none'); sun.classList.remove('d-none'); }
    else { sun.classList.add('d-none'); moon.classList.remove('d-none'); }
  }
  function bindEvents(){
    // Formulário
    dom.form.addEventListener('submit', e=>{
      e.preventDefault();
      const value = dom.input.value.trim();
      if(!value) return;
      addTask(value);
      dom.input.value='';
      dom.input.focus();
    });

    // Lista (delegação geral)
    dom.list.addEventListener('click', e=>{
      const li = e.target.closest('li');
      if(!li) return;
      if(e.target.closest('input.form-check-input')){ toggleComplete(li.getAttribute('data-id')); return; }
      const tagEl = e.target.closest('.task-tag');
      if(tagEl){ toggleTagFilter(tagEl.getAttribute('data-tag')); return; }
      const focusBtn = e.target.closest('button[data-action="focus"]');
      if(focusBtn){ enterFocus(li.getAttribute('data-id')); return; }
      const btn = e.target.closest('button[data-action]');
      if(btn){
        const action = btn.getAttribute('data-action');
        if(action==='delete') deleteTask(li.getAttribute('data-id'));
        else if(action==='edit') enterEditMode(li);
      }
    });

    dom.list.addEventListener('keydown', e=>{
      const li = e.target.closest('li'); if(!li) return;
      if(e.key==='Enter' && li.classList.contains('editing')) return exitEditMode(li, true);
      if(e.key==='Escape' && li.classList.contains('editing')) return exitEditMode(li, false);
      if(e.key==='Enter' && e.target.classList.contains('task-title')) return enterEditMode(li);
    });

    dom.list.addEventListener('focusout', e=>{
      const li = e.target.closest('li'); if(!li) return;
      if(li.classList.contains('editing')) setTimeout(()=>{ if(!li.contains(document.activeElement)) exitEditMode(li,true); },0);
    });

    // Filtros & ações gerais
    dom.clearCompleted.addEventListener('click', clearCompleted);
    dom.filterButtons.forEach(btn=> btn.addEventListener('click', ()=> setFilter(btn.getAttribute('data-filter'))));
    dom.toggleTheme.addEventListener('click', toggleTheme);

    // Busca
    dom.search?.addEventListener('input', ()=> setSearch(dom.search.value));
    dom.clearSearch?.addEventListener('click', ()=> { dom.search.value=''; setSearch(''); });

    // Export / Import
    dom.exportBtn?.addEventListener('click', exportTasks);
    dom.importBtn?.addEventListener('click', ()=> dom.importFile && dom.importFile.click());
    dom.importFile?.addEventListener('change', e=>{ const f=e.target.files?.[0]; if(f) importTasks(f); e.target.value=''; });

    // Foco / Pomodoro
    dom.focusModeBtn?.addEventListener('click', ()=>{
      if(focusTaskId) return exitFocus();
      const first = tasks.find(t=>!t.completed) || tasks[0];
      if(first) enterFocus(first.id);
    });
    dom.exitFocusBtn?.addEventListener('click', exitFocus);
    dom.pomodoroBtn?.addEventListener('click', ()=>{
      if(!focusTaskId){ const first=tasks.find(t=>!t.completed)||tasks[0]; if(first) enterFocus(first.id); }
      dom.pomodoroPanel.classList.toggle('d-none');
    });
    dom.pomodoroStart?.addEventListener('click', startPomodoro);
    dom.pomodoroPause?.addEventListener('click', pausePomodoro);
    dom.pomodoroReset?.addEventListener('click', resetPomodoro);
  }

  // Limpeza de classes de animação ao terminar
  document.addEventListener('animationend', e=>{
    const removable = ['anim-pulse-complete','anim-edit-highlight','anim-scale-in','anim-filter-fade'];
    if(removable.some(cls=> e.target.classList && e.target.classList.contains(cls))){
      e.target.classList.remove(...removable.filter(c=> e.target.classList.contains(c)));
    }
  }, true);

  function init(){
    try {
      dom.year.textContent = new Date().getFullYear();
      load();
      restoreTheme();
      render();
      setupDrag();
      bindEvents();
      updateActiveFiltersUI();
      updatePomodoroDisplay();
      log.info('Inicialização concluída. Tarefas carregadas:', tasks.length);
    } catch(e){
      log.error('Erro crítico na inicialização:', e);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();