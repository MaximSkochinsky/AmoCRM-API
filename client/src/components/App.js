import '../css/App.css';
import Amo from './Amo';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link, 
} from 'react-router-dom';
import Calendar from './Calendar';
import Slots from './Slots';



function App() {

  return (
    <div className="App">
      <header className="App-header">  
      <Routes>

        <Route path="/calendar" element={<Calendar />}>
        </Route>

        <Route path="/" element={<Amo />}>
        </Route>

        <Route path="/slots" element={<Slots />}>
        </Route>
      </Routes>
      </header>
    </div>
  );
}

export default App;
