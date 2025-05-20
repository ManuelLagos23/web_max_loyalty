'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';


type UnidadMedida = {
  category_id: number;
  display_name: string;
  factor: number;
  factor_inv: number;
  id: number;
  is_pos_groupable: boolean;
  name: string;
  rounding: number;
  uom_type: string;
  category_nombre: string;
};

type Categoria = {
  id: number;
  name: string;
};

export default function UnidadesMedida() {
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [unidadMedidaData, setUnidadMedidaData] = useState({
    category_id: 0,
    display_name: '',
    factor: 0,
    factor_inv: 0,
    is_pos_groupable: false,
    name: '',
    rounding: 0,
    uom_type: '',
  });
  const [unidadMedidaToUpdate, setUnidadMedidaToUpdate] = useState<UnidadMedida | null>(null);
  const [unidadMedidaToDelete, setUnidadMedidaToDelete] = useState<UnidadMedida | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUnidadesMedida = useCallback(async () => {
    try {
      const response = await fetch(`/api/unidad_medida?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const result = await response.json();
      // Debug the API response
        if (result && Array.isArray(result.data)) {
          setUnidadesMedida(result.data);
       // Debug the data being set
        } else {
          console.error('UnidadesMedida data is not an array:', result);
          setUnidadesMedida([]);
        }
      } else {
        console.error('Error fetching UnidadesMedida:', response.status, await response.text());
        setUnidadesMedida([]);
      }
    } catch (error) {
      console.error('Error in fetchUnidadesMedida:', error);
      setUnidadesMedida([]);
    }
  }, [currentPage, itemsPerPage]);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const result = await response.json();
     
        if (Array.isArray(result)) {
          setCategorias(result);
         
        } else if (result && Array.isArray(result.data)) {
          setCategorias(result.data);
    
        } else {
          console.error('Categorias data is not an array:', result);
          setCategorias([]);
        }
      } else {
        console.error('Error fetching Categorias:', response.status, await response.text());
        setCategorias([]);
      }
    } catch (error) {
      console.error('Error in fetchCategorias:', error);
      setCategorias([]);
    }
  }, []);

  useEffect(() => {
    fetchUnidadesMedida();
    fetchCategorias();
  }, [fetchUnidadesMedida, fetchCategorias]);

  useEffect(() => {
  

  }, [unidadesMedida, categorias]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setUnidadMedidaData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'category_id' || name === 'factor' || name === 'factor_inv' || name === 'rounding' ? parseFloat(value) || 0 : value),
    }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadMedidaData.name || unidadMedidaData.category_id === 0 || !unidadMedidaData.uom_type) {
      alert('Por favor, complete todos los campos obligatorios (Nombre, Categoría, Tipo de UOM).');
      return;
    }
    const formData = new FormData();
    formData.append('category_id', unidadMedidaData.category_id.toString());
    formData.append('display_name', unidadMedidaData.display_name);
    formData.append('factor', unidadMedidaData.factor.toString());
    formData.append('factor_inv', unidadMedidaData.factor_inv.toString());
    formData.append('is_pos_groupable', unidadMedidaData.is_pos_groupable.toString());
    formData.append('name', unidadMedidaData.name);
    formData.append('rounding', unidadMedidaData.rounding.toString());
    formData.append('uom_type', unidadMedidaData.uom_type);

    const response = await fetch('/api/unidad_medida', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newUnidadMedida = await response.json();
      alert('Unidad de medida agregada exitosamente');
      setUnidadesMedida((prev) => [...prev, newUnidadMedida.data]);
      setUnidadMedidaData({
        category_id: 0,
        display_name: '',
        factor: 0,
        factor_inv: 0,
        is_pos_groupable: false,
        name: '',
        rounding: 0,
        uom_type: '',
      });
      setIsAddModalOpen(false);
      fetchUnidadesMedida();
    } else {
      alert('Error al agregar la unidad de medida');
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unidadMedidaToUpdate) {
      if (!unidadMedidaData.name || unidadMedidaData.category_id === 0 || !unidadMedidaData.uom_type) {
        alert('Por favor, complete todos los campos obligatorios (Nombre, Categoría, Tipo de UOM).');
        return;
      }
      const formData = new FormData();
      formData.append('id', String(unidadMedidaToUpdate.id));
      formData.append('category_id', unidadMedidaData.category_id.toString());
      formData.append('display_name', unidadMedidaData.display_name);
      formData.append('factor', unidadMedidaData.factor.toString());
      formData.append('factor_inv', unidadMedidaData.factor_inv.toString());
      formData.append('is_pos_groupable', unidadMedidaData.is_pos_groupable.toString());
      formData.append('name', unidadMedidaData.name);
      formData.append('rounding', unidadMedidaData.rounding.toString());
      formData.append('uom_type', unidadMedidaData.uom_type);

      const response = await fetch('/api/unidad_medida', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedUnidadMedida = await response.json();
        alert('Unidad de medida actualizada exitosamente');
        setUnidadesMedida((prev) =>
          prev.map((unidad) =>
            unidad.id === updatedUnidadMedida.data.id ? updatedUnidadMedida.data : unidad
          )
        );
        setUnidadMedidaData({
          category_id: 0,
          display_name: '',
          factor: 0,
          factor_inv: 0,
          is_pos_groupable: false,
          name: '',
          rounding: 0,
          uom_type: '',
        });
        setIsUpdateModalOpen(false);
        fetchUnidadesMedida();
      } else {
        alert('Error al actualizar la unidad de medida');
      }
    }
  };

  const handleDelete = async () => {
    if (unidadMedidaToDelete) {
      const response = await fetch(`/api/unidad_medida/${unidadMedidaToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Unidad de medida eliminada exitosamente');
        setUnidadesMedida((prev) => prev.filter((unidad) => unidad.id !== unidadMedidaToDelete.id));
        setIsDeleteModalOpen(false);
        fetchUnidadesMedida();
      } else {
        alert('Error al eliminar la unidad de medida');
      }
    }
  };

  const filteredUnidadesMedida = unidadesMedida.filter((unidad) =>
    Object.values(unidad)
      .map((value) => String(value))
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUnidadesMedida = filteredUnidadesMedida.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUnidadesMedida.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
       <div className="font-sans bg-white text-gray-900 min-h-screen flex">
      <Navbar />
      <div className="flex-1 flex flex-col">
 
        <main className="flex-1 p-8 bg-white">
          <div className="space-y-4">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2 
              bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
              transition-all duration-300 text-center"
            >
              Gestión de Unidades de Medida
            </h1>
            <p
              className="text-center text-black leading-relaxed max-w-2xl p-2 rounded-lg 
              transition-all duration-300 hover:shadow-md mx-auto"
            >
              Configura las unidades de medida disponibles para los productos.
            </p>
          </div>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Agregar Unidad de Medida
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar unidades de medida..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-2/5 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <table className="mt-6 w-full table-auto border-collapse bg-gray-100 border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-center">#</th>
                <th className="px-4 py-2 text-center">Nombre</th>
                <th className="px-4 py-2 text-center">Nombre para Mostrar</th>
                <th className="px-4 py-2 text-center">Factor</th>
                <th className="px-4 py-2 text-center">Factor Inverso</th>
                <th className="px-4 py-2 text-center">Agrupable en POS</th>
                <th className="px-4 py-2 text-center">Redondeo</th>
                <th className="px-4 py-2 text-center">Tipo de UOM</th>
                <th className="px-4 py-2 text-center">Categoría</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUnidadesMedida.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-2 text-center">
                    No hay unidades de medida disponibles
                  </td>
                </tr>
              ) : (
                currentUnidadesMedida.map((unidad, index) => (
                  <tr key={unidad.id}>
                    <td className="px-4 py-2 text-center">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-2 text-center">{unidad.name}</td>
                    <td className="px-4 py-2 text-center">{unidad.display_name}</td>
                    <td className="px-4 py-2 text-center">{unidad.factor}</td>
                    <td className="px-4 py-2 text-center">{unidad.factor_inv}</td>
                    <td className="px-4 py-2 text-center">{unidad.is_pos_groupable ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2 text-center">{unidad.rounding}</td>
                    <td className="px-4 py-2 text-center">{unidad.uom_type}</td>
                    <td className="px-4 py-2 text-center">{unidad.category_nombre}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          setUnidadMedidaToUpdate(unidad);
                          setUnidadMedidaData({
                            category_id: unidad.category_id,
                            display_name: unidad.display_name,
                            factor: unidad.factor,
                            factor_inv: unidad.factor_inv,
                            is_pos_groupable: unidad.is_pos_groupable,
                            name: unidad.name,
                            rounding: unidad.rounding,
                            uom_type: unidad.uom_type,
                          });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2 hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setUnidadMedidaToDelete(unidad);
                          setIsDeleteModalOpen(true);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Siguiente
            </button>
          </div>
          {isAddModalOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsAddModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Agregar Unidad de Medida</h2>
                <form onSubmit={handleSubmitAdd}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="name">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Ejemplo: Litros"
                      value={unidadMedidaData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="display_name">
                      Nombre público
                    </label>
                    <input
                      type="text"
                      id="display_name"
                      name="display_name"
                      placeholder="Ejemplo: L"
                      value={unidadMedidaData.display_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="factor">
                        Ratio
                      </label>
                      <input
                        type="number"
                        id="factor"
                        name="factor"
                        placeholder="Ejemplo: 1.0"
                        value={unidadMedidaData.factor}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="factor_inv">
                        Mayor ratio
                      </label>
                      <input
                        type="number"
                        id="factor_inv"
                        name="factor_inv"
                        placeholder="Ejemplo: 1.0"
                        value={unidadMedidaData.factor_inv}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="is_pos_groupable">
                        Productos grupales en punto de venta
                      </label>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          id="is_pos_groupable"
                          name="is_pos_groupable"
                          checked={unidadMedidaData.is_pos_groupable}
                          onChange={handleInputChange}
                          className="w-6 h-6"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="rounding">
                        Precisión de redondeo
                      </label>
                      <input
                        type="number"
                        id="rounding"
                        name="rounding"
                        placeholder="Ejemplo: 0.01"
                        value={unidadMedidaData.rounding}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="uom_type">
                        Tipo
                      </label>
                      <select
                        id="uom_type"
                        name="uom_type"
                        value={unidadMedidaData.uom_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      >
                        <option value="">Seleccionar Tipo</option>
                        <option value="reference">Referencia</option>
                        <option value="smaller">Menor</option>
                        <option value="bigger">Mayor</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 text-center" htmlFor="category_id">
                        Categoría
                      </label>
                      <select
                        id="category_id"
                        name="category_id"
                        value={unidadMedidaData.category_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                      >
                        <option value={0}>Seleccionar Categoría</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isUpdateModalOpen && unidadMedidaToUpdate && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsUpdateModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 border">
                <h2 className="text-xl font-semibold mb-4 text-center">Actualizar Unidad de Medida</h2>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="name">
                      Unidad de Medida
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Ejemplo: Litros"
                      value={unidadMedidaData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="display_name">
                      Nombre público
                    </label>
                    <input
                      type="text"
                      id="display_name"
                      name="display_name"
                      placeholder="Ejemplo: L"
                      value={unidadMedidaData.display_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="factor">
                      Ratio
                    </label>
                    <input
                      type="number"
                      id="factor"
                      name="factor"
                      placeholder="Ejemplo: 1.0"
                      value={unidadMedidaData.factor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="factor_inv">
                      Mayor ratio
                    </label>
                    <input
                      type="number"
                      id="factor_inv"
                      name="factor_inv"
                      placeholder="Ejemplo: 1.0"
                      value={unidadMedidaData.factor_inv}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="is_pos_groupable">
                      Productos grupales en punto de venta
                    </label>
                    <input
                      type="checkbox"
                      id="is_pos_groupable"
                      name="is_pos_groupable"
                      checked={unidadMedidaData.is_pos_groupable}
                      onChange={handleInputChange}
                      className="w-6 h-6 mx-auto"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="rounding">
                      Precisión de redondeo
                    </label>
                    <input
                      type="number"
                      id="rounding"
                      name="rounding"
                      placeholder="Ejemplo: 0.01"
                      value={unidadMedidaData.rounding}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="uom_type">
                      Tipo
                    </label>
                    <select
                      id="uom_type"
                      name="uom_type"
                      value={unidadMedidaData.uom_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value="">Seleccionar Tipo</option>
                      <option value="reference">Referencia</option>
                      <option value="smaller">Menor</option>
                      <option value="bigger">Mayor</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-center" htmlFor="category_id">
                      Categoría
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={unidadMedidaData.category_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
                    >
                      <option value={0}>Seleccionar Categoría</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsUpdateModalOpen(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isDeleteModalOpen && unidadMedidaToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4 text-center">Eliminar Unidad de Medida</h2>
                <p className="text-center mb-4">
                  ¿Estás seguro de que deseas eliminar la unidad de medida {unidadMedidaToDelete.name}?
                </p>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}