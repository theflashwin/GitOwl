import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import EditPage from './pages/EditPage'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import Account from './pages/Account'
import { Analytics } from "@vercel/analytics/react"

// Footer component with Tailwind styling
const Footer = () => {
  return (
    <footer className="z-10 bg-gray-800 text-white py-4 text-center fixed bottom-0 left-0 w-full border-t border-gray-700">
      <p className="text-sm">
      <a 
          href="http://ashwinmudaliar.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-2 text-blue-400 hover:underline transition-all duration-200"
        >
          Ashwin Mudaliar
        </a> © {new Date().getFullYear()} | 
        <a 
          href="https://github.com/theflashwin/git-parrot" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-2 text-blue-400 hover:underline transition-all duration-200"
        >
          View on GitHub
        </a>
      </p>
    </footer>
  )
}

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>} index />
          <Route path='/:repoowner/:name' element={<EditPage/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route path='/account' element={<Account/>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  )
}