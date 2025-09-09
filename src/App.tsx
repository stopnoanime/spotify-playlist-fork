import { useState } from 'react'
import './App.css'
import { run } from './spotify'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <button onClick={() => run()}>Run</button> 
    </>
  )
}

export default App
