import { useState, useRef } from 'react';
import { X, Download, Printer } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceData {
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  assessment_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  payment_date?: string;
  due_date: string;
  notes?: string;
  created_at: string;
  items: InvoiceItem[];
}

interface InvoiceProps {
  invoice: InvoiceData;
  onClose: () => void;
  businessInfo?: {
    name: string;
    address: string;
    email: string;
    phone?: string;
  };
}

export function Invoice({ invoice, onClose, businessInfo = {
  name: 'Brainworx',
  address: 'Mossel Bay, South Africa',
  email: 'info@brainworx.co.za'
} }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8">
          <div className="no-print flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-[#0A2A5E]">Invoice {invoice.invoice_number}</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A2A5E] text-white rounded-lg hover:bg-[#3DB3E3] transition-colors"
              >
                <Download size={18} />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div ref={invoiceRef} id="invoice-content" className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#0A2A5E] mb-2">INVOICE</h1>
              <div className="h-1 w-24 bg-[#3DB3E3]"></div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">From</h3>
                <div className="text-gray-800">
                  <p className="font-bold text-lg">{businessInfo.name}</p>
                  <p className="text-sm whitespace-pre-line">{businessInfo.address}</p>
                  <p className="text-sm">{businessInfo.email}</p>
                  {businessInfo.phone && <p className="text-sm">{businessInfo.phone}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                <div className="text-gray-800">
                  <p className="font-bold text-lg">{invoice.customer_name}</p>
                  <p className="text-sm">{invoice.customer_email}</p>
                  {invoice.customer_address && (
                    <p className="text-sm whitespace-pre-line">{invoice.customer_address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                <p className="font-bold text-[#0A2A5E]">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Invoice Date</p>
                <p className="font-semibold">{formatDate(invoice.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Due Date</p>
                <p className="font-semibold">{formatDate(invoice.due_date)}</p>
              </div>
            </div>

            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#0A2A5E]">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-4 px-2 text-gray-800">{item.description}</td>
                      <td className="py-4 px-2 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-4 px-2 text-right text-gray-800">
                        {formatCurrency(item.unit_price, invoice.currency)}
                      </td>
                      <td className="py-4 px-2 text-right font-semibold text-gray-800">
                        {formatCurrency(item.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="flex justify-between py-3 border-t-2 border-[#0A2A5E] text-lg font-bold text-[#0A2A5E]">
                  <span>Total:</span>
                  <span>{formatCurrency(total, invoice.currency)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Payment Status</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
                {invoice.payment_method && (
                  <p className="text-sm text-gray-600 mt-2">
                    Payment Method: {invoice.payment_method}
                  </p>
                )}
                {invoice.payment_date && (
                  <p className="text-sm text-gray-600">
                    Paid on: {formatDate(invoice.payment_date)}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Assessment Type</h3>
                <p className="text-gray-800">{invoice.assessment_type}</p>
              </div>
            </div>

            {invoice.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Thank you for your business!</p>
              <p className="mt-2">For questions about this invoice, please contact {businessInfo.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
