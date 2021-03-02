const createNewTodo = document.querySelector('.newTodo'),
    formRegister = document.querySelector('.register-form'),
    login = document.querySelector('.form__login'),
    password = document.querySelector('.form__password'),
    registerButton = document.querySelector('.form__register-button'),
    formNewTask = document.querySelector('.newTask-form'),
    addTask = document.querySelector('.form__addTask'),
    num0 = 0,
    num1 = 1,
    num2 = 2,
    num3 = 3;

class ToDo {

    #urlApi = 'https://todo.hillel.it';
    #token = '';

    constructor(loginUser, passwordUser) {
        this.loginUser = loginUser;
        this.password = passwordUser;
    }

    async auth() {
        if (this.loginUser && this.password) {
            formRegister.style.display = '';
            formNewTask.style.display = 'block';
            login.value = '';
            password.value = '';

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

        }
        else if (!formRegister.children[num2]) {
            const warning = document.createElement('p');
            warning.className = 'warning';
            warning.innerText = 'Fill the form';
            formRegister.appendChild(warning);
        }
    }

    async addTask(value) {

        if (value) {
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
                        if (formNewTask.children[num2]) {
                            formNewTask.children[num2].remove();
                        }
                        const warning = document.createElement('p');
                        warning.className = 'warning';
                        warning.innerText = 'This note already exists';
                        formNewTask.appendChild(warning);
                        addTask.value = '';
                    } else {
                        addTask.value = '';
                        if (formNewTask.children[num2]) {
                            formNewTask.children[num2].remove();
                        }
                        this.getTask();
                    }
                });
        } else if (!formNewTask.children[num2]){
            const warning = document.createElement('p');
            warning.className = 'warning';
            warning.innerText = 'Write a task';
            formNewTask.appendChild(warning);
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

    renderTasks = async(result) => {
        if (document.body.children[num3].className === 'containerTasks') {
            document.body.children[num3].remove();
        }
        const containerTasks = await document.createElement('ul');
        containerTasks.className = 'containerTasks';

        const sortResult = await result.map(el => el._id).sort();
        sortResult.map(el => {
            const sortListTasks = result.find(el2 => el2._id === el);
            let status = '',
                perfomed = '';
            if (sortListTasks.checked) {
                status = 'Perfomed';
                perfomed = 'perfomed';
            } else {
                status = 'Not perfomed';
            }
            containerTasks.insertAdjacentHTML('afterbegin',
                `<li class="task">
                    <button class="task__complite">${status}</button>
                    <span id='${sortListTasks._id}' 
                        class="task__value ${perfomed}">${sortListTasks.value}</span>
                    <button class="task__edit">Edit</button>
                    <button class="task__delete">Delete</button>
                </li>`);
        });
        await formNewTask.after(containerTasks);
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
}

createNewTodo.addEventListener('click', () => {
    formRegister.style.display === '' ?
        formRegister.style.display = 'block' :
        formRegister.style.display = '';

    registerButton.addEventListener('click', () => {
        const newTodo = new ToDo(login.value, password.value);
        newTodo.auth();

        document.body.addEventListener('click', (e) => {
            if (e.target.closest('.form__addTask-button')) {
                newTodo.addTask(addTask.value);
            } else if (e.target.closest('.task__delete')) {
                const idTask = e.target.parentElement.children[num1].id;
                newTodo.deleteTask(+idTask);
            } else if (e.target.closest('.task__edit')) {
                e.target.classList.add('task__edit--activ');

                const taskValue = e.target.parentElement.children[num1];
                const editInput = document.createElement('input');
                editInput.className = 'edit-input';
                editInput.value = taskValue.textContent;
                taskValue.parentElement.children[num0].after(editInput);

                const taskEditButton =
                    document.querySelector('.task__edit--activ');
                taskValue.remove();
                taskEditButton.addEventListener('click', () => {
                    newTodo.updateTask(editInput.value, taskValue.id);
                });
            } else if (e.target.closest('.task__complite')) {
                newTodo.compliteTask(e.target.parentElement.children[num1].id);
            }
        });
    });
});