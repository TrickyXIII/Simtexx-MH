import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password_hash, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      // Intentamos conectar al puerto 4000
      const res = await fetch("http://localhost:4000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo,
          password_hash: password_hash,
        }),
      });

      // Si el servidor responde pero hay error (ej: 401, 500)
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Correo o contraseña incorrectos");
        return;
      }

      const user = data.user;

      // CORRECCIÓN IMPORTANTE:
      // En la base de datos 'activo' es true o false (booleano).
      if (user.activo === false) {
        alert("Este usuario está inactivo y no puede iniciar sesión");
        return;
      }

      // Guardar en localStorage
      localStorage.setItem("usuarioActual", JSON.stringify(user));

      // Navegación
      navigate(`/dashboard/${user.id}`);

    } catch (error) {
      console.error("Error de conexión:", error);
      // Este mensaje sale si el backend está APAGADO
      alert("Error: No se pudo conectar con el Backend (Puerto 4000). Revisa que la terminal del servidor esté corriendo.");
    }
  }

  return (
    <>
      <div className="div">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@inacap.cl"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="******"
            value={password_hash}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Iniciar Sesion</button>
        </form>
      </div>
      <Footer />
    </>
  );
}