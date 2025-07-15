import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import App from "../App";

const AppRouter = () => {
  return (
    <Routes>
      {/* Ruta principal - vista de contactos */}
      <Route path="/" element={<App />} />
      
      {/* Chat con contacto específico */}
      <Route path="/chat/:contactId" element={<App />} />
      
      {/* Ruta para gestión de contactos (futura funcionalidad) */}
      <Route path="/contacts" element={<App />} />
      
      {/* Ruta para configuraciones (futura funcionalidad) */}
      <Route path="/settings" element={<App />} />
      
      {/* Redirecciones de rutas antiguas */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      
      {/* Ruta 404 - redirige a la página principal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;