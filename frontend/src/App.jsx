import Navbar from './components/Header/Navbar'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<h1>Home</h1>} />
      </Routes>
    </Router>
  )
}

export default App
