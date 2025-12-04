import { useState, useEffect } from 'react';
import { Book, Plus, Edit2, Trash2, Tag, Save, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BookType {
  id: string;
  title: string;
  description: string;
  author: string;
  cover_image_url: string | null;
  pdf_file_path: string;
  price: number;
  is_active: boolean;
}

interface CouponType {
  id: string;
  code: string;
  book_id: string | null;
  discount_type: 'free' | 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
}

export function LibraryManagement() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [coupons, setCoupons] = useState<CouponType[]>([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'coupons'>('books');

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    author: '',
    cover_image_url: '',
    pdf_file_path: '',
    price: 0,
    is_active: true
  });

  // Coupon form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    book_id: '',
    discount_type: 'free' as 'free' | 'percentage' | 'fixed',
    discount_value: 0,
    max_uses: '',
    expires_at: ''
  });

  useEffect(() => {
    loadBooks();
    loadCoupons();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBooks(data);
    }
    setLoading(false);
  };

  const loadCoupons = async () => {
    const { data, error } = await supabase
      .from('book_coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCoupons(data);
    }
  };

  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.author || !bookForm.pdf_file_path) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingBook) {
        // Update existing book
        const { error } = await supabase
          .from('books')
          .update(bookForm)
          .eq('id', editingBook.id);

        if (error) throw error;
      } else {
        // Create new book
        const { error } = await supabase
          .from('books')
          .insert([bookForm]);

        if (error) throw error;
      }

      // Reset form and reload
      setBookForm({
        title: '',
        description: '',
        author: '',
        cover_image_url: '',
        pdf_file_path: '',
        price: 0,
        is_active: true
      });
      setEditingBook(null);
      setShowBookForm(false);
      loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;
      loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    }
  };

  const handleEditBook = (book: BookType) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      description: book.description,
      author: book.author,
      cover_image_url: book.cover_image_url || '',
      pdf_file_path: book.pdf_file_path,
      price: book.price,
      is_active: book.is_active
    });
    setShowBookForm(true);
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code) {
      alert('Please enter a coupon code');
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('book_coupons')
        .insert([{
          code: couponForm.code.toUpperCase(),
          book_id: couponForm.book_id || null,
          discount_type: couponForm.discount_type,
          discount_value: couponForm.discount_value,
          max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
          expires_at: couponForm.expires_at || null,
          is_active: true,
          created_by: user.user?.id || null
        }]);

      if (error) throw error;

      // Reset form and reload
      setCouponForm({
        code: '',
        book_id: '',
        discount_type: 'free',
        discount_value: 0,
        max_uses: '',
        expires_at: ''
      });
      setShowCouponForm(false);
      loadCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      if (error.code === '23505') {
        alert('This coupon code already exists');
      } else {
        alert('Failed to save coupon');
      }
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('book_coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('book_coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId);

      if (error) throw error;
      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Failed to update coupon status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2A5E]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0A2A5E] flex items-center gap-2">
          <Book className="w-8 h-8" />
          Library Management
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'books'
              ? 'text-[#0A2A5E] border-b-2 border-[#0A2A5E]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Books ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'coupons'
              ? 'text-[#0A2A5E] border-b-2 border-[#0A2A5E]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Coupons ({coupons.length})
        </button>
      </div>

      {/* Books Tab */}
      {activeTab === 'books' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingBook(null);
                setBookForm({
                  title: '',
                  description: '',
                  author: '',
                  cover_image_url: '',
                  pdf_file_path: '',
                  price: 0,
                  is_active: true
                });
                setShowBookForm(true);
              }}
              className="bg-[#0A2A5E] text-white px-4 py-2 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Book
            </button>
          </div>

          {/* Book List */}
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-[#0A2A5E]">{book.title}</h3>
                      {!book.is_active && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
                    <p className="text-gray-700 mb-2">{book.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-[#3DB3E3]">
                        {book.price === 0 ? 'FREE' : `R${book.price.toFixed(2)}`}
                      </span>
                      <a
                        href={book.pdf_file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View PDF
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {books.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Book className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No books yet. Add your first book to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCouponForm(true)}
              className="bg-[#0A2A5E] text-white px-4 py-2 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Coupon
            </button>
          </div>

          {/* Coupon List */}
          <div className="space-y-4">
            {coupons.map((coupon) => {
              const book = books.find((b) => b.id === coupon.book_id);
              return (
                <div
                  key={coupon.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-lg font-bold text-[#0A2A5E] bg-gray-100 px-3 py-1 rounded">
                          {coupon.code}
                        </code>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            coupon.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Type:</strong>{' '}
                          {coupon.discount_type === 'free'
                            ? 'Free'
                            : coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}% off`
                            : `R${coupon.discount_value} off`}
                        </p>
                        <p>
                          <strong>Book:</strong> {book ? book.title : 'All Books'}
                        </p>
                        <p>
                          <strong>Usage:</strong> {coupon.current_uses}
                          {coupon.max_uses ? ` / ${coupon.max_uses}` : ' / Unlimited'}
                        </p>
                        {coupon.expires_at && (
                          <p>
                            <strong>Expires:</strong>{' '}
                            {new Date(coupon.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          coupon.is_active
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {coupon.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {coupons.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No coupons yet. Create your first coupon to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Book Form Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] p-6 text-white rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h3>
                <button
                  onClick={() => {
                    setShowBookForm(false);
                    setEditingBook(null);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                  placeholder="Book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                  placeholder="Author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                  placeholder="Book description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File Path *
                </label>
                <input
                  type="text"
                  value={bookForm.pdf_file_path}
                  onChange={(e) => setBookForm({ ...bookForm, pdf_file_path: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                  placeholder="/path-to-file.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload PDF to /public folder and enter path (e.g., /mybook.pdf)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={bookForm.cover_image_url}
                  onChange={(e) => setBookForm({ ...bookForm, cover_image_url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (R)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bookForm.price}
                  onChange={(e) => setBookForm({ ...bookForm, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Set to 0 for free books</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={bookForm.is_active}
                  onChange={(e) => setBookForm({ ...bookForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#0A2A5E] border-gray-300 rounded focus:ring-[#3DB3E3]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveBook}
                  className="flex-1 bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button
                  onClick={() => {
                    setShowBookForm(false);
                    setEditingBook(null);
                  }}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Create Coupon</h3>
                <button
                  onClick={() => setShowCouponForm(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none uppercase"
                  placeholder="SUMMER2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  value={couponForm.discount_type}
                  onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                >
                  <option value="free">Free (100% off)</option>
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                </select>
              </div>

              {couponForm.discount_type !== 'free' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                    placeholder={couponForm.discount_type === 'percentage' ? '10' : '50.00'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {couponForm.discount_type === 'percentage' ? 'Enter percentage (e.g., 10 for 10% off)' : 'Enter amount in Rands'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applicable Book (Optional)
                </label>
                <select
                  value={couponForm.book_id}
                  onChange={(e) => setCouponForm({ ...couponForm, book_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                >
                  <option value="">All Books</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Uses (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={couponForm.max_uses}
                  onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={couponForm.expires_at}
                  onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveCoupon}
                  className="flex-1 bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Create Coupon
                </button>
                <button
                  onClick={() => setShowCouponForm(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
