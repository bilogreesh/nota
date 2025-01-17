'use client';

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { uploadData } from 'aws-amplify/storage';
import React from "react";
import { FileUploader } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import { getCurrentUser } from 'aws-amplify/auth';

import { getUrl } from 'aws-amplify/storage';

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [file, setFile] = React.useState();
  const [uploadedUrls, setUploadedUrls] = useState<Array<{ key: string, url: string }>>([]);
  const [error, setError] = useState<string>('');
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const handleChange = (event: any) => {
    setFile(event.target.files[0]);
  };
  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }
  const getFileUrl = async (key: string) => await getUrl({
    path: 'documents/',
    // Alternatively, path: ({identityId}) => `protected/${identityId}/album/2024/1.jpg`
    options: {
      validateObjectExistence: false,  // Check if object exists before creating a URL
      expiresIn: 20 // validity of the URL, in seconds. defaults to 900 (15 minutes) and maxes at 3600 (1 hour)
      
    },
  });
    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }
    
  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <button onClick={signOut}>Sign out</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
          Review next steps of this tutorial.
        </a>
      </div>
      <FileUploader
      acceptedFileTypes={['*/*']}
      path={`documents/{entity_id}/`}
      maxFileCount={1}
      isResumable={true}
      onUploadError={() => {
        console.log(`documents/${user.userId}/*`);
      }}
      onUploadSuccess={async (result) => {
        if (result?.key) {  // Add null check here
          const url = await getFileUrl(result.key);
          if (url) {
            setUploadedUrls(prev => [...prev, { key: result.key as string, url: url.toString()}]);          }
        }
      }}
    />
    </main>
  );
}
