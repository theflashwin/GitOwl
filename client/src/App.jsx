import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import EditPage from './pages/EditPage'

import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import Account from './pages/Account'

export default function App() {

  return (
    <div>

      <BrowserRouter>
      
        <Routes>

          <Route path='/' element={<Home/>} index />
          <Route path='/edit' element={<EditPage/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route path='/account' element={<Account/>} />

          <Route path="*" element={<NotFound />} />

        </Routes>

      </BrowserRouter>

    </div>
  )
  
}