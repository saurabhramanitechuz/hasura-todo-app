import { gql } from "@apollo/client";

export const GET_MY_TODOS = gql`
  query getMyTodos {
    todos(
      where: { is_public: { _eq: false } }
      order_by: { created_at: desc }
    ) {
      id
      title
      created_at
      is_completed
    }
  }
`;

export const ADD_TODO = gql`
  mutation ($todo: String!, $isPublic: Boolean!) {
    insert_todos(objects: { title: $todo, is_public: $isPublic }) {
      affected_rows
      returning {
        id
        title
        created_at
        is_completed
      }
    }
  }
`;

export const TOGGLE_TODO = gql`
  mutation toggleTodo($id: Int!, $isCompleted: Boolean!) {
    update_todos(
      where: { id: { _eq: $id } }
      _set: { is_completed: $isCompleted }
    ) {
      affected_rows
    }
  }
`;

export const REMOVE_TODO = gql`
  mutation removeTodo($id: Int!) {
    delete_todos(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const CLEAR_COMPLETED = gql`
  mutation clearCompleted {
    delete_todos(
      where: { is_completed: { _eq: true }, is_public: { _eq: false } }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_LASTSEEN_MUTATION = gql`
  mutation updateLastSeen($now: timestamptz!) {
    update_users(where: {}, _set: { last_seen: $now }) {
      affected_rows
    }
  }
`;

export const GET_ONLINE_USERS_SUBSCRIPTION = gql`
  subscription getOnlineUsers {
    online_users(order_by: { user: { name: asc } }) {
      id
      user {
        name
      }
    }
  }
`;

export const NOTIFY_NEW_PUBLIC_TODOS = gql`
  subscription notifyNewPublicTodos {
    todos(
      where: { is_public: { _eq: true } }
      limit: 1
      order_by: { created_at: desc }
    ) {
      id
      created_at
    }
  }
`;

export const GET_OLD_PUBLIC_TODOS = gql`
  query getOldPublicTodos($oldestTodoId: Int!) {
    todos(
      where: { is_public: { _eq: true }, id: { _lt: $oldestTodoId } }
      limit: 7
      order_by: { created_at: desc }
    ) {
      id
      title
      created_at
      user {
        name
      }
    }
  }
`;

export const GET_NEW_PUBLIC_TODOS = gql`
  query getNewPublicTodos($latestVisibleId: Int!) {
    todos(
      where: { is_public: { _eq: true }, id: { _gt: $latestVisibleId } }
      order_by: { created_at: desc }
    ) {
      id
      title
      created_at
      user {
        name
      }
    }
  }
`;
