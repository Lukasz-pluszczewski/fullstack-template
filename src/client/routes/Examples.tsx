import dayjs from 'dayjs';
import { useState } from 'react';
import { Box, Button, Checkbox, Group, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import Layout from '../platform/layout/Layout';
import { createPersistCollection, createPersistKeyValue } from 'fullstack-simple-persist/react';


export default function Examples() {
  return <Layout>Examples</Layout>;
}

const { PersistKeyValue, useKeyValue } = createPersistKeyValue('/api/keyvalue');
const { PersistCollection, useCollection } = createPersistCollection('/api/collection');
export function PersistenceChild() {
  const [username, setUsername] = useKeyValue('username');
  const [kvAll, { setAll: setKvAll, setMany, setKey, deleteKey }] = useKeyValue();
  const [todos, { setItems, setItem, updateItem, deleteItem, addItem }] = useCollection();

  return (
    <>
      <TextInput value={username ?? ''} onChange={(e) => setUsername(e.target.value)} placeholder="username" />

      <pre>All KV: {JSON.stringify(kvAll, null, 2)}</pre>

      <button onClick={() => addItem({ text: 'New', done: false })}>Add Todo</button>
      {todos ? (
        todos.map((todo, index) => (
          <Group key={todo.id}>
            <TextInput value={todo.text} onChange={(event) => updateItem(todo.id, { text: event.currentTarget.value })} />
            <Checkbox
              checked={todo.done}
              onChange={(event) => updateItem(todo.id, { done: event.currentTarget.checked })}
            />
            <Button onClick={() => deleteItem(todo.id)}>Delete</Button>
          </Group>
        ))
      ) : null}

      <pre>Todos: {JSON.stringify(todos, null, 2)}</pre>
    </>
  );
}
export function Persistence() {
  return <Layout>
    <PersistKeyValue>
      <PersistCollection>
        <PersistenceChild />
      </PersistCollection>
    </PersistKeyValue>
  </Layout>;
}

export function Form() {
  return <Layout>Form</Layout>;
}

export function Table() {
  return <Layout>Table</Layout>;
}

export function Dropzone() {
  return <Layout>Dropzone</Layout>;
}

export function Dates() {
  const [value, setValue] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  return (
    <Layout>
      <DatePickerInput
        type="range"
        label="Pick dates range"
        placeholder="Pick dates range"
        value={value}
        onChange={setValue}
        presets={[
          {
            value: [
              dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD'),
              dayjs().endOf('day').format('YYYY-MM-DD'),
            ],
            label: 'Yesterday - today',
          },
          {
            value: [
              dayjs().startOf('day').format('YYYY-MM-DD'),
              dayjs().endOf('day').format('YYYY-MM-DD'),
            ],
            label: 'Today',
          },
          {
            value: [
              dayjs().startOf('day').format('YYYY-MM-DD'),
              dayjs().add(1, 'day').endOf('day').format('YYYY-MM-DD'),
            ],
            label: 'Today - tomorrow',
          },
          {
            value: [
              dayjs().startOf('month').format('YYYY-MM-DD'),
              dayjs().endOf('month').format('YYYY-MM-DD'),
            ],
            label: 'This month',
          },
          {
            value: [
              dayjs().startOf('year').format('YYYY-MM-DD'),
              dayjs().endOf('year').format('YYYY-MM-DD'),
            ],
            label: 'This year',
          },
          {
            value: [
              dayjs()
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD'),
              dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
            ],
            label: 'Last month',
          },
          {
            value: [
              dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
              dayjs().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
            ],
            label: 'Last year',
          },
        ]}
      />
    </Layout>
  );
}

export function Modal() {
  return <Layout>Modal</Layout>;
}

export function Notifications() {
  return <Layout>Notifications</Layout>;
}

export function Spotlight() {
  return <Layout>Spotlight</Layout>;
}
