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
      const res = await fetch("http://localhost:4000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo,
          password_hash: password_hash,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Correo o contraseña incorrectos");
        return;
      }

      const user = data.user;

      // validar estado activo (si tu BD tiene columna "activo")
      if (user.activo && user.activo !== "activo") {
        alert("Este usuario está inactivo y no puede iniciar sesión");
        return;
      }

      // guardar en localStorage tal como ya lo usas
      localStorage.setItem("usuarioActual", JSON.stringify(user));

      // navegación misma que ya tenías
      navigate(`/dashboard`);

    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
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
            placeholder="Example@mail.com"
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
