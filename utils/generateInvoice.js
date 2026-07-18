/**
 * generateInvoice.js
 * Opens a browser print dialog with a professionally styled invoice.
 * Uses real order data; missing fields are prefixed with "d".
 */

const COMPANY = {
  name: 'Codalina',
  tagline: 'MARKETPLACE',
  branch: 'Codalina Digital Marketplace',
  address: 'House 10/A, Road 3, Dhanmondi, Dhaka, Bangladesh',
  hotline: '01969991122 or 01972999969',
  bin: '003313011-0505',
  email: 'support@codalina.com',
  website: 'www.codalina.com',
};

function d(val, fallback = '') {
  // Returns value if truthy, else "d" + fallback hint
  if (val && String(val).trim() !== '' && String(val).trim() !== ',') return val;
  return fallback ? `d${fallback}` : 'd—';
}

function fmt(price) {
  return new Intl.NumberFormat('en-IN').format(price || 0);
}

function fmtDate(dateStr) {
  if (!dateStr) return 'd—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
}

export function generateInvoice(order) {
  const oid = order.id?.toString() || order._id?.toString() || 'd000000';
  const shortId = oid.slice(-8).toUpperCase();

  let addrObj = {};
  try { addrObj = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}

  const customerName  = d(addrObj.name,    'CustomerName');
  const customerPhone = d(order.phone,     'Phone');
  const customerCity  = d(addrObj.district || addrObj.upazila, 'City');
  const customerAddr  = d(addrObj.details, 'Address');

  const items        = order.items || [];
  const itemsPrice   = items.reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
  const codCharge    = Math.round(itemsPrice * 0.01);
  const subtotal     = itemsPrice + codCharge;
  const status       = order.status || 'Order placed';
  const isPaid       = status === 'Delivered';

  const itemRows = items.map(item => {
    const title    = d(item.product?.title, 'ProductName');
    const variant  = item.variants || 'N/A - 0';
    const price    = item.price_at_purchase || 0;
    const qty      = item.quantity || 1;
    const lineTotal = price * qty;
    return `
      <tr>
        <td class="td-left">${title}</td>
        <td class="td-center">${variant}</td>
        <td class="td-center">${fmt(price)}</td>
        <td class="td-center">${qty}</td>
        <td class="td-right">${fmt(lineTotal)} (1% COD)</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice #${shortId} — ${COMPANY.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #111;
      background: #fff;
      padding: 40px 48px;
      max-width: 820px;
      margin: 0 auto;
    }

    /* ── INVOICE LABEL ── */
    .label-invoice {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 3px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    /* ── TOP ROW ── */
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 22px;
    }

    .brand-name {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -1px;
      color: #111;
      line-height: 1;
    }
    .brand-name sup {
      font-size: 12px;
      font-weight: 700;
      vertical-align: super;
      margin-left: 1px;
      color: #555;
    }

    .invoice-meta {
      text-align: right;
      font-size: 12px;
      color: #333;
      line-height: 1.8;
    }
    .invoice-meta .inv-no {
      font-size: 13px;
      font-weight: 700;
    }

    /* ── ADDRESS BLOCK ── */
    .addr-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: 12px;
      color: #444;
      line-height: 1.9;
      margin-bottom: 18px;
    }
    .addr-row .company-addr {
      max-width: 260px;
    }
    .addr-row .company-addr a { color: #007bff; text-decoration: none; }

    .bill-to-block {
      text-align: right;
    }
    .bill-to-block .bill-to-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 2px;
    }
    .bill-to-block .customer-name {
      font-size: 16px;
      font-weight: 700;
      color: #111;
    }

    /* ── DUE + STATUS BAR ── */
    .due-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 14px 0 10px;
      font-size: 12.5px;
    }
    .due-row .due-amount {
      font-weight: 600;
      color: #111;
    }
    .due-row .due-amount span { color: #d92b2b; font-weight: 700; }

    .status-badge {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 3px 10px;
      border-radius: 3px;
    }
    .status-unpaid  { background: #fdecea; color: #c0392b; }
    .status-paid    { background: #eafaf1; color: #1a7a3c; }
    .status-pending { background: #fef9ec; color: #b7770d; }

    /* ── DIVIDER ── */
    hr { border: none; border-top: 1px solid #e0e0e0; margin: 10px 0; }
    hr.thick { border-top: 2px solid #333; }

    /* ── DISCLAIMER ── */
    .disclaimer {
      font-size: 11px;
      color: #666;
      font-style: italic;
      margin: 10px 0 18px;
      line-height: 1.6;
    }

    /* ── TABLE ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    thead tr {
      border-bottom: 2px solid #333;
    }
    thead th {
      padding: 8px 6px;
      font-weight: 700;
      text-align: center;
      font-size: 12px;
      color: #111;
    }
    thead th:first-child { text-align: left; }
    thead th:last-child  { text-align: right; }

    tbody tr {
      border-bottom: 1px solid #eee;
    }
    tbody tr:last-child { border-bottom: none; }

    td { padding: 9px 6px; vertical-align: top; }
    .td-left   { text-align: left; }
    .td-center { text-align: center; }
    .td-right  { text-align: right; }

    /* ── TOTALS ── */
    .totals-table {
      margin-top: 4px;
    }
    .totals-table td {
      padding: 5px 6px;
      font-size: 12.5px;
    }
    .totals-table .lbl { color: #333; font-weight: 500; }
    .totals-table .val { text-align: right; font-weight: 600; }
    .totals-table .total-row td {
      font-size: 14px;
      font-weight: 700;
      padding-top: 8px;
      border-top: 2px solid #333;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #aaa;
      border-top: 1px solid #eee;
      padding-top: 14px;
    }

    /* ── PRINT BUTTON (screen only) ── */
    .print-btn-wrap {
      text-align: right;
      margin-bottom: 20px;
    }
    .print-btn {
      background: #111;
      color: #fff;
      border: none;
      padding: 8px 22px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 5px;
      cursor: pointer;
      letter-spacing: 0.3px;
    }
    .print-btn:hover { background: #333; }

    @media print {
      .print-btn-wrap { display: none; }
      body { padding: 20px 30px; }
    }
  </style>
</head>
<body>

  <div class="print-btn-wrap">
    <button class="print-btn" onclick="window.print()">⬇ Download / Print PDF</button>
  </div>

  <p class="label-invoice">Invoice</p>

  <!-- TOP ROW -->
  <div class="top-row">
    <div>
      <div class="brand-name">${COMPANY.name.toLowerCase()}<sup>™</sup></div>
    </div>
    <div class="invoice-meta">
      <div class="inv-no">Invoice no: ${shortId}</div>
      <div>Date: ${fmtDate(order.createdAt)}</div>
    </div>
  </div>

  <!-- ADDRESS + BILL TO -->
  <div class="addr-row">
    <div class="company-addr">
      <div>${COMPANY.branch}, Shop</div>
      <div>${COMPANY.address}</div>
      <div>Hotline: ${COMPANY.hotline}</div>
      <div>BIN NO - ${COMPANY.bin}</div>
    </div>
    <div class="bill-to-block">
      <div class="bill-to-label">Bill to</div>
      <div class="customer-name">${customerName}</div>
      <div>${customerPhone}</div>
      <div>${customerCity}</div>
      <div>${customerAddr}, Bangladesh</div>
    </div>
  </div>

  <hr />

  <!-- DUE AMOUNT + STATUS -->
  <div class="due-row">
    <div class="due-amount">Due Amount: <span>${fmt(subtotal)}</span></div>
    <span class="status-badge ${isPaid ? 'status-paid' : status === 'Cancelled' ? 'status-unpaid' : 'status-pending'}">
      Status: ${isPaid ? 'Paid' : status === 'Cancelled' ? 'Cancelled' : 'Unpaid'}
    </span>
  </div>

  <hr />

  <!-- PRODUCT TABLE -->
  <table>
    <thead>
      <tr>
        <th style="width:38%">Product</th>
        <th style="width:20%">Accessory</th>
        <th style="width:13%">Unit Price</th>
        <th style="width:10%">Quantity</th>
        <th style="width:19%">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr>
        <td class="td-left" colspan="4" style="color:#555;font-weight:500">Shipping</td>
        <td class="td-right" style="font-weight:600">0</td>
      </tr>
    </tbody>
  </table>

  <hr />

  <!-- TOTALS -->
  <table class="totals-table">
    <tbody>
      <tr>
        <td class="lbl" style="width:80%">Discount Total</td>
        <td class="val">—</td>
      </tr>
      <tr>
        <td class="lbl">Subtotal</td>
        <td class="val">${fmt(itemsPrice)}</td>
      </tr>
      <tr>
        <td class="lbl">1% COD Charge</td>
        <td class="val">${fmt(codCharge)}</td>
      </tr>
      <tr class="total-row">
        <td class="lbl">Total</td>
        <td class="val">${fmt(subtotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Thank you for shopping with ${COMPANY.name} · ${COMPANY.website} · ${COMPANY.email}
  </div>

</body>
</html>`;

  const win = window.open('', `Invoice_${shortId}`, 'width=900,height=700,scrollbars=yes,resizable=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
