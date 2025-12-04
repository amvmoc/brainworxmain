import { useState, useEffect } from 'react';
import { Book, ShoppingCart, Check, X, Download, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BookType {
  id: string;
  title: string;
  description: string;
  author: string;
  cover_image_url: string | null;
  price: number;
  is_active: boolean;
}

interface Purchase {
  id: string;
  book_id: string;
  customer_email: string;
  download_count: number;
}

interface LibraryProps {
  onClose: () => void;
}

export function Library({ onClose }: LibraryProps) {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [finalPrice, setFinalPrice] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [myPurchases, setMyPurchases] = useState<Purchase[]>([]);
  const [viewMode, setViewMode] = useState<'browse' | 'purchases'>('browse');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBooks(data);
    }
    setLoading(false);
  };

  const loadMyPurchases = async () => {
    if (!customerEmail) return;

    const { data, error } = await supabase
      .from('book_purchases')
      .select('*')
      .eq('customer_email', customerEmail);

    if (!error && data) {
      setMyPurchases(data);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode || !selectedBook) return;

    setCouponError('');
    const { data, error } = await supabase
      .from('book_coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      setCouponError('Invalid coupon code');
      return;
    }

    // Check if coupon is for this specific book or all books
    if (data.book_id && data.book_id !== selectedBook.id) {
      setCouponError('This coupon is not valid for this book');
      return;
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('This coupon has expired');
      return;
    }

    // Check max uses
    if (data.max_uses && data.current_uses >= data.max_uses) {
      setCouponError('This coupon has reached its usage limit');
      return;
    }

    setAppliedCoupon(data);

    // Calculate final price
    let newPrice = selectedBook.price;
    if (data.discount_type === 'free') {
      newPrice = 0;
    } else if (data.discount_type === 'percentage') {
      newPrice = selectedBook.price * (1 - data.discount_value / 100);
    } else if (data.discount_type === 'fixed') {
      newPrice = Math.max(0, selectedBook.price - data.discount_value);
    }

    setFinalPrice(newPrice);
  };

  const handlePurchase = async () => {
    if (!selectedBook || !customerEmail) return;

    setProcessing(true);

    try {
      const franchiseCode = sessionStorage.getItem('franchise_code');

      // Create purchase record
      const { data: purchase, error } = await supabase
        .from('book_purchases')
        .insert({
          book_id: selectedBook.id,
          customer_email: customerEmail,
          customer_name: customerName || null,
          purchase_price: finalPrice,
          coupon_code: appliedCoupon ? couponCode.toUpperCase() : null,
          franchise_code: franchiseCode || null,
          payment_reference: finalPrice > 0 ? 'PAYMENT_PENDING' : 'FREE'
        })
        .select()
        .single();

      if (error) throw error;

      // Update coupon usage if applied
      if (appliedCoupon) {
        await supabase
          .from('book_coupons')
          .update({ current_uses: appliedCoupon.current_uses + 1 })
          .eq('id', appliedCoupon.id);
      }

      setPurchaseId(purchase.id);
      setPurchaseComplete(true);

      // If free, allow immediate download
      if (finalPrice === 0) {
        // Purchase is complete, user can download
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to complete purchase. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (bookId: string, purchaseId: string) => {
    // Update download count
    const { data: purchase } = await supabase
      .from('book_purchases')
      .select('download_count')
      .eq('id', purchaseId)
      .single();

    if (purchase) {
      await supabase
        .from('book_purchases')
        .update({
          download_count: purchase.download_count + 1,
          last_downloaded_at: new Date().toISOString()
        })
        .eq('id', purchaseId);
    }

    // Get book details
    const { data: book } = await supabase
      .from('books')
      .select('pdf_file_path, title')
      .eq('id', bookId)
      .single();

    if (book) {
      // Open PDF in new tab
      window.open(book.pdf_file_path, '_blank');
    }
  };

  const startCheckout = (book: BookType) => {
    setSelectedBook(book);
    setFinalPrice(book.price);
    setShowCheckout(true);
    setPurchaseComplete(false);
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2A5E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Book className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">BrainWorx Library</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setViewMode('browse')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'browse'
                      ? 'bg-white text-[#0A2A5E]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Browse Books
                </button>
                <button
                  onClick={() => {
                    setViewMode('purchases');
                    loadMyPurchases();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'purchases'
                      ? 'bg-white text-[#0A2A5E]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  My Purchases
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {viewMode === 'browse' ? (
                <>
                  {books.length === 0 ? (
                    <div className="text-center py-12">
                      <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No books available yet</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {books.map((book) => (
                        <div
                          key={book.id}
                          className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          {/* Book Cover */}
                          <div className="h-48 bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3] flex items-center justify-center">
                            {book.cover_image_url ? (
                              <img
                                src={book.cover_image_url}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Book className="w-16 h-16 text-white" />
                            )}
                          </div>

                          {/* Book Details */}
                          <div className="p-4">
                            <h3 className="text-xl font-bold text-[#0A2A5E] mb-2">
                              {book.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                            <p className="text-gray-700 mb-4 line-clamp-3">
                              {book.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-[#3DB3E3]">
                                {book.price === 0 ? 'FREE' : `R${book.price.toFixed(2)}`}
                              </span>
                              <button
                                onClick={() => startCheckout(book)}
                                className="bg-[#0A2A5E] text-white px-6 py-2 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium flex items-center gap-2"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                {book.price === 0 ? 'Get' : 'Buy'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* My Purchases View */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your email to view purchases
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                      />
                      <button
                        onClick={loadMyPurchases}
                        className="bg-[#0A2A5E] text-white px-6 py-2 rounded-lg hover:bg-[#3DB3E3] transition-colors font-medium"
                      >
                        Load
                      </button>
                    </div>
                  </div>

                  {myPurchases.length === 0 ? (
                    <div className="text-center py-12">
                      <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No purchases found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myPurchases.map((purchase) => {
                        const book = books.find((b) => b.id === purchase.book_id);
                        if (!book) return null;

                        return (
                          <div
                            key={purchase.id}
                            className="border-2 border-gray-200 rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3] rounded-lg flex items-center justify-center">
                                <Book className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-[#0A2A5E]">
                                  {book.title}
                                </h3>
                                <p className="text-sm text-gray-600">by {book.author}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Downloaded {purchase.download_count} times
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(purchase.book_id, purchase.id)}
                              className="bg-[#3DB3E3] text-white px-6 py-3 rounded-lg hover:bg-[#1FAFA3] transition-colors font-medium flex items-center gap-2"
                            >
                              <Download className="w-5 h-5" />
                              Download
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedBook && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {purchaseComplete ? 'Purchase Complete!' : 'Checkout'}
                </h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {purchaseComplete ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    Thank you for your purchase!
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {finalPrice === 0
                      ? 'You can now download your book.'
                      : 'You will receive a payment confirmation email shortly.'}
                  </p>
                  {finalPrice === 0 && purchaseId && (
                    <button
                      onClick={() => {
                        handleDownload(selectedBook.id, purchaseId);
                        setShowCheckout(false);
                      }}
                      className="bg-[#3DB3E3] text-white px-8 py-3 rounded-lg hover:bg-[#1FAFA3] transition-colors font-medium flex items-center gap-2 mx-auto"
                    >
                      <Download className="w-5 h-5" />
                      Download Now
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Book Info */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="font-bold text-lg text-gray-800 mb-1">
                      {selectedBook.title}
                    </h4>
                    <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none"
                      />
                    </div>

                    {/* Coupon Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coupon Code (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          placeholder="ENTER CODE"
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#3DB3E3] focus:outline-none uppercase"
                          disabled={!!appliedCoupon}
                        />
                        {appliedCoupon ? (
                          <button
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponCode('');
                              setFinalPrice(selectedBook.price);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={applyCoupon}
                            disabled={!couponCode}
                            className="px-4 py-2 bg-[#0A2A5E] text-white rounded-lg hover:bg-[#3DB3E3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Tag className="w-4 h-4" />
                            Apply
                          </button>
                        )}
                      </div>
                      {couponError && (
                        <p className="text-red-500 text-sm mt-1">{couponError}</p>
                      )}
                      {appliedCoupon && (
                        <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Coupon applied successfully!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="font-medium">
                        {selectedBook.price === 0 ? 'FREE' : `R${selectedBook.price.toFixed(2)}`}
                      </span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center mb-2 text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">
                          -R{(selectedBook.price - finalPrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total:</span>
                        <span className="text-2xl font-bold text-[#3DB3E3]">
                          {finalPrice === 0 ? 'FREE' : `R${finalPrice.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={handlePurchase}
                    disabled={!customerEmail || processing}
                    className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {finalPrice === 0 ? 'Get Book' : 'Complete Purchase'}
                      </>
                    )}
                  </button>

                  {finalPrice > 0 && (
                    <p className="text-xs text-gray-500 text-center mt-4">
                      You will be redirected to payment after confirming.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
