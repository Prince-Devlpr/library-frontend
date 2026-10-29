import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import type { Book, BookCopy } from '../types';
import { Plus, Search, QrCode, Printer, Layers, Image as ImageIcon, Edit3, Upload, Tag } from 'lucide-react';

export const CatalogManager: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState<Book | null>(null);
  const [showAddCopiesModal, setShowAddCopiesModal] = useState<Book | null>(null);
  const [showQrModal, setShowQrModal] = useState<{ copy: BookCopy; book: Book; svg: string } | null>(null);

  // File Input Refs
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New Book Form State
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: 'Computer Science',
    publicationYear: 2026,
    price: 499.00,
    coverUrl: '',
    description: '',
  });

  // Edit Book Form State
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: 'Computer Science',
    publicationYear: 2026,
    price: 499.00,
    coverUrl: '',
    description: '',
  });

  // Copies Form State
  const [copyCount, setCopyCount] = useState(2);
  const [shelfLocation, setShelfLocation] = useState('CS-A1-01');

  const loadBooks = async (query?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getBooks(query);
      setBooks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load catalog');
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBooks(searchTerm);
  };

  // File Picker & Upload Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      alert('Selected image exceeds 8MB size limit. Please choose a smaller photo.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        // Upload to backend Cloudinary/storage
        const res = await api.uploadImage(base64Data);
        const finalUrl = res.url || base64Data;

        if (isEditing) {
          setEditForm((prev) => ({ ...prev, coverUrl: finalUrl }));
        } else {
          setNewBook((prev) => ({ ...prev, coverUrl: finalUrl }));
        }
        setSuccessMessage('Photo uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        // Fallback to local base64 data URI so user is not blocked
        const base64Data = reader.result as string;
        if (isEditing) {
          setEditForm((prev) => ({ ...prev, coverUrl: base64Data }));
        } else {
          setNewBook((prev) => ({ ...prev, coverUrl: base64Data }));
        }
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await api.createBook({
        ...newBook,
        price: Number(newBook.price) || 499.00,
        publicationYear: Number(newBook.publicationYear) || 2026,
      });
      setShowAddBookModal(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        category: 'Computer Science',
        publicationYear: 2026,
        price: 499.00,
        coverUrl: '',
        description: '',
      });
      setSuccessMessage('Book title added to catalog successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadBooks();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create book title');
    }
  };

  const handleOpenEditModal = (book: Book) => {
    setShowEditBookModal(book);
    setEditForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      category: book.category,
      publicationYear: book.publicationYear,
      price: book.price !== undefined ? Number(book.price) : 499.00,
      coverUrl: book.coverUrl || '',
      description: book.description || '',
    });
  };

  const handleSaveEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditBookModal) return;
    setErrorMessage(null);
    try {
      await api.updateBook(showEditBookModal.id, {
        ...editForm,
        price: Number(editForm.price) || 499.00,
        publicationYear: Number(editForm.publicationYear) || 2026,
      });
      setShowEditBookModal(null);
      setSuccessMessage(`Updated details for "${editForm.title}"!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadBooks();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update book details');
    }
  };

  const handleAddCopies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddCopiesModal) return;
    try {
      await api.addCopies(showAddCopiesModal.id, copyCount, shelfLocation);
      setShowAddCopiesModal(null);
      setSuccessMessage(`Added ${copyCount} copies for ${showAddCopiesModal.title}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadBooks();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add copies');
    }
  };

  const handleOpenQrModal = async (copy: BookCopy, book: Book) => {
    try {
      const data = await api.getCopyQr(copy.barcode);
      setShowQrModal({ copy, book, svg: data.qr.svg });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load QR code');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Notifications */}
      {errorMessage && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#047857', fontSize: '0.875rem' }}>
          {successMessage}
        </div>
      )}

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
          style={{ padding: '10px 18px', gap: '8px' }}
        >
          <Plus size={18} />
          Add New Title
        </button>
      </div>

      {/* Quick Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['All Categories', 'Computer Science', 'Finance', 'Science Fiction', 'Self-Improvement', 'Biography'].map((cat) => {
          const isSelected = (cat === 'All Categories' && !searchTerm) || searchTerm.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                if (cat === 'All Categories') {
                  setSearchTerm('');
                  loadBooks();
                } else {
                  setSearchTerm(cat);
                  loadBooks(cat);
                }
              }}
              className={`tab-pill ${isSelected ? 'active' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {isLoading && books.length === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel" style={{ padding: '20px', height: '240px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="skeleton" style={{ width: '80px', height: '110px' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: '18px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ width: '85%', height: '20px', marginBottom: '6px' }} />
                  <div className="skeleton" style={{ width: '60%', height: '14px' }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: '36px', marginTop: '20px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Book Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {books.map((book) => (
          <div key={book.id} className="glass-panel hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}
                />
              ) : (
                <div style={{ width: '80px', height: '110px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={32} color="var(--text-muted)" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                  <span className="badge badge-borrowed">{book.category}</span>
                  {/* Price Tag Badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    <Tag size={12} />
                    ₹{book.price !== undefined ? Number(book.price).toFixed(0) : '499'}
                  </span>
                </div>
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

            {/* Actions: Edit Details and Add Copies */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
              <button
                onClick={() => handleOpenEditModal(book)}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.8125rem', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Edit3 size={14} />
                Edit Details
              </button>
              <button
                onClick={() => setShowAddCopiesModal(book)}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.8125rem', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Layers size={14} />
                + Add Copies
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD TITLE MODAL */}
      {showAddBookModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px', maxWidth: '560px' }}>
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
                    placeholder="e.g. Computer Science"
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price Tag (₹ / INR)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 499.00"
                    value={newBook.price}
                    onChange={(e) => setNewBook({ ...newBook, price: parseFloat(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Publication Year</label>
                  <input
                    required
                    type="number"
                    value={newBook.publicationYear}
                    onChange={(e) => setNewBook({ ...newBook, publicationYear: parseInt(e.target.value, 10) || 2026 })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Cover Photo Upload from Files or URL */}
              <div className="form-group">
                <label className="form-label">Book Cover Photo</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    ref={addFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, false)}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={16} />
                    {isUploading ? 'Uploading...' : 'Choose from Files'}
                  </button>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>or paste URL below</span>
                </div>

                <input
                  type="text"
                  placeholder="https://... or auto-filled from photo upload"
                  value={newBook.coverUrl}
                  onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
                  className="form-input"
                  style={{ marginTop: '8px' }}
                />

                {newBook.coverUrl && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={newBook.coverUrl}
                      alt="Cover Preview"
                      style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>✓ Cover Photo Attached</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddBookModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="btn btn-primary">
                  Create Catalog Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TITLE MODAL */}
      {showEditBookModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px', maxWidth: '560px' }}>
            <h3 style={{ marginBottom: '6px' }}>Modify Book Details</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '18px' }}>
              Update book metadata, price tag, or cover photo. Changes reflect immediately across the mobile app.
            </p>

            <form onSubmit={handleSaveEditBook}>
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input
                  required
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input
                    required
                    type="text"
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ISBN-13</label>
                  <input
                    required
                    type="text"
                    value={editForm.isbn}
                    onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
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
                    value={editForm.publisher}
                    onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    required
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price Tag (₹ / INR)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Publication Year</label>
                  <input
                    required
                    type="number"
                    value={editForm.publicationYear}
                    onChange={(e) => setEditForm({ ...editForm, publicationYear: parseInt(e.target.value, 10) || 2026 })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Cover Photo Upload from Files or URL */}
              <div className="form-group">
                <label className="form-label">Book Cover Photo</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, true)}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={16} />
                    {isUploading ? 'Uploading...' : 'Choose Photo from Files'}
                  </button>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>or paste URL below</span>
                </div>

                <input
                  type="text"
                  placeholder="https://... or uploaded photo URL"
                  value={editForm.coverUrl}
                  onChange={(e) => setEditForm({ ...editForm, coverUrl: e.target.value })}
                  className="form-input"
                  style={{ marginTop: '8px' }}
                />

                {editForm.coverUrl && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={editForm.coverUrl}
                      alt="Cover Preview"
                      style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>✓ Attached Cover Photo</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowEditBookModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="btn btn-primary">
                  Save Changes
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
                SHELF: {showQrModal.copy.shelfLocation} • ISBN: {showQrModal.book.isbn} • PRICE: ₹{showQrModal.book.price !== undefined ? Number(showQrModal.book.price).toFixed(0) : '499'}
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
