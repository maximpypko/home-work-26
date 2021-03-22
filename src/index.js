class ToDo {
    #urlApi = 'https://todo.hillel.it';
    #token = '';
    login = '';
    password = '';
    $formRegister = document.querySelector('.register-form');
    $addTask = document.querySelector('.form__addTask');
    containerInputs = document.querySelector('.containerInputs');
    formNewTask = document.querySelector('.newTask-form');

    constructor() {
        this.createNewTodo();
        this.checksETarget();
        this.getPersonalData();
    }

    createNewTodo = () => {
        const createNewTodo = document.querySelector('.newTodo');

        createNewTodo.addEventListener('click', () => {
            this.$formRegister.style.display === '' ?
                this.$formRegister.style.display = 'block' :
                this.$formRegister.style.display = '';
            createNewTodo.style.display = 'none';
        });
    }

    getPersonalData = () => {
        const registerButton = document.querySelector('.form__register-button');

        registerButton.addEventListener('click', () => {
            const $login = document.querySelector('.form__login');
            const $password = document.querySelector('.form__password');
            this.login = $login.value;
            this.password = $password;
            this.auth($login, $password);
        });
    }

    async auth($login, $password) {

        if ($login.value && $password.value) {
            this.$formRegister.style.display = '';
            this.formNewTask.style.display = 'block';
            $login.value = '';
            $password.value = '';

            const response = await fetch(`${this.#urlApi}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    value: this.loginUser + this.password,
                })
            });
            // eslint-disable-next-line camelcase
            const { access_token } = await response.json();
            // eslint-disable-next-line camelcase
            this.#token = access_token;
            this.getTask();
        } else if (!this.containerInputs.nextElementSibling) {
            this.containerInputs.insertAdjacentHTML('afterend',
                '<p class ="warning">Fill the form</p>');
        }
    }

    async getTask() {
        const data = await fetch(`${this.#urlApi}/todo`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.#token}`,
                'Content-Type': 'application/json',
            },
        });
        this.renderTasks(await data.json());
    }

    addTask = async(value) => {

        await fetch(`${this.#urlApi}/todo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.#token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: value,
                priority: 1,
            })
        })
            .then(data => {
                const responseStatus = 500;
                if (data.status === responseStatus) {
                    if (this.containerInputs.nextElementSibling) {
                        this.containerInputs.nextElementSibling.remove();
                    }
                    this.renderWarningMessage('This note already exists');
                    this.$addTask.value = '';
                } else {
                    this.$addTask.value = '';
                    if (this.containerInputs.nextElementSibling) {
                        this.containerInputs.nextElementSibling.remove();
                    }
                    this.getTask();
                }
            });
    }

    async deleteTask(id) {
        await fetch(`${this.#urlApi}/todo/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.#token}`,
                'Content-Type': 'application/json',
            },
        });
        this.getTask();
    }

    async updateTask(value, id) {
        await fetch(`${this.#urlApi}/todo/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.#token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: value,
                priority: 1,
            })
        });
        this.getTask();
    }

    async compliteTask(id) {
        await fetch(`${this.#urlApi}/todo/${id}/toggle`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.#token}`,
                'Content-Type': 'application/json',
            }
        });
        this.getTask();
    }

    checksETarget = () => {
        document.body.addEventListener('click', (e) => {

            if (e.target.closest('.form__addTask-button')) {
                const $newTaskContainer = document.querySelector('#newTaskContainer');

                if (!this.$addTask.value) {
                    if (!$newTaskContainer.nextElementSibling) {
                        this.renderWarningMessage('Add task text');
                    }
                } else {
                    this.addTask(this.$addTask.value);
                    if ($newTaskContainer.nextElementSibling) {
                        $newTaskContainer.nextElementSibling.remove();
                    }
                }
            } else if (e.target.closest('.task__delete')) {
                const idTask = e.target.previousElementSibling.previousElementSibling.id;
                this.deleteTask(+idTask);
            } else if (e.target.closest('.task__edit')) {
                e.target.classList.add('task__edit--activ');

                const taskValue = e.target.previousElementSibling;

                const editInput = document.createElement('input');
                editInput.className = 'edit-input';
                editInput.value = taskValue.textContent;
                taskValue.previousElementSibling.after(editInput);

                const taskEditButton =
                            document.querySelector('.task__edit--activ');
                taskValue.remove();
                taskEditButton.addEventListener('click', () => {
                    this.updateTask(editInput.value, taskValue.id);
                });
            } else if (e.target.closest('.task__complite')) {
                this.compliteTask(e.target.nextElementSibling.id);
            }
        });
    }

    renderWarningMessage = (message) => {
        this.formNewTask.insertAdjacentHTML('beforeend',
            `<p id = "warning" class = "warning">${message}</p>`);
    }

    renderTasks = async (result) => {
        if(this.formNewTask.nextElementSibling.className === 'containerTasks'){
            this.formNewTask.nextElementSibling.remove();
        }
        const containerTasks = document.createElement('ul');
        containerTasks.className = 'containerTasks';

        const sortResult = await result.map(el => el._id).sort();
        sortResult.map(el => {
            const sortListTasks = result.find(el2 => el2._id === el);
            let status = '',
                perfomed = '',
                stateButtonEdit = '';
            if (sortListTasks.checked) {
                status = 'Perfomed';
                perfomed = 'perfomed';
                stateButtonEdit = 'disabled';
            } else {
                status = 'Not perfomed';
            }
            containerTasks.insertAdjacentHTML('afterbegin',
                `<li class="task">
                    <button class="task__complite">${status}</button>
                    <span id='${sortListTasks._id}' 
                        class="task__value ${perfomed}">${sortListTasks.value}</span>
                    <button class="task__edit" ${stateButtonEdit}>Edit</button>
                    <button class="task__delete">Delete</button>
                </li>`);
        });
        this.formNewTask.after(containerTasks);
    }
}
new ToDo();