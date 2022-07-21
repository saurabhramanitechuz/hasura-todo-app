import React, { Fragment, useEffect, useState } from "react";
import { useApolloClient, useSubscription } from "@apollo/client";

import {
  GET_NEW_PUBLIC_TODOS,
  GET_OLD_PUBLIC_TODOS,
  NOTIFY_NEW_PUBLIC_TODOS,
} from "../Constants/Graphql";

import TaskItem from "./TaskItem";

const TodoPublicList = (props) => {
  const [state, setState] = useState({
    olderTodosAvailable: props.latestTodo ? true : false,
    newTodosCount: 0,
    todos: [],
    error: false,
  });

  let numTodos = state.todos.length;
  let oldestTodoId = numTodos
    ? state.todos[numTodos - 1].id
    : props.latestTodo
    ? props.latestTodo.id + 1
    : 0;
  let newestTodoId = numTodos
    ? state.todos[0].id
    : props.latestTodo
    ? props.latestTodo.id
    : 0;
  const client = useApolloClient();

  const loadNew = async () => {
    const { error, data } = await client.query({
      query: GET_NEW_PUBLIC_TODOS,
      variables: {
        latestVisibleId: state.todos.length ? state.todos[0].id : 0,
      },
    });

    if (data.todos.length) {
      setState((prevState) => ({
        ...prevState,
        todos: [...data.todos, ...prevState.todos],
        newTodosCount: 0
      }));
      newestTodoId = data.todos[0].id;
    }

    if (error) {
      console.log(error);
      setState((prevState) => ({ ...prevState, error: true }));
    }
  };

  const loadOlder = async () => {
    const { error, data } = await client.query({
      query: GET_OLD_PUBLIC_TODOS,
      variables: { oldestTodoId },
    });

    if (data.todos.length) {
      setState((prevState) => ({
        ...prevState,
        todos: [...prevState.todos, ...data.todos],
      }));
      oldestTodoId = data.todos[data.todos.length - 1].id;
    } else {
      setState((prevState) => ({ ...prevState, olderTodosAvailable: false }));
    }

    if (error) {
      console.log(error);
      setState((prevState) => ({ ...prevState, error: true }));
    }
  };

  useEffect(() => {
    loadOlder();
  }, []);

  useEffect(() => {
    if (props?.latestTodo?.id > newestTodoId) {
      setState((prevState) => ({
        ...prevState,
        newTodosCount: prevState.newTodosCount + 1,
      }));
      newestTodoId = props.latestTodo.id;
    }
  }, [props.latestTodo]);

  let todos = state.todos;

  const todoList = (
    <ul>
      {todos.map((todo, index) => {
        return <TaskItem key={index} index={index} todo={todo} />;
      })}
    </ul>
  );

  let newTodosNotification = "";
  if (state.newTodosCount) {
    newTodosNotification = (
      <div className={"loadMoreSection"} onClick={loadNew}>
        New tasks have arrived! ({state.newTodosCount.toString()})
      </div>
    );
  }

  const olderTodosMsg = (
    <div className={"loadMoreSection"} onClick={loadOlder}>
      {state.olderTodosAvailable ? "Load older tasks" : "No more public tasks!"}
    </div>
  );

  return (
    <Fragment>
      <div className="todoListWrapper">
        {newTodosNotification}

        {todoList}

        {olderTodosMsg}
      </div>
    </Fragment>
  );
};

const TodoPublicListSubsciption = () => {
  const { loading, error, data } = useSubscription(NOTIFY_NEW_PUBLIC_TODOS);

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span>{error.message}</span>;
  }

  return (
    <TodoPublicList latestTodo={data.todos.length ? data.todos[0] : null} />
  );
};

export default TodoPublicListSubsciption;
