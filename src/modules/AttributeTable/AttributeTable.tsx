import React, { useState, useMemo } from 'react';
import { useLayers } from '../../core/contexts/LayerContext';
import { useSelection } from '../../core/contexts/SelectionContext';
import { GeoJSONFeature } from '../../core/types/gis.types';
import './AttributeTable.css';

interface AttributeTableProps {
  onClose: () => void;
}

export const AttributeTable: React.FC<AttributeTableProps> = ({ onClose }) => {
  const { layers, activeLayerId } = useLayers();
  const { getSelection, addSelection, clearSelection } = useSelection();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const activeLayer = layers.find(l => l.id === activeLayerId);

  const features = useMemo(() => {
    if (!activeLayer?.data?.features) return [];

    let filtered = activeLayer.data.features;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(feature =>
        Object.values(feature.properties).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Ordenar
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a.properties[sortField];
        const bVal = b.properties[sortField];

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [activeLayer, searchTerm, sortField, sortOrder]);

  const fields = useMemo(() => {
    if (!activeLayer?.data?.features?.[0]) return [];
    return Object.keys(activeLayer.data.features[0].properties);
  }, [activeLayer]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRowSelect = (feature: GeoJSONFeature) => {
    const id = feature.id || JSON.stringify(feature.geometry);
    const newSelected = new Set(selectedRows);

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }

    setSelectedRows(newSelected);

    // Actualizar selección en el contexto
    if (activeLayerId) {
      clearSelection(activeLayerId);
      if (newSelected.size > 0) {
        const selectedFeatures = features.filter(f =>
          newSelected.has(f.id || JSON.stringify(f.geometry))
        );
        addSelection(activeLayerId, selectedFeatures);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === features.length) {
      setSelectedRows(new Set());
      if (activeLayerId) clearSelection(activeLayerId);
    } else {
      const allIds = new Set(features.map(f => f.id || JSON.stringify(f.geometry)));
      setSelectedRows(allIds);
      if (activeLayerId) {
        clearSelection(activeLayerId);
        addSelection(activeLayerId, features);
      }
    }
  };

  if (!activeLayer) {
    return (
      <div className="attribute-table">
        <div className="table-header">
          <h3>Tabla de Atributos</h3>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="table-empty">
          <p>No hay capa activa seleccionada</p>
          <p className="hint">Selecciona una capa del panel izquierdo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attribute-table">
      {/* Header */}
      <div className="table-header">
        <div className="table-title">
          <h3>Tabla de Atributos - {activeLayer.name}</h3>
          <span className="table-count">
            {selectedRows.size > 0 ? `${selectedRows.size} / ` : ''}
            {features.length} registros
          </span>
        </div>

        <div className="table-actions">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="table-search"
          />
          <button className="btn-icon" onClick={handleSelectAll} title="Seleccionar todo">
            ☑️
          </button>
          <button
            className="btn-icon"
            onClick={() => {
              setSelectedRows(new Set());
              if (activeLayerId) clearSelection(activeLayerId);
            }}
            title="Limpiar selección"
            disabled={selectedRows.size === 0}
          >
            🗑️
          </button>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-select">
                <input
                  type="checkbox"
                  checked={selectedRows.size === features.length && features.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              {fields.map(field => (
                <th key={field} onClick={() => handleSort(field)} className="sortable">
                  {field}
                  {sortField === field && (
                    <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => {
              const id = feature.id || JSON.stringify(feature.geometry);
              const isSelected = selectedRows.has(id);

              return (
                <tr
                  key={index}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => handleRowSelect(feature)}
                >
                  <td className="col-select">
                    <input type="checkbox" checked={isSelected} onChange={() => {}} />
                  </td>
                  {fields.map(field => (
                    <td key={field}>{String(feature.properties[field] ?? '')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
