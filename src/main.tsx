// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './global.css'
import Player from './components/player/Player.tsx'

const router = createBrowserRouter([
  {
    path: "/", 
    element: <Player />
  },
  {
    path: "/file/:title/:time?",
    element: <Player />
  }
])

createRoot(document.body!).render(<RouterProvider router={router} />)
