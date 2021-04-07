const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
      return response.status(400).json({error:"User not found."}) 
  }
  
  request.user = user

  return next();
}

app.post('/users', (request, response) => {
  
    const {name,username} = request.body;

    const user = users.find(user => user.username === username);
    if(user){
        return response.status(400).json({error:"User already exists, Try again."}) 
    }
    const newUser = {
      name,
      username,
      id:uuidv4(),
      todos:[]
    }
    users.push(newUser)

    return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {user} = request;
    return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
    const {title,deadline} = request.body
    const endDate = new Date(deadline);
    const beginDate = new Date();

    const {user} = request;

    const newTodo = {
      id:uuidv4(),
      title,
      done:false,
      deadline:endDate,
      created_at:beginDate
    }

    user.todos.push(newTodo);


    return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    
    const {title,deadline} = request.body
    const endDate = new Date(deadline);
    
    const {id} = request.params
    const {user} = request

    const todo = user.todos.find(todo => todo.id == id);
    if(!todo){
      return response.status(404).json({error:"todo not found"})
    }

    todo.title = title;
    todo.deadline = endDate

    return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const {id} = request.params
    const {user} = request;
    const todo = user.todos.find(todo => todo.id == id);

    if(!todo){
      return response.status(404).json({error:"todo not found"})
    }

    todo.done = true;
    return response.json(todo); 
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const {user} = request;
    const {id} = request.params
    const todo = user.todos.findIndex(todo => todo.id === id);

    if(todo === -1){
      return response.status(404).json({error:"todo not found"});
    }else
      user.todos.splice(todo,1);

    return response.status(204).json();
});

module.exports = app;