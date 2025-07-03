'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Usuario {
  id: number;
  nombre: string;
  admin: boolean;
}

interface Permiso {
  id: number;
  usuario_id: number;
  ruta: string;
  permitido: boolean;
}

const rutasDisponibles = [
  { path: '/canales', nombre: 'Canales' },
  { path: '/centro_costos', nombre: 'Centros de Costos' },
  { path: '/clientes', nombre: 'Clientes' },
  { path: '/clientes/ver', nombre: 'Ver', parent: '/clientes' },
  { path: '/clientes/crear', nombre: 'Crear', parent: '/clientes' },
  { path: '/clientes/editar', nombre: 'Editar', parent: '/clientes' },
  { path: '/components', nombre: 'Componentes' },
  { path: '/conductores', nombre: 'Conductores' },
  { path: '/conductores/crear', nombre: 'Crear', parent: '/conductores' },
  { path: '/conductores/editar', nombre: 'Editar', parent: '/conductores' },
  { path: '/cuenta', nombre: 'Cuenta' },
  { path: '/descuentos', nombre: 'Descuentos' },
  { path: '/empresas', nombre: 'Empresas' },
  { path: '/empresas/ver', nombre: 'Ver', parent: '/empresas' },
  { path: '/empresas/crear', nombre: 'Crear', parent: '/empresas' },
  { path: '/empresas/editar', nombre: 'Editar', parent: '/empresas' },
  { path: '/estados', nombre: 'Estados' },
  { path: '/generales', nombre: 'Generales' },
  { path: '/inicio', nombre: 'Inicio' },
  { path: '/max_loyalty', nombre: 'Max Loyalty' },
  { path: '/max_pay', nombre: 'Max Pay' },
  { path: '/miembros', nombre: 'Miembros' },
  { path: '/monedas', nombre: 'Monedas' },
  { path: '/monedero_flota', nombre: 'Monedero Flota' },
  { path: '/monedero_flota/crear', nombre: 'Crear', parent: '/monedero_flota' },
  { path: '/monedero_flota/editar', nombre: 'Editar', parent: '/monedero_flota' },
  { path: '/monedero_flota/monedero_reset', nombre: 'Ver monederos restablecidos' },
  { path: '/monedero_reset/formulario_reset', nombre: 'Restablecer Monedero', parent: '/monedero_flota/monedero_reset' },
  { path: '/paises', nombre: 'Países' },
  { path: '/permisos', nombre: 'Permisos' },
  { path: '/precios_semana', nombre: 'Precios por Semana' },
  { path: '/puntos', nombre: 'Puntos' },
  { path: '/redimir', nombre: 'Redimir' },
  { path: '/reportes_flota/reporte_canal_subcanal', nombre: 'Reportes de flota por canal y subcanal' },
  { path: '/reportes_flota/reporte_estacion', nombre: 'Reportes de flota por estación' },
  { path: '/reportes_flota/reporte_rendimiento', nombre: 'Reportes de flota por rendimiento de vehículo' },
  { path: '/reportes_transacciones/reportes', nombre: 'Reportes de loyalty por estación' },
  { path: '/reportes_transacciones/reporte_canal', nombre: 'Reportes de loyalty por canal' },
  { path: '/sub_canales', nombre: 'Subcanales' },
  { path: '/tarjetas', nombre: 'Tarjetas' },
  { path: '/tarjetas/desactivadas', nombre: 'Tarjetas Desactivadas', parent: '/tarjetas' },
  { path: '/tarjetas/editar', nombre: 'Editar', parent: '/tarjetas' },
  { path: '/tarjetas/preview', nombre: 'Imprimir Tarjeta', parent: '/tarjetas' },
  { path: '/tarjetas/crear', nombre: 'Crear', parent: '/tarjetas' },
  { path: '/terminales', nombre: 'Terminales' },
  { path: '/terminales/crear', nombre: 'Crear', parent: '/terminales' },
  { path: '/terminales/editar', nombre: 'Editar', parent: '/terminales' },
  { path: '/terminales/ver', nombre: 'Ver', parent: '/terminales' },
  { path: '/tipo_combustible', nombre: 'Tipos de Combustible' },
  { path: '/tipo_de_tarjetas', nombre: 'Tipos de Tarjetas' },
  { path: '/transacciones', nombre: 'Transacciones' },
  { path: '/transacciones/ver', nombre: 'Ver', parent: '/transacciones' },
  { path: '/transacciones_flota', nombre: 'Transacciones de Flota' },
  { path: '/transacciones_flota/ver', nombre: 'Ver', parent: '/transacciones_flota' },
  { path: '/turnos', nombre: 'Turnos' },
  { path: '/unidad_medida', nombre: 'Unidades de Medida' },
  { path: '/usuarios', nombre: 'Usuarios' },
  { path: '/vehiculos', nombre: 'Vehículos' },
  { path: '/vehiculos/ver', nombre: 'Ver', parent: '/vehiculos' },
  { path: '/vehiculos/crear', nombre: 'Crear', parent: '/vehiculos' },
  { path: '/vehiculos/editar', nombre: 'Editar', parent: '/vehiculos' },
];

const subRutasVehiculos = [
  { path: '/vehiculos/ver', nombre: 'Ver' },
  { path: '/vehiculos/crear', nombre: 'Crear' },
  { path: '/vehiculos/editar', nombre: 'Editar' },
];

const subRutasClientes = [
  { path: '/clientes/ver', nombre: 'Ver' },
  { path: '/clientes/crear', nombre: 'Crear' },
  { path: '/clientes/editar', nombre: 'Editar' },
];

const subRutasConductores = [
  { path: '/conductores/crear', nombre: 'Crear' },
  { path: '/conductores/editar', nombre: 'Editar' },
];

const subRutasTransacciones = [
  { path: '/transacciones/ver', nombre: 'Ver' },
];

const subRutasTransaccionesFlota = [
  { path: '/transacciones_flota/ver', nombre: 'Ver' },
];

const subRutasMonederoFlota = [
  { path: '/monedero_flota/crear', nombre: 'Crear' },
  { path: '/monedero_flota/editar', nombre: 'Editar' },
];

const subRutasMonederoReset = [
  { path: '/monedero_reset/formulario_reset', nombre: 'Restablecer Monedero' },
];

const subRutasTarjetas = [
  { path: '/tarjetas/desactivadas', nombre: 'Tarjetas Desactivadas' },
  { path: '/tarjetas/editar', nombre: 'Editar' },
  { path: '/tarjetas/preview', nombre: 'Imprimir Tarjeta' },
  { path: '/tarjetas/crear', nombre: 'Crear' },
];

const subRutasEmpresas = [
  { path: '/empresas/ver', nombre: 'Ver' },
  { path: '/empresas/crear', nombre: 'Crear' },
  { path: '/empresas/editar', nombre: 'Editar' },
];

const subRutasTerminales = [
  { path: '/terminales/crear', nombre: 'Crear' },
  { path: '/terminales/editar', nombre: 'Editar' },
  { path: '/terminales/ver', nombre: 'Ver' },
];

export default function Permisos() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pendingPermissions, setPendingPermissions] = useState<Permiso[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [searchUserTerm, setSearchUserTerm] = useState('');
  const [searchPermissionTerm, setSearchPermissionTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVehiculosSubmenuOpen, setIsVehiculosSubmenuOpen] = useState(false);
  const [isClientesSubmenuOpen, setIsClientesSubmenuOpen] = useState(false);
  const [isConductoresSubmenuOpen, setIsConductoresSubmenuOpen] = useState(false);
  const [isTransaccionesSubmenuOpen, setIsTransaccionesSubmenuOpen] = useState(false);
  const [isTransaccionesFlotaSubmenuOpen, setIsTransaccionesFlotaSubmenuOpen] = useState(false);
  const [isMonederoFlotaSubmenuOpen, setIsMonederoFlotaSubmenuOpen] = useState(false);
  const [isMonederoResetSubmenuOpen, setIsMonederoResetSubmenuOpen] = useState(false);
  const [isTarjetasSubmenuOpen, setIsTarjetasSubmenuOpen] = useState(false);
  const [isEmpresasSubmenuOpen, setIsEmpresasSubmenuOpen] = useState(false);
  const [isTerminalesSubmenuOpen, setIsTerminalesSubmenuOpen] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data: Usuario[] = await response.json();
        setUsuarios(data.filter((usuario) => !usuario.admin));
      } else {
        alert('Error al obtener usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error al obtener usuarios');
    }
  }, []);

  const fetchPermisos = useCallback(async (usuarioId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/permisos?usuarioId=${usuarioId}`);
      if (response.ok) {
        const data: Permiso[] = await response.json();
        setPendingPermissions(data);
        const vehiculosPermiso = data.find((p) => p.ruta === '/vehiculos');
        setIsVehiculosSubmenuOpen(vehiculosPermiso?.permitido || false);
        const clientesPermiso = data.find((p) => p.ruta === '/clientes');
        setIsClientesSubmenuOpen(clientesPermiso?.permitido || false);
        const conductoresPermiso = data.find((p) => p.ruta === '/conductores');
        setIsConductoresSubmenuOpen(conductoresPermiso?.permitido || false);
        const transaccionesPermiso = data.find((p) => p.ruta === '/transacciones');
        setIsTransaccionesSubmenuOpen(transaccionesPermiso?.permitido || false);
        const transaccionesFlotaPermiso = data.find((p) => p.ruta === '/transacciones_flota');
        setIsTransaccionesFlotaSubmenuOpen(transaccionesFlotaPermiso?.permitido || false);
        const monederoFlotaPermiso = data.find((p) => p.ruta === '/monedero_flota');
        setIsMonederoFlotaSubmenuOpen(monederoFlotaPermiso?.permitido || false);
        const monederoResetPermiso = data.find((p) => p.ruta === '/monedero_flota/monedero_reset');
        setIsMonederoResetSubmenuOpen(monederoResetPermiso?.permitido || false);
        const tarjetasPermiso = data.find((p) => p.ruta === '/tarjetas');
        setIsTarjetasSubmenuOpen(tarjetasPermiso?.permitido || false);
        const empresasPermiso = data.find((p) => p.ruta === '/empresas');
        setIsEmpresasSubmenuOpen(empresasPermiso?.permitido || false);
        const terminalesPermiso = data.find((p) => p.ruta === '/terminales');
        setIsTerminalesSubmenuOpen(terminalesPermiso?.permitido || false);
      } else {
        alert('Error al obtener permisos');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      alert('Error al obtener permisos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleUserSelect = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setSearchPermissionTerm('');
    fetchPermisos(usuario.id);
  };

  const handlePermissionChange = (permiso: Permiso) => {
    setPendingPermissions((prev) => {
      const existing = prev.find((p) => p.ruta === permiso.ruta);
      const newPermitido = !permiso.permitido;
      let updatedPermissions = [...prev];

      if (existing) {
        updatedPermissions = prev.map((p) =>
          p.ruta === permiso.ruta ? { ...p, permitido: newPermitido } : p
        );
      } else {
        updatedPermissions = [
          ...prev,
          {
            id: 0,
            usuario_id: permiso.usuario_id,
            ruta: permiso.ruta,
            permitido: newPermitido,
          },
        ];
      }

      if (permiso.ruta === '/vehiculos' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasVehiculos.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsVehiculosSubmenuOpen(false);
      } else if (permiso.ruta === '/vehiculos' && newPermitido) {
        setIsVehiculosSubmenuOpen(true);
      }

      if (permiso.ruta === '/clientes' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasClientes.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsClientesSubmenuOpen(false);
      } else if (permiso.ruta === '/clientes' && newPermitido) {
        setIsClientesSubmenuOpen(true);
      }

      if (permiso.ruta === '/conductores' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasConductores.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsConductoresSubmenuOpen(false);
      } else if (permiso.ruta === '/conductores' && newPermitido) {
        setIsConductoresSubmenuOpen(true);
      }

      if (permiso.ruta === '/transacciones' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasTransacciones.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsTransaccionesSubmenuOpen(false);
      } else if (permiso.ruta === '/transacciones' && newPermitido) {
        setIsTransaccionesSubmenuOpen(true);
      }

      if (permiso.ruta === '/transacciones_flota' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasTransaccionesFlota.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsTransaccionesFlotaSubmenuOpen(false);
      } else if (permiso.ruta === '/transacciones_flota' && newPermitido) {
        setIsTransaccionesFlotaSubmenuOpen(true);
      }

      if (permiso.ruta === '/monedero_flota' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasMonederoFlota.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsMonederoFlotaSubmenuOpen(false);
      } else if (permiso.ruta === '/monedero_flota' && newPermitido) {
        setIsMonederoFlotaSubmenuOpen(true);
      }

      if (permiso.ruta === '/monedero_flota/monedero_reset' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasMonederoReset.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsMonederoResetSubmenuOpen(false);
      } else if (permiso.ruta === '/monedero_flota/monedero_reset' && newPermitido) {
        setIsMonederoResetSubmenuOpen(true);
      }

      if (permiso.ruta === '/tarjetas' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasTarjetas.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsTarjetasSubmenuOpen(false);
      } else if (permiso.ruta === '/tarjetas' && newPermitido) {
        setIsTarjetasSubmenuOpen(true);
      }

      if (permiso.ruta === '/empresas' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasEmpresas.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsEmpresasSubmenuOpen(false);
      } else if (permiso.ruta === '/empresas' && newPermitido) {
        setIsEmpresasSubmenuOpen(true);
      }

      if (permiso.ruta === '/terminales' && !newPermitido) {
        updatedPermissions = updatedPermissions.map((p) =>
          subRutasTerminales.some((subRuta) => subRuta.path === p.ruta)
            ? { ...p, permitido: false }
            : p
        );
        setIsTerminalesSubmenuOpen(false);
      } else if (permiso.ruta === '/terminales' && newPermitido) {
        setIsTerminalesSubmenuOpen(true);
      }

      return updatedPermissions;
    });
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) {
      alert('Por favor, selecciona un usuario');
      return;
    }

    try {
      const response = await fetch('/api/permisos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingPermissions),
      });

      if (response.ok) {
        const updatedPermisos = await response.json();
        setPendingPermissions(updatedPermisos);
        alert('Permisos actualizados exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al actualizar los permisos');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Error al actualizar los permisos');
    }
  };

  const handleSearchUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUserTerm(e.target.value);
  };

  const handleSearchPermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchPermissionTerm(e.target.value);
  };

  const toggleVehiculosSubmenu = () => {
    setIsVehiculosSubmenuOpen((prev) => !prev);
  };

  const toggleClientesSubmenu = () => {
    setIsClientesSubmenuOpen((prev) => !prev);
  };

  const toggleConductoresSubmenu = () => {
    setIsConductoresSubmenuOpen((prev) => !prev);
  };

  const toggleTransaccionesSubmenu = () => {
    setIsTransaccionesSubmenuOpen((prev) => !prev);
  };

  const toggleTransaccionesFlotaSubmenu = () => {
    setIsTransaccionesFlotaSubmenuOpen((prev) => !prev);
  };

  const toggleMonederoFlotaSubmenu = () => {
    setIsMonederoFlotaSubmenuOpen((prev) => !prev);
  };

  const toggleMonederoResetSubmenu = () => {
    setIsMonederoResetSubmenuOpen((prev) => !prev);
  };

  const toggleTarjetasSubmenu = () => {
    setIsTarjetasSubmenuOpen((prev) => !prev);
  };

  const toggleEmpresasSubmenu = () => {
    setIsEmpresasSubmenuOpen((prev) => !prev);
  };

  const toggleTerminalesSubmenu = () => {
    setIsTerminalesSubmenuOpen((prev) => !prev);
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  const filteredRutas = rutasDisponibles.filter(
    (ruta) =>
      ruta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase()) &&
      !ruta.parent
  );

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 text-center">
                Gestión de Permisos
              </h1>
              <p className="text-center text-gray-700 leading-relaxed max-w-2xl p-4 rounded-lg transition-all duration-300 hover:shadow-md mx-auto">
                Administra los permisos de acceso a rutas y vistas para los usuarios del sistema.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Usuarios</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar usuario por nombre..."
                    value={searchUserTerm}
                    onChange={handleSearchUserChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="bg-gray-100 rounded-lg shadow-md p-4 max-h-[500px] overflow-y-auto">
                  {filteredUsuarios.length > 0 ? (
                    filteredUsuarios.map((usuario) => (
                      <div
                        key={usuario.id}
                        onClick={() => handleUserSelect(usuario)}
                        className={`p-3 cursor-pointer rounded-lg mb-2 transition-all duration-200 ${
                          selectedUser?.id === usuario.id ? 'bg-blue-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        {usuario.nombre}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay usuarios disponibles.</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Permisos {selectedUser ? `de ${selectedUser.nombre}` : ''}
                </h2>
                {selectedUser ? (
                  <>
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Buscar permiso por nombre..."
                        value={searchPermissionTerm}
                        onChange={handleSearchPermissionChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={handleUpdatePermissions}
                        disabled={!selectedUser || isLoading}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                          !selectedUser || isLoading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Actualizar Permisos
                      </button>
                    </div>
                    <div className="bg-gray-100 rounded-lg shadow-md p-4 max-h-[500px] overflow-y-auto">
                      {isLoading ? (
                        <p className="text-gray-500">Cargando permisos...</p>
                      ) : filteredRutas.length > 0 ? (
                        filteredRutas.map((ruta) => {
                          const permiso = pendingPermissions.find((p) => p.ruta === ruta.path) || {
                            id: 0,
                            usuario_id: selectedUser.id,
                            ruta: ruta.path,
                            permitido: false,
                          };
                          const isVehiculos = ruta.path === '/vehiculos';
                          const isClientes = ruta.path === '/clientes';
                          const isConductores = ruta.path === '/conductores';
                          const isTransacciones = ruta.path === '/transacciones';
                          const isTransaccionesFlota = ruta.path === '/transacciones_flota';
                          const isMonederoFlota = ruta.path === '/monedero_flota';
                          const isMonederoReset = ruta.path === '/monedero_flota/monedero_reset';
                          const isTarjetas = ruta.path === '/tarjetas';
                          const isEmpresas = ruta.path === '/empresas';
                          const isTerminales = ruta.path === '/terminales';
                          const vehiculosPermiso = pendingPermissions.find((p) => p.ruta === '/vehiculos')?.permitido || false;
                          const clientesPermiso = pendingPermissions.find((p) => p.ruta === '/clientes')?.permitido || false;
                          const conductoresPermiso = pendingPermissions.find((p) => p.ruta === '/conductores')?.permitido || false;
                          const transaccionesPermiso = pendingPermissions.find((p) => p.ruta === '/transacciones')?.permitido || false;
                          const transaccionesFlotaPermiso = pendingPermissions.find((p) => p.ruta === '/transacciones_flota')?.permitido || false;
                          const monederoFlotaPermiso = pendingPermissions.find((p) => p.ruta === '/monedero_flota')?.permitido || false;
                          const monederoResetPermiso = pendingPermissions.find((p) => p.ruta === '/monedero_flota/monedero_reset')?.permitido || false;
                          const tarjetasPermiso = pendingPermissions.find((p) => p.ruta === '/tarjetas')?.permitido || false;
                          const empresasPermiso = pendingPermissions.find((p) => p.ruta === '/empresas')?.permitido || false;
                          const terminalesPermiso = pendingPermissions.find((p) => p.ruta === '/terminales')?.permitido || false;

                          return (
                            <div key={ruta.path}>
                              <div className="flex items-center justify-between p-2">
                                <div className="flex items-center">
                                  {(isVehiculos || isClientes || isConductores || isTransacciones || isTransaccionesFlota || isMonederoFlota || isMonederoReset || isTarjetas || isEmpresas || isTerminales) && (
                                    <button
                                      onClick={
                                        isVehiculos
                                          ? toggleVehiculosSubmenu
                                          : isClientes
                                          ? toggleClientesSubmenu
                                          : isConductores
                                          ? toggleConductoresSubmenu
                                          : isTransacciones
                                          ? toggleTransaccionesSubmenu
                                          : isTransaccionesFlota
                                          ? toggleTransaccionesFlotaSubmenu
                                          : isMonederoFlota
                                          ? toggleMonederoFlotaSubmenu
                                          : isMonederoReset
                                          ? toggleMonederoResetSubmenu
                                          : isTarjetas
                                          ? toggleTarjetasSubmenu
                                          : isEmpresas
                                          ? toggleEmpresasSubmenu
                                          : toggleTerminalesSubmenu
                                      }
                                      className="mr-2 focus:outline-none"
                                      disabled={
                                        isVehiculos
                                          ? !vehiculosPermiso
                                          : isClientes
                                          ? !clientesPermiso
                                          : isConductores
                                          ? !conductoresPermiso
                                          : isTransacciones
                                          ? !transaccionesPermiso
                                          : isTransaccionesFlota
                                          ? !transaccionesFlotaPermiso
                                          : isMonederoFlota
                                          ? !monederoFlotaPermiso
                                          : isMonederoReset
                                          ? !monederoResetPermiso
                                          : isTarjetas
                                          ? !tarjetasPermiso
                                          : isEmpresas
                                          ? !empresasPermiso
                                          : !terminalesPermiso
                                      }
                                    >
                                      {(isVehiculos && isVehiculosSubmenuOpen) ||
                                      (isClientes && isClientesSubmenuOpen) ||
                                      (isConductores && isConductoresSubmenuOpen) ||
                                      (isTransacciones && isTransaccionesSubmenuOpen) ||
                                      (isTransaccionesFlota && isTransaccionesFlotaSubmenuOpen) ||
                                      (isMonederoFlota && isMonederoFlotaSubmenuOpen) ||
                                      (isMonederoReset && isMonederoResetSubmenuOpen) ||
                                      (isTarjetas && isTarjetasSubmenuOpen) ||
                                      (isEmpresas && isEmpresasSubmenuOpen) ||
                                      (isTerminales && isTerminalesSubmenuOpen) ? (
                                        <ChevronDown className="w-5 h-5" />
                                      ) : (
                                        <ChevronRight className="w-5 h-5" />
                                      )}
                                    </button>
                                  )}
                                  <span className={isVehiculos || isClientes || isConductores || isTransacciones || isTransaccionesFlota || isMonederoFlota || isMonederoReset || isTarjetas || isEmpresas || isTerminales ? '' : 'ml-7'}>
                                    {ruta.nombre}
                                  </span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={permiso.permitido}
                                  onChange={() => handlePermissionChange(permiso)}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </div>
                              {isVehiculos && isVehiculosSubmenuOpen && vehiculosPermiso && (
                                <div className="ml-8">
                                  {subRutasVehiculos
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!vehiculosPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isClientes && isClientesSubmenuOpen && clientesPermiso && (
                                <div className="ml-8">
                                  {subRutasClientes
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!clientesPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isConductores && isConductoresSubmenuOpen && conductoresPermiso && (
                                <div className="ml-8">
                                  {subRutasConductores
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!conductoresPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isTransacciones && isTransaccionesSubmenuOpen && transaccionesPermiso && (
                                <div className="ml-8">
                                  {subRutasTransacciones
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!transaccionesPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isTransaccionesFlota && isTransaccionesFlotaSubmenuOpen && transaccionesFlotaPermiso && (
                                <div className="ml-8">
                                  {subRutasTransaccionesFlota
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!transaccionesFlotaPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isMonederoFlota && isMonederoFlotaSubmenuOpen && monederoFlotaPermiso && (
                                <div className="ml-8">
                                  {subRutasMonederoFlota
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!monederoFlotaPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isMonederoReset && isMonederoResetSubmenuOpen && monederoResetPermiso && (
                                <div className="ml-8">
                                  {subRutasMonederoReset
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!monederoResetPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isTarjetas && isTarjetasSubmenuOpen && tarjetasPermiso && (
                                <div className="ml-8">
                                  {subRutasTarjetas
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!tarjetasPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isEmpresas && isEmpresasSubmenuOpen && empresasPermiso && (
                                <div className="ml-8">
                                  {subRutasEmpresas
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!empresasPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              {isTerminales && isTerminalesSubmenuOpen && terminalesPermiso && (
                                <div className="ml-8">
                                  {subRutasTerminales
                                    .filter((subRuta) =>
                                      subRuta.nombre.toLowerCase().includes(searchPermissionTerm.toLowerCase())
                                    )
                                    .map((subRuta) => {
                                      const subPermiso = pendingPermissions.find((p) => p.ruta === subRuta.path) || {
                                        id: 0,
                                        usuario_id: selectedUser.id,
                                        ruta: subRuta.path,
                                        permitido: false,
                                      };
                                      return (
                                        <div
                                          key={subRuta.path}
                                          className="flex items-center justify-between p-2"
                                        >
                                          <span>{subRuta.nombre}</span>
                                          <input
                                            type="checkbox"
                                            checked={subPermiso.permitido}
                                            onChange={() => handlePermissionChange(subPermiso)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={!terminalesPermiso}
                                          />
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500">No se encontraron permisos.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Selecciona un usuario para ver sus permisos.</p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}