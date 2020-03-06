const inquirer = require('inquirer');

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "employeeTracker_db"
});

const init = () => {
    connection.connect((err) => {
        if (err) console.log(err)
        chooseAction()
    })
}

const chooseAction = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "type",
            message: "What do you want to do?",
            choices: ["Add department", "Add role", "Add employee", "View department", "View role", "View employee", "Update employee role", "Quit"]
        }
    ]).then((answers) => {
        switch (answers.type) {
            case "Add department":
                addDepartment()
                break;
            case "Add role":
                addRole()
                break;
            case "Add employee":
                addEmployee()
                break;
            case "View department":
                viewDepartment()
                break;
            case "View role":
                viewRole()
                break;
            case "View employee":
                viewEmployee()
                break;
            case "Update employee role":
                updateEmployeeRole()
                break;
            default:
                quit()
        }
    })
}

const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the department name?"
        }
    ]).then((answers) => {
        connection.query(
            "INSERT INTO departments (name) VALUES (?)",
            [
                answers.name
            ],
            (err, res) => {
                if (err) console.log(err);
                chooseAction();
            }
        )
    })
};

const addRole = () => {
    connection.query("SELECT * FROM departments", function (err, results) {
        inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "What is the title you want to add?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary you want to add?"
            },
            {
                type: "rawlist",
                name: "department_id",
                message: "What is the department_id?",
                choices: function () {
                    var deptsArray = [];
                    for (var i = 0; i < results.length; i++) {
                        var dept = {
                            name: results[i].name,
                            value: results[i].id
                        }
                        deptsArray.push(dept);
                    }
                    return deptsArray;
                }
            }
        ]).then((answers) => {
            // const newRole = new role(answers.title, answers.salary, answers.department_id)
            connection.query(
                "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)",
                [
                    answers.title,
                    answers.salary,
                    answers.department_id
                ],
                (err, res) => {
                    if (err) console.log(err);
                    chooseAction();
                }
            )
        })
    })
};

const addEmployee = () => {
    connection.query("SELECT * FROM roles", function (err, roleResults) {
        connection.query("SELECT * FROM employees", function (err, employeeResults) {

            const listEmp = employeeResults.map(employees => {
                return { name: `${employees.first_name} ${employees.last_name}`, value: employees.id }
            })

            listEmp.push({ name: "None", value: null })

            inquirer.prompt([
                {
                    type: "input",
                    name: "first_name",
                    message: "What is the first name of the new employee?"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is the last name of the new employee?"
                },
                {
                    type: "rawlist",
                    name: "role_id",
                    message: "What is their role?",
                    choices: function () {
                        var rolesArray = [];
                        for (var i = 0; i < roleResults.length; i++) {
                            var role = {
                                name: roleResults[i].title,
                                value: roleResults[i].id
                            }
                            rolesArray.push(role);
                        }
                        return rolesArray;
                    }
                },
                {
                    type: "list",
                    name: "manager_id",
                    message: "Who is the manager?",
                    choices: listEmp
                }
            ]).then((answers) => {
                connection.query(
                    "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                    [
                        answers.first_name,
                        answers.last_name,
                        answers.role_id,
                        answers.manager_id
                    ],
                    (err, res) => {
                        if (err) console.log(err);
                        chooseAction();
                    }
                )
            })
        })
    })
};
    const updateEmployeeRole = () => {
        connection.query("SELECT * FROM employees", function (err, results) {
            const employeeArr = results.map(({ id, last_name, first_name }) => {
                return { name: `${last_name}, ${first_name}`, value: id }
            })
            connection.query("SELECT * FROM roles", function (err, res) {
                const rolesArr = res.map(({ id, title }) => ({ value: id, name: title }))
                inquirer.prompt([
                    {
                        type: "list",
                        name: "id",
                        message: "What is the employees name that you would like to update?",
                        choices: employeeArr
                    },
                    {
                        type: "list",
                        name: "roleId",
                        message: "What is the new role?",
                        choices: rolesArr
                    }
                ]).then((answers) => {
                    connection.query(
                        "UPDATE employees SET role_id = ? WHERE id = ?",
                        [
                            answers.roleId,
                            answers.id,
                        ],
                        (err, res) => {
                            if (err) console.log(err);
                            chooseAction();
                        }
                    )
                })
            })
        })
    };

    const viewDepartment = () => {
        connection.query("SELECT * FROM departments", (err, res) => {
            if (err) console.log(err);
            console.table(res);
            chooseAction();
        })
    }

    const viewRole = () => {
        connection.query("SELECT * FROM roles INNER JOIN departments ON roles.department_id = departments.id", (err, res) => {
            if (err) console.log(err);
            console.table(res);
            chooseAction();
        })
    }

    const viewEmployee = () => {
        connection.query("SELECT * FROM roles INNER JOIN departments ON roles.department_id = departments.id INNER JOIN employees ON roles.id", (err, res) => {
            if (err) console.log(err);
            console.table(res);
            chooseAction();
        })
    }


    const quit = () => {
        connection.end()
        console.log("You have finished.")
    };
    // Build a command-line application that at a minimum allows the user to:

    //   * Update employee roles

    // Bonus points if you're able to:

    //   * Update employee managers

    //   * View employees by manager

    //   * Delete departments, roles, and employees

    //   * View the total utilized budget of a department -- ie the combined salaries of all employees in that department
    init();