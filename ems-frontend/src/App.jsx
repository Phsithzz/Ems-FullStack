import "./App.css";
import EmployeeComponent from "./components/EmployeeComponent";
import FooterComponent from "./components/FooterComponent";
import HeaderComponent from "./components/HeaderComponent";
import ListEmployeeComponent from "./components/ListEmployeeComponent";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
        <HeaderComponent />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          <Routes>
            {/* http://localhost:3000 */}
            <Route path="/" element={<ListEmployeeComponent />} />
            {/* http://localhost:3000/employees */}
            <Route path="/employees" element={<ListEmployeeComponent />} />
            {/* http://localhost:3000/add-employee */}
            <Route path="/add-employee" element={<EmployeeComponent />} />
            {/* http://localhost:3000/edit-employee/1 */}
            <Route path="/edit-employee/:id" element={<EmployeeComponent />} />
          </Routes>
        </main>
        <FooterComponent />
      </div>
    </BrowserRouter>
  );
};

export default App;
