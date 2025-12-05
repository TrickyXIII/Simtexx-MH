import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

export default function CrearUsuario() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    repetirPassword: "",
    rol: "",
    activo: "activo",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.repetirPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const nuevoUsuario = {
      id: crypto.randomUUID(),
      nombre: form.nombre,
      correo: form.correo,
      password: form.password,
      rol: form.rol,
      activo: form.activo,
    };

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Usuario creado exitosamente");
    navigate("/usuarios");
  }

  return (
    <>
    <NavBar />
    <div>
      <h2>Crear Usuario</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "400px",
        }}
      >
        <label>Nombre</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <label>Correo</label>
        <input
          type="email"
          name="correo"
          value={form.correo}
          onChange={handleChange}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label>Repetir Contraseña</label>
        <input
          type="password"
          name="repetirPassword"
          value={form.repetirPassword}
          onChange={handleChange}
          required
        />

        <label>Rol</label>
        <select
          name="rol"
          value={form.rol}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar</option>
          <option value="Administrador">Administrador</option>
          <option value="Cliente">Cliente</option>
          <option value="Mantenedor">Mantenedor</option>
        </select>

        <label>Estado</label>
        <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
          <label>
            <input
              type="radio"
              name="activo"
              value="activo"
              checked={form.activo === "activo"}
              onChange={handleChange}
            />
            Activo
          </label>

          <label>
            <input
              type="radio"
              name="activo"
              value="inactivo"
              checked={form.activo === "inactivo"}
              onChange={handleChange}
            />
            Inactivo
          </label>
        </div>

        <button type="submit" onClick={() => navigate(-1)} style={{ marginTop: "15px" }}>
          Crear Usuario
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ marginTop: "10px", background: "#999" }}
        >
          Cancelar
        </button>
      </form>
    </div>
    <Footer />
    </>
  );
}
