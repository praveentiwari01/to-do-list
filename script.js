// solar-tasks.js
class SolarTasks {
    constructor() {
        this.todos = [];
        this.state = { mode: 'all', editing: null };
        this.cacheDom();
        this.attachEvents();
        this.loadTodos();
        this.render();
    }
    cacheDom() {
        this.txtInput = document.getElementById('newTaskText');
        this.btnAdd = document.getElementById('addAction');
        this.listItems = document.getElementById('todo-items');
        this.note = document.getElementById('mainNote');
        this.filterButtons = document.querySelectorAll('.filter-action');
        this.btnClearDone = document.getElementById('batchRemoveDone');
        this.editModal = document.getElementById('edit-modal');
        this.modalInput = document.getElementById('modal-edit-input');
        this.btnSaveEdit = document.getElementById('saveEditModal');
        this.btnCancelEdit = document.getElementById('cancelEditModal');
    }
    attachEvents() {
        this.txtInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') this.addTask();
        });
        this.btnAdd.addEventListener('click', () => this.addTask());
        this.filterButtons.forEach(btn => btn.addEventListener('click', e => this.setFilter(e.target.dataset.mode)));
        this.btnClearDone.addEventListener('click', () => this.clearCompleted());
        this.listItems.addEventListener('click', e => this.handleListClick(e));
        this.btnSaveEdit.addEventListener('click', () => this.commitEdit());
        this.btnCancelEdit.addEventListener('click', () => this.hideEdit());
        this.modalInput.addEventListener('keyup', e => { if (e.key === 'Enter') this.commitEdit(); });
    }
    newId() { return (Date.now().toString(32) + Math.random().toString(32).slice(2)); }
    saveTodos() { localStorage.setItem('solartasks_todos', JSON.stringify(this.todos)); }
    loadTodos() {
        try {
            const raw = localStorage.getItem('solartasks_todos');
            this.todos = raw ? JSON.parse(raw) : [];
        } catch { this.todos = []; }
    }
    addTask() {
        let t = this.txtInput.value.trim();
        if (!t) return this.notify("Empty to-do not allowed.", 'warn');
        this.todos.unshift({ id: this.newId(), desc: t, done: false });
        this.txtInput.value = '';
        this.saveTodos();
        this.render();
        this.notify("Added!", 'success');
    }
    setFilter(mode) {
        this.state.mode = mode;
        this.filterButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        this.render();
    }
    handleListClick(e) {
        let row = e.target.closest('.todo-row');
        if (!row) return;
        let id = row.dataset.id;
        if (e.target.classList.contains('checkbox')) {
            this.toggleDone(id);
        } else if (e.target.classList.contains('btn-edit')) {
            this.showEdit(id);
        } else if (e.target.classList.contains('btn-del')) {
            this.removeTask(id);
        }
    }
    toggleDone(id) {
        let t = this.todos.find(t => t.id === id);
        if (t) { t.done = !t.done; this.saveTodos(); this.render(); }
    }
    showEdit(id) {
        let t = this.todos.find(t => t.id === id);
        if (!t) return;
        this.state.editing = id;
        this.modalInput.value = t.desc;
        this.editModal.style.display = 'flex';
        setTimeout(() => this.modalInput.focus(), 120);
    }
    commitEdit() {
        let t = this.todos.find(t => t.id === this.state.editing);
        if (!t) return;
        let val = this.modalInput.value.trim();
        if (!val) return this.notify("Task cannot be blank.", 'danger');
        t.desc = val;
        this.saveTodos();
        this.hideEdit();
        this.render();
        this.notify('Task changed.', 'success');
    }
    hideEdit() {
        this.editModal.style.display = 'none';
        this.state.editing = null;
    }
    removeTask(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
        this.notify('Task removed.', 'success');
    }
    clearCompleted() {
        let count = this.todos.filter(t => t.done).length;
        if (count === 0) return this.notify("No done items!", 'warn');
        this.todos = this.todos.filter(t => !t.done);
        this.saveTodos();
        this.render();
        this.notify("Completed tasks cleared.", 'success');
    }
    filterTodos() {
        switch (this.state.mode) {
            case 'done': return this.todos.filter(t => t.done);
            case 'open': return this.todos.filter(t => !t.done);
            default: return this.todos;
        }
    }
    render() {
        let taskArr = this.filterTodos();
        this.listItems.innerHTML = '';
        if (taskArr.length === 0) {
            this.listItems.innerHTML = `<li class="todo-row" style="justify-content:center;color:var(--text-secondary);">Nothing here.</li>`;
            return;
        }
        taskArr.forEach(task => {
            let li = document.createElement('li');
            li.className = 'todo-row' + (task.done ? ' done' : '');
            li.dataset.id = task.id;
            li.innerHTML = `
                <input type="checkbox" class="checkbox" ${task.done ? 'checked' : ''}>
                <span class="task-desc">${this.escapeHTML(task.desc)}</span>
                <button class="btn-edit">Edit</button>
                <button class="btn-del">Del</button>
            `;
            this.listItems.appendChild(li);
        });
    }
    notify(msg, type) {
        this.note.classList.remove('success','danger','warn');
        if (type === 'success') this.note.style.background = 'var(--success)';
        else if (type === 'danger') this.note.style.background = 'var(--danger)';
        else if (type === 'warn') this.note.style.background = 'var(--warn)';
        else this.note.style.background = 'var(--accent)';
        this.note.textContent = msg;
        this.note.style.display = "block";
        setTimeout(() => { this.note.style.display = "none"; }, 2200);
    }
    escapeHTML(txt) {
        return txt.replace(/[<>&"]/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'
        }[c]));
    }
}
window.addEventListener('DOMContentLoaded', () => new SolarTasks());
