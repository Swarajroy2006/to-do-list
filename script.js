document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('input-field');
    const addTaskBtn = document.getElementById('add-button');
    const taskList = document.getElementById('tasks-list');
    const emptyImage = document.getElementById('empty-state-image');
    const progressBar = document.getElementById('progress-indicator');
    const progressNumbers = document.getElementById('task-stats');
    const motivationText = document.querySelector('.info h3');

    loadTasksFromLocalStorage();

    // Add task
    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        createTaskElement(taskText);
        taskInput.value = '';
        saveTasksToLocalStorage();
        taskInput.focus();
        scrollToTop();
    }

    // Create a new task element
    function createTaskElement(taskText, completed = false) {
        const li = document.createElement('li');
        if (completed) li.classList.add('completed');

        li.innerHTML = `
            <div class="task">
                <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
                <span class="task-text">${taskText}</span>
                <div class="task-actions">
                    <button class="edit-button" ${completed ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" fill="#EFEFEF">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 
                            0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 
                            3.75 3.75 1.84-1.83z"/>
                        </svg>
                    </button>
                    <button class="delete-button">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" fill="#EFEFEF">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 
                            2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 
                            1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        const checkbox = li.querySelector('.task-checkbox');
        const taskSpan = li.querySelector('.task-text');
        const editBtn = li.querySelector('.edit-button');
        const deleteBtn = li.querySelector('.delete-button');

        checkbox.addEventListener('change', function () {
            li.classList.toggle('completed', this.checked);
            saveTasksToLocalStorage();
            updateProgress();

            const allCompleted =
                taskList.querySelectorAll('li').length > 0 &&
                taskList.querySelectorAll('li').length === taskList.querySelectorAll('li.completed').length;

            if (allCompleted) {
                triggerConfetti();
            }
        });

        deleteBtn.addEventListener('click', function () {
            li.remove();
            saveTasksToLocalStorage();
            updateProgress();
            toggleEmptyState();
        });

        editBtn.addEventListener('click', function () {
            if (li.classList.contains('completed')) return;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskSpan.textContent;
            input.className = 'edit-input';

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') finishEdit();
            });

            input.addEventListener('blur', finishEdit);

            function finishEdit() {
                const newSpan = document.createElement('span');
                newSpan.className = 'task-text';
                newSpan.textContent = input.value.trim();
                input.replaceWith(newSpan);
                saveTasksToLocalStorage();

                // Rebind edit event
                newSpan.addEventListener('click', () => editBtn.click());
            }

            taskSpan.replaceWith(input);
            input.focus();
        });

        taskList.appendChild(li);
        toggleEmptyState();
        updateProgress();
    }

    // Update progress bar
    function updateProgress() {
        const tasks = taskList.querySelectorAll('li');
        const completed = taskList.querySelectorAll('li.completed');
        const percent = tasks.length ? (completed.length / tasks.length) * 100 : 0;

        progressBar.style.width = `${percent}%`;
        progressNumbers.textContent = `${completed.length}/${tasks.length}`;

        const hue = (percent / 100) * 120;
        progressBar.style.backgroundColor = `hsl(${hue}, 100%, 45%)`;

        updateMotivationMessage(percent);
    }

    // Show confetti when all tasks are completed
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff0000', '#00ff00', '#0000ff']
            });
        }
    }

    // Motivation messages based on % completed
    function updateMotivationMessage(percent) {
        const messages = [
            { threshold: 0, options: ["Let's begin!", "Time to conquer tasks!", "Start strong!"] },
            { threshold: 10, options: ["Nice start!", "You're on your way!", "Just warming up!"] },
            { threshold: 25, options: ["Quarter done!", "Great progress!", "Keep it up!"] },
            { threshold: 50, options: ["Halfway there!", "Crushing it!", "You’re doing great!"] },
            { threshold: 75, options: ["Almost done!", "Just a few more!", "Stay sharp!"] },
            { threshold: 90, options: ["So close!", "One final push!", "Finish line ahead!"] },
            { threshold: 100, options: ["You did it!", "All tasks complete!", "Celebrate the win 🎉"] }
        ];

        const applicable = messages.filter(m => percent >= m.threshold);
        if (applicable.length) {
            const lastGroup = applicable[applicable.length - 1];
            const randomMsg = lastGroup.options[Math.floor(Math.random() * lastGroup.options.length)];
            motivationText.textContent = randomMsg;
        }
    }

    // Save tasks to localStorage
    function saveTasksToLocalStorage() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.querySelector('.task-text').textContent,
                completed: li.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load from localStorage
    function loadTasksFromLocalStorage() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskList.innerHTML = '';
        savedTasks.forEach(task => createTaskElement(task.text, task.completed));
        updateProgress();
    }

    // Show/hide empty image
    function toggleEmptyState() {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
    }

    // Scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Events
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addTask(e);
    });
});


// localStorage.clear(); // only for development, remove later
