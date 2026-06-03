import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

// Import Admin Pages
import AdminLayout from "./pages/AdminLayout";
import Login from "./pages/Login";

const App = () => {
  return (
    <Router>
      <LoadingProvider>
        <Suspense fallback={<div style={{height: "100vh", background: "black", color: "white"}}>Loading...</div>}>
          <Routes>
            <Route path="/" element={
              <MainContainer>
                <Suspense fallback={null}>
                  <CharacterModel />
                </Suspense>
              </MainContainer>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </LoadingProvider>
    </Router>
  );
};

export default App;
