import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import CodeEditor from "./ComponentsO/editor/index";
import Navbar from "./ComponentsO/navbar/index";
// import Layout from './Editor';
import Sign_up from './auth/sing-up/Sign_up';
import Sign_in from "./auth/sign-in/Sign_in"
import Home from './Home';
import DashBoardPage from './DashBoardPage';
import Layout from "./ComponentsO/navbar/Layout"
import CodeEditorPage from './CodeEditorPage';
function App() {
  return (
    <>
      <BrowserRouter>
       
          {/* <div className="w-screen flex grow"> */}
            <Routes>
              <Route path="/" element={<Home/>}></Route>
              <Route path="/sign-in" element={<Sign_in />} />
              <Route path="/sign-up" element={<Sign_up />} />
              <Route path="/dashboard" element={<Layout/>}></Route>
              <Route path="/code-editor/:id" element={<CodeEditorPage />} />            </Routes>
          {/* </div> */}
     
      </BrowserRouter>
    </>
  );
}

export default App;









// import CodeEditor from "./ComponentsO/editor/index";
// import { lightTheme, darkTheme } from "./components/layout/theme";
// import styled, { ThemeProvider } from "styled-components";
// import { GlobalStyles } from "./components/layout/GlobalStyles";
// import Navbar from "./ComponentsO/navbar/index"
// import { BrowserRouter,Routes,Route } from "react-router-dom";
// export default function App() {
//   return (
//     <>
 
//         <div className="flex w-screen flex-col h-screen bg-background">
//           <div className="h-12 flex m-2"><Navbar/></div>
//           <div className="w-screen flex grow"><CodeEditor /></div>
//         </div>
//     </>
//   );
// }
