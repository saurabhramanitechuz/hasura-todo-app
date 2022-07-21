import { useMutation } from "@apollo/client";
import React from "react";
import { GET_MY_TODOS, REMOVE_TODO, TOGGLE_TODO } from "../Constants/Graphql";

const TodoItem = ({ index, todo }) => {
  const [toggleTodoMutation] = useMutation(TOGGLE_TODO);
  const [removeTodoMutation] = useMutation(REMOVE_TODO);

  const removeTodo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeTodoMutation({
      variables: { id: todo.id },
      optimisticResponse: true,
      update: (cache) => {
        const existingTodos = cache.readQuery({ query: GET_MY_TODOS });
        const newTodos = existingTodos.todos.filter((t) => t.id !== todo.id);
        cache.writeQuery({ query: GET_MY_TODOS, data: { todos: newTodos } });
      },
    });
  };

  const toggleTodo = () => {
    toggleTodoMutation({
      variables: { id: todo.id, isCompleted: !todo.is_completed },
      optimisticResponse: {
        update_todos: {
          affected_rows: 1,
        },
      },
      update: (cache) => {
        const existingTodos = cache.readQuery({ query: GET_MY_TODOS });
        const newTodos = existingTodos.todos.map((t) => {
          if (t.id === todo.id) {
            return { ...t, is_completed: !t.is_completed };
          }
          return t;
        });
        cache.writeQuery({ query: GET_MY_TODOS, data: { todos: newTodos } });
      },
    });
  };

  return (
    <li>
      <div className="view">
        <div className="round">
          <input
            checked={todo.is_completed}
            type="checkbox"
            id={todo.id}
            onChange={toggleTodo}
          />
          <label htmlFor={todo.id} />
        </div>
      </div>

      <div className={"labelContent" + (todo.is_completed ? " completed" : "")}>
        <div>{todo.title}</div>
      </div>

      <button className="closeBtn" onClick={removeTodo}>
        x
      </button>
    </li>
  );
};

export default TodoItem;
