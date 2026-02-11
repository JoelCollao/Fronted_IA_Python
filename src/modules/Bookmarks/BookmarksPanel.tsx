import React, { useState, useEffect } from 'react';
import { useMap } from '../../core/contexts/MapContext';
import { Bookmark } from '../../core/types/gis.types';
import './BookmarksPanel.css';

interface BookmarksPanelProps {
  onClose: () => void;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ onClose }) => {
  const { map, mapState } = useMap();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [newBookmarkDesc, setNewBookmarkDesc] = useState('');

  // Cargar bookmarks del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gis-bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const saveBookmarks = (updated: Bookmark[]) => {
    localStorage.setItem('gis-bookmarks', JSON.stringify(updated));
    setBookmarks(updated);
  };

  const handleAddBookmark = () => {
    if (!newBookmarkName.trim()) return;

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      name: newBookmarkName,
      description: newBookmarkDesc,
      center: mapState.center,
      zoom: mapState.zoom,
      createdAt: new Date()
    };

    saveBookmarks([...bookmarks, newBookmark]);
    setNewBookmarkName('');
    setNewBookmarkDesc('');
    setShowAddForm(false);
  };

  const handleRestoreBookmark = (bookmark: Bookmark) => {
    if (map) {
      map.setView(bookmark.center as [number, number], bookmark.zoom);
    }
  };

  const handleDeleteBookmark = (id: string) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <div className="floating-panel bookmarks-panel">
      <div className="panel-header">
        <h3>📌 Vistas Guardadas</h3>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>
      
      <div className="panel-content">
        <button
          className="tool-btn primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          ➕ Guardar Vista Actual
        </button>

        {showAddForm && (
          <div className="add-bookmark-form">
            <input
              type="text"
              placeholder="Nombre de la vista"
              value={newBookmarkName}
              onChange={(e) => setNewBookmarkName(e.target.value)}
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={newBookmarkDesc}
              onChange={(e) => setNewBookmarkDesc(e.target.value)}
              rows={2}
            />
            <div className="form-actions">
              <button className="btn-save" onClick={handleAddBookmark}>
                Guardar
              </button>
              <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bookmarks-list">
          {bookmarks.length === 0 ? (
            <div className="empty-state">
              <p>No hay vistas guardadas</p>
            </div>
          ) : (
            bookmarks.map(bookmark => (
              <div key={bookmark.id} className="bookmark-item">
                <div className="bookmark-info">
                  <h4>{bookmark.name}</h4>
                  {bookmark.description && (
                    <p className="bookmark-desc">{bookmark.description}</p>
                  )}
                  <p className="bookmark-meta">
                    Zoom: {bookmark.zoom.toFixed(1)} • 
                    {new Date(bookmark.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bookmark-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleRestoreBookmark(bookmark)}
                    title="Ir a esta vista"
                  >
                    📍
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
