import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Book, BookCopy } from '../types';
import { Plus, Search, QrCode, Printer, Layers, Image as ImageIcon } from 'lucide-react';

export const CatalogManager: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddCopiesModal, setShowAddCopiesModal] = useState<Book | null>(null);
  const [showQrModal, setShowQrModal] = useState<{ copy: BookCopy; book: Book; svg: string } | null>(null);

  // New Book Form State
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: 'Computer Science',
    publicationYear: 2026,
    coverUrl: '',
    description: '',
  });

  // Copies Form State
  const [copyCount, setCopyCount] = useState(2);
  const [shelfLocation, setShelfLocation] = useState('CS-A1-01');

  const loadBooks = async (query?: string) => {
    try {
      const data = await api.getBooks(query);
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBooks(searchTerm);
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createBook(newBook);
    setShowAddBookModal(false);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      category: 'Computer Science',
      publicationYear: 2026,
      coverUrl: '',
      description: '',
    });
    loadBooks();
  };

  const handleAddCopies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddCopiesModal) return;
    await api.addCopies(showAddCopiesModal.id, copyCount, shelfLocation);
    setShowAddCopiesModal(null);
    loadBooks();
  };

  const handleOpenQrModal = async (copy: BookCopy, book: Book) => {
    const data = await api.getCopyQr(copy.barcode);
    setShowQrModal({ copy, book, svg: data.qr.svg });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '500px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="input-catalog-search"
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '38px' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>
          <button id="btn-catalog-search" type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <button
          id="btn-add-new-book"
          onClick={() => setShowAddBookModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add New Title
        </button>
      </div>

      {/* Book Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {books.map((book) => (
          <div key={book.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
              ) : (
                <div style={{ width: '80px', height: '110px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={32} color="var(--text-muted)" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <span className="badge badge-borrowed" style={{ marginBottom: '6px' }}>{book.category}</span>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{book.title}</h4>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>by {book.author}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>ISBN: {book.isbn}</div>
              </div>
            </div>

            {/* Copies status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span>Total Copies: <strong style={{ color: 'var(--text-primary)' }}>{book.totalCopies || book.copies?.length || 0}</strong></span>
              <span>Available: <strong style={{ color: '#059669' }}>{book.availableCopies ?? 0}</strong></span>
            </div>

            {/* Physical copies list snippet */}
            {book.copies && book.copies.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Physical Copies:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {book.copies.map((copy) => (
                    <button
                      key={copy.id}
                      onClick={() => handleOpenQrModal(copy, book)}
                      title={`Click to view QR label: ${copy.shelfLocation}`}
                      style={{
                        background: copy.status === 'AVAILABLE' ? '#ecfdf5' : '#eff6ff',
                        border: '1px solid',
                        borderColor: copy.status === 'AVAILABLE' ? '#a7f3d0' : '#bfdbfe',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        color: copy.status === 'AVAILABLE' ? '#065f46' : '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      <QrCode size={12} />
                      {copy.barcode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button
                onClick={() => setShowAddCopiesModal(book)}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.8125rem', padding: '8px 12px' }}
              >
                <Layers size={15} />
                + Add Copies
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD TITLE MODAL */}
      {showAddBookModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '18px' }}>Add New Book to Catalog</h3>
            <form onSubmit={handleCreateBook}>
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Introduction to Algorithms"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Thomas H. Cormen"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ISBN-13</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 978-0262033848"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Publisher</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. MIT Press"
                    value={newBook.publisher}
                    onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Algorithms & Data Structures"
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Book Cover Image URL (Cloudinary or Direct)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newBook.coverUrl}
                  onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddBookModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Catalog Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COPIES MODAL */}
      {showAddCopiesModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '8px' }}>Add Copies: {showAddCopiesModal.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              The system will generate unique accession barcodes and assign initial shelf coordinates.
            </p>
            <form onSubmit={handleAddCopies}>
              <div className="form-group">
                <label className="form-label">Quantity of Physical Copies to Add</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={copyCount}
                  onChange={(e) => setCopyCount(parseInt(e.target.value, 10))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Shelf Location / Stack</label>
                <input
                  type="text"
                  placeholder="e.g. CS-A2-05"
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddCopiesModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Copies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT QR LABEL MODAL */}
      {showQrModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px', maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={20} />
              Book Copy QR Label
            </h3>

            {/* Printable Label Card */}
            <div
              className="printable-area"
              style={{
                background: 'white',
                color: '#0f172a',
                padding: '24px',
                borderRadius: '8px',
                border: '2px dashed #94a3b8',
                textAlign: 'center',
                margin: '16px 0',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#64748b' }}>
                Central University Library
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px', lineHeight: 1.2 }}>
                {showQrModal.book.title}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                {showQrModal.book.author}
              </div>

              {/* Render SVG QR */}
              <div
                style={{ margin: '14px auto', width: '150px', height: '150px', display: 'flex', justifyContent: 'center' }}
                dangerouslySetInnerHTML={{ __html: showQrModal.svg }}
              />

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, letterSpacing: '2px' }}>
                {showQrModal.copy.barcode}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                SHELF: {showQrModal.copy.shelfLocation} • ISBN: {showQrModal.book.isbn}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
              >
                <Printer size={18} />
                Print Physical Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
