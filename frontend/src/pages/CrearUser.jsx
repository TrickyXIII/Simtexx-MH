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
    rol_id: "", // Cambiado de 'rol' a 'rol_id' para la BD
    activo: true, // Booleano para la BD
  });

  function handleChange(e) {
    const value = e.target.type === "radio" 
      ? (e.target.value === "activo") 
      : e.target.value;

    setForm({ ...form, [e.target.name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.repetirPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (!form.rol_id) {
        alert("Debes seleccionar un rol");
        return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: form.nombre,
            correo: form.correo,
            password: form.password,
            rol_id: parseInt(form.rol_id), // Convertir a número
            activo: form.activo
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Usuario creado exitosamente en la Base de Datos ✔");
        navigate("/GestionUser"); // O volver al dashboard
      } else {
        alert("Error: " + (data.error || "No se pudo crear"));
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  }

  return (
    <>
    <NavBar />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
      <h2>Crear Nuevo Usuario</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          gap: "10px",
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}
      >
        <label>Nombre Completo</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          placeholder="Ej: Juan Pérez"
          style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
        />

        <label>Correo Electrónico</label>
        <input
          type="email"
          name="correo"
          value={form.correo}
          onChange={handleChange}
          required
          placeholder="juan@simtexx.com"
          style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
        />

        <label>Contraseña</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="******"
          style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
        />

        <label>Repetir Contraseña</label>
        <input
          type="password"
          name="repetirPassword"
          value={form.repetirPassword}
          onChange={handleChange}
          required
          placeholder="******"
          style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
        />

        <label>Rol</label>
        <select
          name="rol_id"
          value={form.rol_id}
          onChange={handleChange}
          required
          style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
        >
          <option value="">Seleccionar</option>
          <option value="1">Administrador</option>
          <option value="2">Cliente</option>
          <option value="3">Mantenedor (Técnico)</option>
        </select>

        <label>Estado</label>
        <div style={{ display: "flex", gap: "15px", marginTop: "5px" }}>
          <label style={{display:'flex', alignItems:'center', gap:'5px', fontWeight:'normal'}}>
            <input
              type="radio"
              name="activo"
              value="activo"
              checked={form.activo === true}
              onChange={() => setForm({...form, activo: true})}
            />
            Activo
          </label>

          <label style={{display:'flex', alignItems:'center', gap:'5px', fontWeight:'normal'}}>
            <input
              type="radio"
              name="activo"
              value="inactivo"
              checked={form.activo === false}
              onChange={() => setForm({...form, activo: false})}
            />
            Inactivo
          </label>
        </div>

        <button 
            type="submit" 
            style={{ 
                marginTop: "15px", 
                padding: "10px", 
                background: "#d62828", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer",
                fontWeight: "bold"
            }}
        >
          Guardar Usuario
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ 
              marginTop: "5px", 
              padding: "10px", 
              background: "#555", 
              color: "white", 
              border: "none", 
              borderRadius: "5px", 
              cursor: "pointer" 
            }}
        >
          Cancelar
        </button>
      </form>
    </div>
    <Footer />
    </>
  );
}