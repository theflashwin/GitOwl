import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import EditPage from './pages/EditPage'

import NotFound from './pages/NotFound'

export default function App() {

  return (
    <div>

      <BrowserRouter>
      
        <Routes>

          <Route path='/' element={<Home/>} index />
          <Route path='/edit' element={<EditPage/>} />
          <Route path="*" element={<NotFound />} />

        </Routes>

      </BrowserRouter>

    </div>
  )
  
}