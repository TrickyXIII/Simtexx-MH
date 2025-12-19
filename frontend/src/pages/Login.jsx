import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState(""); 

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo,
          password: password, 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Correo o contraseña incorrectos");
        return;
      }

      const user = data.user;

      if (user.activo === false) {
        alert("Este usuario está inactivo y no puede iniciar sesión");
        return;
      }

      localStorage.setItem("usuarioActual", JSON.stringify(user));
      navigate(`/dashboard`);

    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor. Revisa que el backend esté encendido.");
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
            value={password}
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