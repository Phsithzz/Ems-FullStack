import "./App.css";
import EmployeeComponent from "./components/EmployeeComponent";
import FooterComponent from "./components/FooterComponent";
import HeaderComponent from "./components/HeaderComponent";
import ListEmployeeComponent from "./components/ListEmployeeComponent";

import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <HeaderComponent />
        <Routes>

          {/* localhost:3000 */}
          <Route path="/" element={<ListEmployeeComponent />} />

          {/* localhost:3000/employees */}
          <Route path="/employees" element={<ListEmployeeComponent />} />

          <Route path="/add-employee" element={<EmployeeComponent/>}/>

        </Routes>
        <FooterComponent />
      </BrowserRouter>
    </>
  );
};

export default App;
