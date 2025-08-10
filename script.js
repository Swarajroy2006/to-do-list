document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('input-field');
    const addTaskBtn = document.getElementById('add-button');
    const taskList = document.getElementById('tasks-list');
    const emptyImage = document.querySelector('.empty-state-image');
    const progressBar = document.getElementById('progress-indicator');
    const progressNumbers = document.getElementById('task-stats');
    // Toggle empty image
    const toggleEmptyState = () => {
        const isEmpty = taskList.children.length === 0;
        emptyImage.style.display = isEmpty ? 'block' : 'none';
    };
    // Update progress bar
    const updateProgress = () => {
        const totalTask = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.task-checkbox:checked').length;
        const percent = totalTask ? (completedTasks / totalTask) * 100 : 0;

        progressBar.style.width = `${percent}%`;
        progressNumbers.textContent = `${completedTasks}/${totalTask}`;

        if (totalTask > 0 && completedTasks === totalTask) {
            const count = 200,
                defaults = {
                    origin: { y: 0.7 },
                };
            function fire(particleRatio, opts) {
                confetti(
                    Object.assign({}, defaults, opts, {
                        particleCount: Math.floor(count * particleRatio),
                    })
                );
            }

            fire(0.25, {
                spread: 26,
                startVelocity: 55,
            });

            fire(0.2, {
                spread: 60,
            });

            fire(0.35, {
                spread: 100,
                decay: 0.91,
                scalar: 0.8,
            });

            fire(0.1, {
                spread: 120,
                startVelocity: 25,
                decay: 0.92,
                scalar: 1.2,
            });

            fire(0.1, {
                spread: 120,
                startVelocity: 45,
            });
        }
    };

    // Save to localStorage
    const saveTasksToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('.task-text')?.textContent || '',
            completed: li.querySelector('.task-checkbox')?.checked || false
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Load from localStorage
    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({ text, completed }) => {
            createTaskElement(text, completed);
        });
        toggleEmptyState();
        updateProgress();
    };

    // Create a task item
    const createTaskElement = (taskText, completed = false) => {
        const li = document.createElement('li');

        li.innerHTML = `
            <div class="task">
                <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
                <span class="task-text">${taskText}</span>
                <div class="task-actions">
                    <button class="edit-button"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="M160-400v-80h280v80H160Zm0-160v-80h440v80H160Zm0-160v-80h440v80H160Zm360 560v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T863-380L643-160H520Zm300-263-37-37 37 37ZM580-220h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z"/></svg></button>
                    <button class="delete-button"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                </div>
            </div>
        `;

        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit-button');
        const deleteBtn = li.querySelector('.delete-button');
        const taskSpan = li.querySelector('.task-text');

        // Checkbox change
        checkbox.addEventListener('change', () => {
            li.classList.toggle('completed', checkbox.checked);
            editBtn.disabled = checkbox.checked;
            editBtn.style.opacity = checkbox.checked ? '0.5' : '1';
            editBtn.style.pointerEvents = checkbox.checked ? 'none' : "auto";
            saveTasksToLocalStorage();
            updateProgress();
        });

        // Edit button
        editBtn.addEventListener('click', () => {
            if (checkbox.checked) return;

            if (editBtn.textContent === 'Save') {
                const input = li.querySelector('.edit-input');
                const newText = input.value.trim();

                if (newText) {
                    const newSpan = document.createElement('span');
                    newSpan.className = 'task-text';
                    newSpan.textContent = newText;
                    input.replaceWith(newSpan);
                    editBtn.textContent = 'Edit';
                    li.classList.remove('editing');
                    checkbox.style.display = 'inline-block';  // Show checkbox again after edit
                    saveTasksToLocalStorage();
                    updateProgress();
                } else {
                    alert("Task can't be empty!");
                    input.focus();
                }

                return;
            }

            // Begin editing
            const currentText = taskSpan.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.className = 'edit-input';
            checkbox.style.display = 'none';  // Hide checkbox during edit
            taskSpan.replaceWith(input);
            input.focus();
            li.classList.add('editing');
            editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>';

            const saveEdit = () => {
                const newText = input.value.trim();
                if (newText) {
                    const newSpan = document.createElement('span');
                    newSpan.className = 'task-text';
                    newSpan.textContent = newText;
                    input.replaceWith(newSpan);
                    editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="M160-400v-80h280v80H160Zm0-160v-80h440v80H160Zm0-160v-80h440v80H160Zm360 560v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T863-380L643-160H520Zm300-263-37-37 37 37ZM580-220h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z"/></svg>';
                    li.classList.remove('editing');
                    checkbox.style.display = 'inline-block';  // Show checkbox again after edit
                    saveTasksToLocalStorage();
                    updateProgress();
                } else {
                    alert("Task can't be empty!");
                    input.focus();
                }
            };

            // Fix for blur/click conflict
            input.addEventListener('blur', () => {
                setTimeout(saveEdit, 100);
            });
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveEdit();
            });
        });

        // Delete button
        deleteBtn.addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
            saveTasksToLocalStorage();
            updateProgress();
        });

        taskList.appendChild(li);
        updateProgress();
        toggleEmptyState();
    };

    // Add new task
    const addTask = (event) => {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        createTaskElement(taskText);
        taskInput.value = '';
        saveTasksToLocalStorage();
    };

    // Add button click
    addTaskBtn.addEventListener('click', addTask);

    // Enter key press
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask(e);
        }
    });

    toggleEmptyState();
    loadTasksFromLocalStorage();
});
