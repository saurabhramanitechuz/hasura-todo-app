import React, { useState, Fragment } from "react";
import { useMutation, useQuery } from "@apollo/client";

import TodoItem from "./TodoItem";
import TodoFilters from "./TodoFilters";
import { CLEAR_COMPLETED, GET_MY_TODOS } from "../Constants/Graphql";

const TodoPrivateList = (props) => {
  const { todos } = props;
  const [state, setState] = useState({
    filter: "all",
    clearInProgress: false,
  });

  const [clearCompletedTodods] = useMutation(CLEAR_COMPLETED);

  const filterResults = (filter) => {
    setState({
      ...state,
      filter: filter,
    });
  };

  const clearCompleted = () => {
    clearCompletedTodods({
      optimisticResponse: {
        delete_todos: {
          affected_rows: 0,
        },
      },
      update: (cache) => {
        const existingTodos = cache.readQuery({ query: GET_MY_TODOS });
        const newTodos = existingTodos.todos.filter((t) => !t.is_completed);
        cache.writeQuery({ query: GET_MY_TODOS, data: { todos: newTodos } });
      },
    });
  };

  let filteredTodos = todos;
  if (state.filter === "active") {
    filteredTodos = todos.filter((todo) => todo.is_completed !== true);
  } else if (state.filter === "completed") {
    filteredTodos = todos.filter((todo) => todo.is_completed === true);
  }

  const todoList = [];
  filteredTodos.forEach((todo, index) => {
    todoList.push(<TodoItem key={index} index={index} todo={todo} />);
  });

  return (
    <Fragment>
      <div className="todoListWrapper">
        <ul>{todoList}</ul>
      </div>

      <TodoFilters
        todos={filteredTodos}
        currentFilter={state.filter}
        filterResultsFn={filterResults}
        clearCompletedFn={clearCompleted}
        clearInProgress={state.clearInProgress}
      />
    </Fragment>
  );
};

const TodoPrivateListQuery = () => {
  const { loading, error, data } = useQuery(GET_MY_TODOS);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }
  return <TodoPrivateList todos={data.todos} />;
};

export default TodoPrivateListQuery;
