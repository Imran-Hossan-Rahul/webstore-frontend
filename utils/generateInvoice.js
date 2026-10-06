/**
 * generateInvoice.js
 * Generates an exact Apple Store style Invoice Receipt with real order data.
 */

const COMPANY = {
  name: 'Codalina Store',
  tagline: 'Codalina Digital Marketplace',
  address: 'House 10/A, Road 3, Dhanmondi, Dhaka, Bangladesh',
  hotline: '01951768360',
  bin: '003313011-0505',
  email: 'support@codalina.com',
  website: 'www.codalina.com',
};

function d(val, fallback = '') {
  if (val && String(val).trim() !== '' && String(val).trim() !== ',') return val;
  return fallback ? fallback : '—';
}

function fmt(price) {
  return new Intl.NumberFormat('en-IN').format(price || 0);
}

function fmtDateApple(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

export function generateInvoice(order) {
  const oid = order.id?.toString() || order._id?.toString() || '00000000';
  const shortId = oid.slice(-8).toUpperCase();
  const formattedDate = fmtDateApple(order.createdAt);

  let addrObj = {};
  try { addrObj = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}

  const customerName  = d(order.customer_name || order.name || addrObj.name, 'Customer Name');
  const customerPhone = d(order.phone,     'Phone');
  const customerCity  = d(addrObj.district || addrObj.upazila, '');
  const customerAddr  = d(addrObj.details, '');

  const customerEmail = d(addrObj.email || order.email, 'Email');

  const items        = order.items || [];
  const itemsPrice   = items.reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
  const processingFee = 0;
  const subtotal     = itemsPrice + processingFee;
  const status       = order.status || 'Order placed';
  const isPaid       = order.payment_status === 'Verified' || status === 'Delivered' || status === 'Active';
  const amountDue    = isPaid ? '0.00' : `${fmt(subtotal)}`;
  
  const paymentMethod = d(order.payment_type || order.payment_method, 'Online Payment');
  const trxId = d(order.payment_trx_id || addrObj.payment_trx_id, 'N/A');

  const itemRows = items.map(item => {
    const title    = d(item.product?.title, item.product_name || 'Service Project');
    const prodDetails = item.variants || (item.product_id ? item.product_id.toString().slice(-8).toUpperCase() : 'SKU-N/A');
    const licenseText = isPaid ? (item.license_key ? item.license_key : 'Authorized & Granted') : 'Will be available after payment verification';
    const price    = item.price_at_purchase || 0;
    const qty      = item.quantity || 1;
    const lineTotal = price * qty;
    return `
      <tr>
        <td class="td-left font-medium">${title}</td>
        <td class="td-left text-muted">${prodDetails}<br/><span style="font-size: 9.5px; font-family: monospace; color: ${isPaid ? '#0071e3' : '#f5a623'};">Access: ${licenseText}</span></td>
        <td class="td-right">${fmt(price)} BDT</td>
        <td class="td-center">${qty}</td>
        <td class="td-right font-bold">${fmt(lineTotal)} BDT</td>
      </tr>`;
  }).join('');

  // Generate Tracking & Phases HTML
  const phases = ['Discovery', 'Design', 'Development', 'Testing', 'Launch'];
  const hasPhases = order.projectPhase && phases.includes(order.projectPhase);
  let phaseHtml = '';

  if (hasPhases || (order.status && order.status !== 'Pending Verification')) {
    const currentPhaseIndex = phases.indexOf(order.projectPhase);
    const isDelivered = order.status === 'Delivered' || order.status === 'Active';
    const isHalted = order.status === 'Suspended' || order.status === 'Cancelled' || order.status === 'Payment Failed';
    
    let phaseRows = phases.map((phase, idx) => {
      let phaseStatus = 'Pending';
      let color = '#6e6e73';
      let icon = '○';
      let trackingText = 'Awaiting';

      if (idx < currentPhaseIndex) {
        phaseStatus = 'Completed';
        color = '#10B981';
        icon = '✓';
        trackingText = 'Done';
      } else if (idx === currentPhaseIndex) {
        if (isHalted) {
          phaseStatus = 'Suspended';
          color = '#F59E0B';
          icon = '⊗';
          trackingText = 'Halted';
        } else if (isDelivered) {
          phaseStatus = 'Delivered';
          color = '#10B981';
          icon = '✓';
          trackingText = 'Delivered Here';
        } else {
          phaseStatus = 'In Progress';
          color = '#0071e3';
          icon = '◐';
          trackingText = 'Current Phase';
        }
      } else if (idx > currentPhaseIndex) {
        if (isHalted) {
          phaseStatus = 'Aborted';
          color = '#ef4444';
          icon = '×';
          trackingText = 'Cancelled';
        } else if (isDelivered) {
          phaseStatus = 'Skipped';
          color = '#d1d5db';
          icon = '—';
          trackingText = 'Not Needed';
        }
      }

      return `
        <tr>
          <td style="font-weight: 500; color: #1d1d1f;"><span style="color: ${color}; margin-right: 6px; font-size: 14px;">${icon}</span> ${phase}</td>
          <td style="color: ${color}; font-weight: 500;">${phaseStatus}</td>
          <td style="color: #6e6e73;">${trackingText}</td>
        </tr>
      `;
    }).join('');

    let tableHtml = '';
    if (hasPhases) {
      tableHtml = `
        <table class="info-table" style="margin-top: 16px;">
          <thead>
            <tr>
              <th style="width: 40%;">Project Phase</th>
              <th style="width: 30%;">Status</th>
              <th style="width: 30%;">Tracking</th>
            </tr>
          </thead>
          <tbody>
            ${phaseRows}
          </tbody>
        </table>
      `;
    }

    let statusColor = '#0071e3';
    if (isDelivered) statusColor = '#10B981';
    if (order.status === 'Suspended') statusColor = '#F59E0B';
    if (order.status === 'Cancelled' || order.status === 'Payment Failed') statusColor = '#EF4444';

    let phaseColor = '#0071e3';
    let phaseLabel = 'Active Phase';
    if (isHalted) {
       phaseColor = '#F59E0B';
       phaseLabel = 'Halted At Phase';
    } else if (isDelivered) {
       phaseColor = '#10B981';
       phaseLabel = 'Delivered At Phase';
    }

    phaseHtml = `
      <div class="divider"></div>
      <div class="section-header">Project Tracking & Status</div>
      <div style="display: flex; gap: 40px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 10px; color: #6e6e73; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Current Order Status</div>
          <div style="font-size: 13px; font-weight: 700; color: ${statusColor}; text-transform: uppercase;">${order.status}</div>
        </div>
        ${hasPhases ? `
        <div>
          <div style="font-size: 10px; color: #6e6e73; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${phaseLabel}</div>
          <div style="font-size: 13px; font-weight: 700; color: ${phaseColor}; text-transform: uppercase;">${order.projectPhase}</div>
        </div>
        ` : ''}
      </div>
      ${tableHtml}
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Receipt — ${shortId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #1d1d1f;
      background: #ffffff;
      padding: 32px 48px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.4;
    }

    /* Print Controls */
    .print-btn-wrap {
      text-align: right;
      margin-bottom: 24px;
    }
    .print-btn {
      background: #0071e3;
      color: #ffffff;
      border: none;
      padding: 8px 20px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 980px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .print-btn:hover { background: #0077ed; }

    /* Header Section */
    .header-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
    }
    .header-logo svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }

    .invoice-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .invoice-receipt-title {
      font-size: 20px;
      font-weight: 700;
      color: #1d1d1f;
      margin-bottom: 2px;
    }

    .invoice-status-subtitle {
      font-size: 12px;
      color: #6e6e73;
    }

    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #1d1d1f;
      line-height: 1.5;
    }
    .meta-box .meta-label {
      font-weight: 600;
      color: #1d1d1f;
    }

    /* Sold To / Ship To Grid */
    .address-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 28px;
      font-size: 11px;
      line-height: 1.5;
      color: #333336;
    }

    .address-title {
      font-weight: 700;
      font-size: 12px;
      color: #1d1d1f;
      margin-bottom: 4px;
    }

    /* Section Headers */
    .section-header {
      font-size: 13px;
      font-weight: 700;
      color: #1d1d1f;
      margin-top: 24px;
      margin-bottom: 12px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 16px;
    }

    thead th {
      font-size: 10px;
      font-weight: 600;
      color: #6e6e73;
      border-bottom: 1px solid #d2d2d7;
      padding: 6px 4px;
      text-align: left;
      white-space: nowrap;
    }

    tbody td {
      padding: 8px 4px;
      border-bottom: 1px solid #e5e5ea;
      vertical-align: top;
    }

    .td-left { text-align: left; }
    .td-center { text-align: center; }
    .td-right { text-align: right; }

    .font-medium { font-weight: 500; }
    .font-bold { font-weight: 600; }
    .text-muted { color: #6e6e73; }

    /* Summary Totals */
    .totals-block {
      width: 240px;
      margin-left: auto;
      margin-top: 12px;
      font-size: 11px;
      line-height: 1.8;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      color: #1d1d1f;
    }
    .totals-row.bold {
      font-weight: 700;
    }

    /* Horizontal Divider */
    .divider {
      border: none;
      border-top: 1px solid #d2d2d7;
      margin: 24px 0 16px 0;
    }

    /* Additional Info Table */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-top: 8px;
    }
    .info-table th {
      font-size: 9.5px;
      color: #6e6e73;
      font-weight: 600;
      border-bottom: 1px solid #d2d2d7;
      padding: 4px 0;
      text-align: left;
    }
    .info-table td {
      padding: 6px 0;
      border-bottom: none;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #1d1d1f;
      line-height: 1.6;
    }
    .footer a {
      color: #1d1d1f;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }

    @media print {
      @page { margin: 0; } /* Hides browser headers (date, URL, page numbers) */
      .print-btn-wrap { display: none; }
      body { 
        padding: 48px; /* Adds space inside the printed page */
        max-width: 100%; 
        background-color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <div class="print-btn-wrap">
    <button class="print-btn" onclick="window.print()">Download / Print PDF</button>
  </div>

  <!-- Apple Store Logo Header -->
  <div class="header-logo">
    <img src="/logo.png" alt="Codalina Logo" style="width: 22px; height: 22px; object-fit: contain;" />
    <span>Codalina</span>
  </div>

  <!-- Invoice Title & Order Meta Header -->
  <div class="invoice-title-row">
    <div>
      <div class="invoice-receipt-title">Order Receipt</div>
      <div class="invoice-status-subtitle">${isPaid ? 'Payment Received & Access Granted' : 'Pending Payment'}</div>
    </div>
    <div class="meta-box">
      <div><span class="meta-label">Order Number:</span></div>
      <div>WA${shortId}</div>
      <div style="margin-top: 4px;"><span class="meta-label">Order Date:</span></div>
      <div>${formattedDate}</div>
    </div>
  </div>

  <!-- Billed To / Digital Delivery To -->
  <div class="address-grid">
    <div>
      <div class="address-title">Billed To:</div>
      <div>${customerName}</div>
      ${customerAddr !== '—' && customerAddr !== '' ? `<div>${customerAddr}</div>` : ''}
      ${customerCity !== '—' && customerCity !== '' ? `<div>${customerCity}</div>` : ''}
      <div style="margin-top: 4px;">Phone: ${customerPhone}</div>
    </div>
    <div>
      <div class="address-title">Digital Delivery To:</div>
      <div>${customerName}</div>
      <div>Email: ${customerEmail}</div>
    </div>
  </div>

  <!-- Order Details -->
  <div class="section-header">Order Details</div>
  <table>
    <thead>
      <tr>
        <th style="width:40%">Product Name</th>
        <th style="width:25%">License / Variant Details</th>
        <th style="width:15%; text-align:right;">Unit Price</th>
        <th style="width:10%; text-align:center;">Qty</th>
        <th style="width:10%; text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Subtotal Summary -->
  <div class="totals-block">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>${fmt(itemsPrice)} BDT</span>
    </div>
    <div class="totals-row">
      <span>Processing Fee:</span>
      <span>${fmt(processingFee)} BDT</span>
    </div>
    <div class="totals-row bold" style="margin-top: 2px;">
      <span>Total:</span>
      <span>${fmt(subtotal)} BDT</span>
    </div>
    <div class="totals-row bold">
      <span>Amount Due:</span>
      <span>${amountDue} ${amountDue === '0.00' ? 'BDT' : 'BDT'}</span>
    </div>
  </div>

  <!-- Payment Methods Section -->
  <div class="divider"></div>
  <div class="section-header">Payment Methods</div>
  <div style="font-size: 11px; color: #1d1d1f; margin-bottom: 24px;">
    ${fmt(subtotal)} BDT paid via ${paymentMethod}
    <br />
    <span style="font-size: 10px; color: #6e6e73;">Transaction ID: ${trxId}</span>
  </div>

  ${phaseHtml}

  <!-- Additional Information Section -->
  <div class="divider"></div>
  <div class="section-header">Additional Information</div>
  <table class="info-table">
    <thead>
      <tr>
        <th style="width: 25%;">Receipt Number</th>
        <th style="width: 25%;">Order Date</th>
        <th style="width: 25%;">Payment Method</th>
        <th style="width: 25%;">Receipt Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>WA${shortId}</td>
        <td>${formattedDate}</td>
        <td style="text-transform: capitalize;">${paymentMethod.replace('_', ' ')}</td>
        <td style="font-weight: ${isPaid ? 'normal' : '600'}; color: ${isPaid ? '#1d1d1f' : '#f59e0b'};">${isPaid ? 'Paid & Verified' : 'Pending Payment'}</td>
      </tr>
    </tbody>
  </table>

  <!-- Footer Notice -->
  <div class="footer">
    This order is subject to Codalina's Sales and Refunds Policies.<br />
    <a href="https://${COMPANY.website}" target="_blank">http://${COMPANY.website}/SalesAndRefunds</a>
  </div>

</body>
</html>`;

  const win = window.open('', `Invoice_${shortId}`, 'width=900,height=700,scrollbars=yes,resizable=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
