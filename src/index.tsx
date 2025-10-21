import { renderToString } from 'react-dom/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateProfessionalQuotePDF } from './pdf-generator';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Receipts from './pages/Receipts';
import Quotes from './pages/Quotes';
import Transactions from './pages/Transactions';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Companies from './pages/Companies';
import NewClient from './pages/NewClient';
import NewProject from './pages/NewProject';
import NewCompany from './pages/NewCompany';
import EditCompany from './pages/EditCompany';
import NewTransaction from './pages/NewTransaction';
import NewInvoice from './pages/NewInvoice';
import EditInvoice from './pages/EditInvoice';
import ViewReceipt from './pages/ViewReceipt';
import EditReceipt from './pages/EditReceipt';
import EditTransaction from './pages/EditTransaction';
import NewQuote from './pages/NewQuote';
import EditQuote from './pages/EditQuote';
import ViewQuote from './pages/ViewQuote';
import Profile from './pages/Profile';
import Login from './pages/Login';
import './index.css'; // Import CSS for bundling
// Auth utilities
async function pbkdf2Hash(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, key, 256);
  const bytes = new Uint8Array(bits);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function parseCookie(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  header.split(';').forEach(part => {
    const [k, ...rest] = part.trim().split('=');
    if (!k) return;
    out[k] = rest.join('=');
  });
  return out;
}

const renderPage = (component: React.ReactElement, theme: string, path?: string) => {
  const html = `
<!DOCTYPE html>
<html lang="en" class="${theme === 'dark' ? 'dark' : ''}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accounting Platform</title>
  <link rel="stylesheet" href="/styles.css">
  <script>
    // Apply theme immediately to prevent flash
    if (document.documentElement.className.includes('dark')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Global handlers for quote builder buttons
    let lineItemCounter = 0;
    let milestoneCounter = 0;
    
    window.addLineItemHandler = function() {
      const container = document.querySelector('.line-items-container');
      if (!container) return;
      
      const itemHtml = \`
        <div class="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 transition-colors line-item-\${lineItemCounter}">
          <div class="flex justify-between items-start mb-4">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300">Item \${lineItemCounter + 1}</h4>
            <button type="button" onclick="removeLineItem(\${lineItemCounter})" class="px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Remove</button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Item Name *</label>
              <input type="text" name="item_\${lineItemCounter}" placeholder="What is this item?" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
              <textarea name="description_\${lineItemCounter}" placeholder="Describe this item..." rows="2" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md"></textarea>
            </div>
            <div class="grid grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                <input type="text" name="category_\${lineItemCounter}" placeholder="Category" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity *</label>
                <input type="number" name="quantity_\${lineItemCounter}" value="1" min="0" step="0.01" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md" onchange="updateLineItemTotal(\${lineItemCounter})">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Rate (KSH) *</label>
                <input type="number" name="rate_\${lineItemCounter}" value="0" min="0" step="0.01" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md" onchange="updateLineItemTotal(\${lineItemCounter})">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Total</label>
                <div class="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border-2 border-gray-200 dark:border-gray-700 font-semibold" id="total-\${lineItemCounter}">KSH 0.00</div>
              </div>
            </div>
            <input type="hidden" name="unit_\${lineItemCounter}" value="item">
          </div>
        </div>
      \`;
      
      container.insertAdjacentHTML('beforeend', itemHtml);
      lineItemCounter++;
    };
    
    window.addMilestoneHandler = function() {
      const container = document.querySelector('.milestones-container');
      if (!container) return;
      
      const milestoneHtml = \`
        <div class="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 transition-colors milestone-\${milestoneCounter}">
          <div class="flex justify-between items-start mb-4">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300">Milestone \${milestoneCounter + 1}</h4>
            <button type="button" onclick="removeMilestone(\${milestoneCounter})" class="px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Remove</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Milestone Name</label>
              <input type="text" name="milestone_\${milestoneCounter}" placeholder="e.g., Initial Deposit" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Percentage of Total</label>
              <input type="number" name="percentage_\${milestoneCounter}" value="0" min="0" max="100" step="0.01" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Due Date</label>
              <input type="date" name="due_date_\${milestoneCounter}" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
              <input type="text" name="payment_description_\${milestoneCounter}" placeholder="Optional description" class="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md">
            </div>
          </div>
        </div>
      \`;
      
      container.insertAdjacentHTML('beforeend', milestoneHtml);
      milestoneCounter++;
    };
    
    window.removeLineItem = function(index) {
      const item = document.querySelector(\`.line-item-\${index}\`);
      if (item) item.remove();
    };
    
    window.removeMilestone = function(index) {
      const milestone = document.querySelector(\`.milestone-\${index}\`);
      if (milestone) milestone.remove();
    };
    
    window.updateLineItemTotal = function(index) {
      const quantityInput = document.querySelector(\`input[name="quantity_\${index}"]\`);
      const rateInput = document.querySelector(\`input[name="rate_\${index}"]\`);
      const totalDiv = document.getElementById(\`total-\${index}\`);
      
      if (quantityInput && rateInput && totalDiv) {
        const quantity = parseFloat(quantityInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const total = quantity * rate;
        totalDiv.textContent = \`KSH \${total.toLocaleString('en', { minimumFractionDigits: 2 })}\`;
      }
    };
  </script>
</head>
<body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <div id="root">${renderToString(component)}</div>
</body>
</html>
  `;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
};

	export default {
		async fetch(request, env, ctx) {
		// Run migrations
		try {
			// Auth-related migrations
			await env.DB.exec(`CREATE TABLE IF NOT EXISTS sessions (
			  token TEXT PRIMARY KEY,
			  user_id INTEGER NOT NULL,
			  expires_at TEXT NOT NULL
			)`);
			await env.DB.exec(`ALTER TABLE users ADD COLUMN salt TEXT`).catch(() => {});
			// Ensure admin user id=1 exists and is updated
			const admin = await env.DB.prepare('SELECT id, email FROM users WHERE id = 1').first();
			if (!admin) {
			  const salt = generateSalt();
			  const pwd = env.ADMIN_DEFAULT_PASSWORD || 'admin123';
			  const hash = await pbkdf2Hash(pwd, salt);
			  await env.DB.prepare('INSERT INTO users (id, email, password_hash, name, salt) VALUES (1, ?, ?, ?, ?)')
			    .bind('admin@bogingo.com', hash, 'Admin', salt).run();
			} else if (admin.email !== 'admin@bogingo.com') {
			  await env.DB.prepare('UPDATE users SET email = ? WHERE id = 1').bind('admin@bogingo.com').run();
			}
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN company_id INTEGER;
			`).catch(() => {}); // Ignore if column exists
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN client_id INTEGER;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN project_id INTEGER;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN title TEXT;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN introduction TEXT;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN scope_summary TEXT;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN deliverables TEXT;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN items TEXT;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN payment_terms TEXT;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN validity_period INTEGER;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN conclusion TEXT;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN notes TEXT;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE quotes ADD COLUMN amount REAL;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE invoices ADD COLUMN company_id INTEGER;
			`).catch(() => {});
			await env.DB.exec(`
				ALTER TABLE receipts ADD COLUMN company_id INTEGER;
			`).catch(() => {});
		} catch (error) {
			console.log('Migration error:', error);
		}

		const url = new URL(request.url);
		const cookies = parseCookie(request.headers.get('Cookie'));
		const theme = cookies['theme'] === 'light' ? 'light' : 'dark';
		let currentUser: any = null;
		if (cookies['session']) {
			const session = await env.DB.prepare('SELECT s.user_id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?')
			  .bind(cookies['session'], new Date().toISOString()).first();
			if (session) currentUser = session;
		}

		if (url.pathname === '/message') {
			return new Response('Hello, World!');
		}

		if (url.pathname === '/random') {
			const uuid = crypto.randomUUID();
			return new Response(uuid);
		}

		if (url.pathname.startsWith('/logos/')) {
			const key = url.pathname.slice(7);
			console.log('Serving logo for key:', key);
			const object = await env.BUCKET.get(key);
			if (object === null) {
				console.log('Logo not found for key:', key);
				return new Response('Not Found', { status: 404 });
			}
			console.log('Logo found, content type:', object.httpMetadata?.contentType);
			return new Response(object.body, {
				headers: {
					'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
				},
			});
		}

		if (url.pathname.match(/^\/invoices\/(\d+)\/pdf$/)) {
			const id = RegExp.$1;
			try {
				const invoice = await env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first();
				if (!invoice) {
					return new Response('Invoice not found', { status: 404 });
				}
				const company = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(invoice.company_id).first();
				const client = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(invoice.client_id).first();
				let project = null;
				if (invoice.project_id) {
					project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(invoice.project_id).first();
				}
				const items = JSON.parse(invoice.items || '[]');

				const pdfDoc = await PDFDocument.create();
				const font = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
				const boldFont = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
				const page = pdfDoc.addPage();
				const { width, height } = page.getSize();

				let y = height - 50;

				// Blue header bar
				page.drawRectangle({
					x: 0,
					y: height - 60,
					width: width,
					height: 60,
					color: rgb(0.2, 0.4, 0.8), // Blue
				});
				// Title centered on blue bar
				const titleWidth = font.widthOfTextAtSize('INVOICE', 30);
				page.drawText('INVOICE', { x: (width - titleWidth) / 2, y: height - 35, size: 30, font: boldFont, color: rgb(1, 1, 1) });
				y = height - 80;

				// Invoice ID and Due Date
				page.drawText(`Invoice #${invoice.id}`, { x: 50, y, size: 14, color: rgb(0, 0, 0) });
				const dueDateText = `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`;
				const dueDateWidth = font.widthOfTextAtSize(dueDateText, 12);
				page.drawText(dueDateText, { x: width - 50 - dueDateWidth, y, size: 12, color: rgb(0.5, 0.5, 0.5) });
				y -= 30;

				// Company Info (left)
				let leftY = y;
				if (company) {
					page.drawText('From:', { x: 50, y: leftY, size: 12, color: rgb(0.2, 0.4, 0.8) });
					leftY -= 15;
					page.drawText(company.name, { x: 50, y: leftY, size: 14, color: rgb(0, 0, 0) });
					leftY -= 15;
					if (company.email) {
						page.drawText(company.email, { x: 50, y: leftY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						leftY -= 12;
					}
					if (company.phone) {
						page.drawText(company.phone, { x: 50, y: leftY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						leftY -= 12;
					}
					if (company.address) {
						page.drawText(company.address, { x: 50, y: leftY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						leftY -= 12;
					}
				}

				// Client Info (right)
				let rightY = y;
				if (client) {
					page.drawText('Bill To:', { x: 300, y: rightY, size: 12, color: rgb(0.2, 0.4, 0.8) });
					rightY -= 15;
					page.drawText(client.name, { x: 300, y: rightY, size: 14, color: rgb(0, 0, 0) });
					rightY -= 15;
					if (client.email) {
						page.drawText(client.email, { x: 300, y: rightY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						rightY -= 12;
					}
					if (client.phone) {
						page.drawText(client.phone, { x: 300, y: rightY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						rightY -= 12;
					}
					if (client.address) {
						page.drawText(client.address, { x: 300, y: rightY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						rightY -= 12;
					}
				}

				y = Math.min(leftY, rightY) - 20;

				// Project Info
				if (project) {
					page.drawText(`Project: ${project.name}`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });
					y -= 20;
				}

				// Items Table
				page.drawText('Items:', { x: 50, y, size: 14, color: rgb(0.2, 0.4, 0.8) });
				y -= 25;

				// Table Header
				const col1 = 50; // Description
				const col2 = 250; // Qty
				const col3 = 320; // Rate
				const col4 = 400; // Amount

				page.drawText('Description', { x: col1, y, size: 10, color: rgb(0, 0, 0) });
				page.drawText('Qty', { x: col2, y, size: 10, color: rgb(0, 0, 0) });
				page.drawText('Rate', { x: col3, y, size: 10, color: rgb(0, 0, 0) });
				page.drawText('Amount', { x: col4, y, size: 10, color: rgb(0, 0, 0) });
				y -= 10;
				page.drawLine({ start: { x: 50, y }, end: { x: 500, y }, thickness: 1, color: rgb(0, 0, 0) });
				y -= 15;

				// Items
				items.forEach((item: any) => {
					page.drawText(item.description.substring(0, 30), { x: col1, y, size: 10, color: rgb(0, 0, 0) });
					page.drawText(item.quantity.toString(), { x: col2, y, size: 10, color: rgb(0, 0, 0) });
					page.drawText(`KSH ${item.rate.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { x: col3, y, size: 10, color: rgb(0, 0, 0) });
					page.drawText(`KSH ${item.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { x: col4, y, size: 10, color: rgb(0, 0, 0) });
					y -= 15;
				});

				// Total
				y -= 10;
				page.drawLine({ start: { x: col3, y }, end: { x: 500, y }, thickness: 1, color: rgb(0, 0, 0) });
				y -= 15;
				page.drawText('Total:', { x: col3, y, size: 12, font: boldFont, color: rgb(0.2, 0.4, 0.8) });
				page.drawText(`KSH ${invoice.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { x: col4, y, size: 12, font: boldFont, color: rgb(0.2, 0.4, 0.8) });

				// Payment Details
				if (invoice.bank_name || invoice.account_name || invoice.account_number) {
					y -= 30;
					page.drawText('Payment Details:', { x: 50, y, size: 12, color: rgb(0.2, 0.4, 0.8) });
					y -= 15;
					if (invoice.bank_name) {
						page.drawText(`Bank: ${invoice.bank_name}`, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
						y -= 12;
					}
					if (invoice.account_name) {
						page.drawText(`Account Name: ${invoice.account_name}`, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
						y -= 12;
					}
					if (invoice.account_number) {
						page.drawText(`Account Number: ${invoice.account_number}`, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
						y -= 12;
					}
					if (invoice.swift_code) {
						page.drawText(`SWIFT/BIC: ${invoice.swift_code}`, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
						y -= 12;
					}
					if (invoice.payment_instructions) {
						y -= 8;
						page.drawText('Payment Instructions:', { x: 50, y, size: 10, color: rgb(0.2, 0.4, 0.8) });
						y -= 12;
						const instructions = invoice.payment_instructions.split('\n');
						instructions.forEach((line: string) => {
							page.drawText(line, { x: 50, y, size: 9, color: rgb(0.3, 0.3, 0.3) });
							y -= 10;
						});
					}
					y -= 8;
				}

				// Status
				y -= 30;
				page.drawText(`Status: ${invoice.status || 'draft'}`, { x: 50, y, size: 10, color: rgb(0.5, 0.5, 0.5) });

				// Generated at
				const generatedAt = new Date().toLocaleString();
				page.drawText(`Generated at: ${generatedAt}`, { x: 50, y: 50, size: 8, color: rgb(0.5, 0.5, 0.5) });

				const clientName = client ? client.name.replace(/ /g, '_') : 'Unknown';
				const filename = `${clientName}_Invoice_#${id}.pdf`;
				const pdfBytes = await pdfDoc.save();
				return new Response(pdfBytes, {
					headers: {
						'Content-Type': 'application/pdf',
						'Content-Disposition': `attachment; filename="${filename}"`,
					},
				});
			} catch (error) {
				console.log('Error generating PDF:', error);
				return new Response('Error generating PDF: ' + error.message, { status: 500 });
			}
		}

		if (url.pathname.match(/^\/receipts\/(\d+)\/pdf$/)) {
			const id = RegExp.$1;
			try {
				const receipt = await env.DB.prepare('SELECT * FROM receipts WHERE id = ?').bind(id).first();
				if (!receipt) {
					return new Response('Receipt not found', { status: 404 });
				}
				const company = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(receipt.company_id).first();
				const client = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(receipt.client_id).first();
				let project = null;
				if (receipt.project_id) {
					project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(receipt.project_id).first();
				}
				const items = JSON.parse(receipt.items || '[]');

				const pdfDoc = await PDFDocument.create();
				const font = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
				const boldFont = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
				const page = pdfDoc.addPage();
				const { width, height } = page.getSize();

				let y = height - 50;

				// Blue header bar
				page.drawRectangle({
					x: 0,
					y: height - 60,
					width: width,
					height: 60,
					color: rgb(0.2, 0.6, 1), // Blue
				});
				// Title centered on blue bar
				const titleWidth = font.widthOfTextAtSize('RECEIPT', 30);
				page.drawText('RECEIPT', { x: (width - titleWidth) / 2, y: height - 35, size: 30, font: boldFont, color: rgb(1, 1, 1) });
				y = height - 80;

				// Receipt ID and Date
				page.drawText(`Receipt #${receipt.id}`, { x: 50, y, size: 14, color: rgb(0, 0, 0) });
				const dateText = `Date: ${new Date(receipt.date).toLocaleDateString()}`;
				const dateWidth = font.widthOfTextAtSize(dateText, 12);
				page.drawText(dateText, { x: width - 50 - dateWidth, y, size: 12, color: rgb(0.5, 0.5, 0.5) });
				y -= 30;

				// Company Info (left)
				let leftY = y;
				if (company) {
					page.drawText('From:', { x: 50, y: leftY, size: 12, color: rgb(0.2, 0.6, 1) });
					leftY -= 15;
					page.drawText(company.name, { x: 50, y: leftY, size: 14, color: rgb(0, 0, 0) });
					leftY -= 15;
					if (company.email) {
						page.drawText(company.email, { x: 50, y: leftY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						leftY -= 12;
					}
					if (company.phone) {
						page.drawText(company.phone, { x: 50, y: leftY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						leftY -= 12;
					}
					if (company.address) {
						page.drawText(company.address, { x: 50, y: leftY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						leftY -= 12;
					}
				}

				// Client Info (right)
				let rightY = y;
				if (client) {
					page.drawText('To:', { x: 300, y: rightY, size: 12, color: rgb(0.2, 0.6, 1) });
					rightY -= 15;
					page.drawText(client.name, { x: 300, y: rightY, size: 14, color: rgb(0, 0, 0) });
					rightY -= 15;
					if (client.email) {
						page.drawText(client.email, { x: 300, y: rightY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						rightY -= 12;
					}
					if (client.phone) {
						page.drawText(client.phone, { x: 300, y: rightY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						rightY -= 12;
					}
					if (client.address) {
						page.drawText(client.address, { x: 300, y: rightY, size: 10, color: rgb(0.5, 0.5, 0.5) });
						rightY -= 12;
					}
				}

				y = Math.min(leftY, rightY) - 20;

				// Project Info
				if (project) {
					page.drawText(`Project: ${project.name}`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });
					y -= 20;
				}

				// Items Table
				page.drawText('Items:', { x: 50, y, size: 14, color: rgb(0.2, 0.6, 1) });
				y -= 25;

				// Table Header
				const col1 = 50; // Description
				const col2 = 250; // Qty
				const col3 = 320; // Rate
				const col4 = 400; // Amount

				page.drawText('Description', { x: col1, y, size: 10, color: rgb(0, 0, 0) });
				page.drawText('Qty', { x: col2, y, size: 10, color: rgb(0, 0, 0) });
				page.drawText('Rate', { x: col3, y, size: 10, color: rgb(0, 0, 0) });
				page.drawText('Amount', { x: col4, y, size: 10, color: rgb(0, 0, 0) });
				y -= 10;
				page.drawLine({ start: { x: 50, y }, end: { x: 500, y }, thickness: 1, color: rgb(0, 0, 0) });
				y -= 15;

				// Items
				items.forEach((item: any) => {
					page.drawText(item.description.substring(0, 30), { x: col1, y, size: 10, color: rgb(0, 0, 0) });
					page.drawText(item.quantity.toString(), { x: col2, y, size: 10, color: rgb(0, 0, 0) });
					page.drawText(`KSH ${item.rate.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { x: col3, y, size: 10, color: rgb(0, 0, 0) });
					page.drawText(`KSH ${item.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { x: col4, y, size: 10, color: rgb(0, 0, 0) });
					y -= 15;
				});

				// Total
				y -= 10;
				page.drawLine({ start: { x: col3, y }, end: { x: 500, y }, thickness: 1, color: rgb(0, 0, 0) });
				y -= 15;
				page.drawText('Total:', { x: col3, y, size: 12, font: boldFont, color: rgb(0.2, 0.6, 1) });
				page.drawText(`KSH ${receipt.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { x: col4, y, size: 12, font: boldFont, color: rgb(0.2, 0.6, 1) });

				// Payment Details
				if (receipt.payment_method || receipt.reference_number) {
					y -= 30;
					page.drawText('Payment Details:', { x: 50, y, size: 12, color: rgb(0.2, 0.6, 1) });
					y -= 15;
					if (receipt.payment_method) {
						page.drawText(`Payment Method: ${receipt.payment_method}`, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
						y -= 12;
					}
					if (receipt.reference_number) {
						page.drawText(`Reference Number: ${receipt.reference_number}`, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
						y -= 12;
					}
					y -= 8;
				}

				// Notes
				if (receipt.notes) {
					y -= 30;
					page.drawText('Notes:', { x: 50, y, size: 12, color: rgb(0.2, 0.6, 1) });
					y -= 15;
					const noteLines = receipt.notes.split('\n');
					noteLines.forEach((line: string) => {
						page.drawText(line, { x: 50, y, size: 10, color: rgb(0.5, 0.5, 0.5) });
						y -= 12;
					});
					y -= 20;
				}

				// Add footer to all pages
				const generatedAt = new Date().toLocaleString();
				pages.forEach((page, index) => {
					const pageHeight = page.getSize().height;
					page.drawText(`Generated on ${generatedAt}`, { x: 50, y: 50, size: 9, color: rgb(0.5, 0.5, 0.5) });
					if (company) {
						page.drawText(`Prepared by ${company.name}`, { x: width - 200, y: 50, size: 9, color: rgb(0.5, 0.5, 0.5) });
					}
					page.drawText(`Page ${index + 1} of ${pages.length}`, { x: width / 2 - 30, y: 50, size: 9, color: rgb(0.5, 0.5, 0.5) });
				});

				const clientName = client ? client.name.replace(/ /g, '_') : 'Unknown';
				const filename = `${clientName}_Quote_#${id}.pdf`;
				const pdfBytes = await pdfDoc.save();
				return new Response(pdfBytes, {
					headers: {
						'Content-Type': 'application/pdf',
						'Content-Disposition': `attachment; filename="${filename}"`,
					},
				});
			} catch (error) {
				console.log('Error generating PDF:', error);
				return new Response('Error generating PDF: ' + error.message, { status: 500 });
			}
		}

		if (url.pathname.match(/^\/quotes\/(\d+)\/pdf$/)) {
			const id = RegExp.$1;
			try {
				const quote = await env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
				if (!quote) {
					return new Response('Quote not found', { status: 404 });
				}
				const company = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(quote.company_id).first();
				const client = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(quote.client_id).first();
				let project = null;
				if (quote.project_id) {
					project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(quote.project_id).first();
				}

				// Generate professional PDF
				const pdfBytes = await generateProfessionalQuotePDF(quote, company, client, project);
				
				const clientName = client ? client.name.replace(/ /g, '_') : 'Unknown';
				const filename = `${clientName}_Quote_#${id}.pdf`;
				
				return new Response(pdfBytes, {
					headers: {
						'Content-Type': 'application/pdf',
						'Content-Disposition': `attachment; filename="${filename}"`,
					},
				});
				const boldFont = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
				const page = pdfDoc.addPage();
				const { width, height } = page.getSize();

				let currentPage = 0;
				let pages = [pdfDoc.addPage()];
				let y = height - 50;

				// Function to add new page
				const addNewPage = () => {
					currentPage++;
					pages.push(pdfDoc.addPage());
					y = height - 50;
					// Add header to new page
					pages[currentPage].drawRectangle({
						x: 0,
						y: height - 60,
						width: width,
						height: 60,
						color: rgb(0.2, 0.4, 0.8),
					});
					pages[currentPage].drawText('QUOTE', { x: 50, y, size: 28, font: boldFont, color: rgb(1, 1, 1) });
					y = height - 80; // Consistent with first page
				};

				// Function to draw on current page
				const drawText = (text: string, x: number, yPos: number, options: any) => {
					pages[currentPage].drawText(text, { x, y: yPos, ...options });
				};

				// Function to draw rectangle on current page
				const drawRectangle = (options: any) => {
					pages[currentPage].drawRectangle(options);
				};

				// Function to draw line on current page
				const drawLine = (options: any) => {
					pages[currentPage].drawLine(options);
				};

				// Header on first page
				page.drawRectangle({
					x: 0,
					y: height - 60,
					width: width,
					height: 60,
					color: rgb(0.2, 0.4, 0.8),
				});
				page.drawText('QUOTE', { x: 50, y, size: 28, font: boldFont, color: rgb(1, 1, 1) });
				y -= 40;

				// Quote ID and Validity
				drawText(`Quote #${quote.id}`, 50, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
				const validityText = `Valid for ${quote.validity_period} days`;
				const validityWidth = font.widthOfTextAtSize(validityText, 14);
				drawText(validityText, width - 50 - validityWidth, y, { size: 14, color: rgb(0.4, 0.4, 0.4) });
				y -= 50;

				// Company and Client Info
				if (y < 300) addNewPage();

				// Company Info (left)
				let leftY = y;
				drawText('From:', 50, leftY, { size: 12, font: boldFont, color: rgb(0, 0, 0) });
				leftY -= 18;
				if (company) {
					drawText(company.name, 50, leftY, { size: 14, font: boldFont, color: rgb(0, 0, 0) });
					leftY -= 16;
					if (company.email) {
						drawText(company.email, 50, leftY, { size: 11, color: rgb(0.4, 0.4, 0.4) });
						leftY -= 13;
					}
					if (company.phone) {
						drawText(company.phone, 50, leftY, { size: 11, color: rgb(0.4, 0.4, 0.4) });
						leftY -= 13;
					}
					if (company.address) {
						drawText(company.address, 50, leftY, { size: 11, color: rgb(0.4, 0.4, 0.4) });
						leftY -= 13;
					}
				}

				// Client Info (right)
				let rightY = y;
				drawText('To:', 320, rightY, { size: 12, font: boldFont, color: rgb(0, 0, 0) });
				rightY -= 18;
				if (client) {
					drawText(client.name, 320, rightY, { size: 14, font: boldFont, color: rgb(0, 0, 0) });
					rightY -= 16;
					if (client.email) {
						drawText(client.email, 320, rightY, { size: 11, color: rgb(0.4, 0.4, 0.4) });
						rightY -= 13;
					}
					if (client.phone) {
						drawText(client.phone, 320, rightY, { size: 11, color: rgb(0.4, 0.4, 0.4) });
						rightY -= 13;
					}
					if (client.address) {
						drawText(client.address, 320, rightY, { size: 11, color: rgb(0.4, 0.4, 0.4) });
						rightY -= 13;
					}
				}

				y = Math.min(leftY, rightY) - 30;

				// Check if we need new page
				if (y < 150) addNewPage();

				// Project Info
				if (project) {
					drawText(`Project: ${project.name}`, 50, y, { size: 14, font: boldFont, color: rgb(0, 0, 0) });
					y -= 35;
				}

				// Introduction
				if (quote.introduction) {
					if (y < 200) addNewPage();
					drawText('Introduction', 50, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					y -= 22;
					const introLines = quote.introduction.split('\n');
					introLines.forEach((line: string) => {
						if (y < 100) addNewPage();
						drawText(line, 50, y, { size: 11, color: rgb(0, 0, 0) });
						y -= 13;
					});
					y -= 18;
				}

				// Scope Summary
				if (quote.scope_summary) {
					if (y < 200) addNewPage();
					drawText('Project Scope', 50, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					y -= 22;
					const scopeLines = quote.scope_summary.split('\n');
					scopeLines.forEach((line: string) => {
						if (y < 100) addNewPage();
						drawText(line, 50, y, { size: 11, color: rgb(0, 0, 0) });
						y -= 13;
					});
					y -= 18;
				}

				// Deliverables
				if (deliverables.length > 0) {
					if (y < 250) addNewPage();
					drawText('Project Deliverables', 50, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					y -= 25;
					deliverables.forEach((del: any, index: number) => {
						if (y < 150) addNewPage();
						drawText(`${index + 1}. ${del.title}`, 50, y, { size: 13, font: boldFont, color: rgb(0, 0, 0) });
						y -= 17;
						const descLines = del.description.split('\n');
						descLines.forEach((line: string) => {
							if (y < 100) addNewPage();
							drawText(line, 60, y, { size: 11, color: rgb(0.2, 0.2, 0.2) });
							y -= 13;
						});
						if (del.timeline) {
							if (y < 100) addNewPage();
							drawText(`Timeline: ${del.timeline}`, 60, y, { size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
							y -= 17;
						}
					});
					y -= 15;
				}

				// Items Table
				if (items.length > 0) {
					if (y < 300) addNewPage();
					drawText('Cost Breakdown', 50, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					y -= 30;

					// Table Header
					const col1 = 50; // Item
					const col2 = 250; // Description
					const col3 = 350; // Qty
					const col4 = 400; // Rate
					const col5 = 470; // Amount

					drawText('Item', col1, y, { size: 13, font: boldFont, color: rgb(0, 0, 0) });
					drawText('Description', col2, y, { size: 13, font: boldFont, color: rgb(0, 0, 0) });
					drawText('Qty', col3, y, { size: 13, font: boldFont, color: rgb(0, 0, 0) });
					drawText('Rate', col4, y, { size: 13, font: boldFont, color: rgb(0, 0, 0) });
					drawText('Amount', col5, y, { size: 13, font: boldFont, color: rgb(0, 0, 0) });
					y -= 30;

					items.forEach((item: any) => {
						if (y < 100) addNewPage();
						drawText(item.item.substring(0, 18), col1, y, { size: 11, color: rgb(0, 0, 0) });
						drawText(item.description.substring(0, 25), col2, y, { size: 11, color: rgb(0, 0, 0) });
						drawText(item.quantity.toString(), col3, y, { size: 11, color: rgb(0, 0, 0) });
						drawText(`KSH ${item.rate.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, col4, y, { size: 11, color: rgb(0, 0, 0) });
						drawText(`KSH ${item.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, col5, y, { size: 11, color: rgb(0, 0, 0) });
						y -= 15;
					});

					// Total
					if (y < 150) addNewPage();
					y -= 20;
					drawLine({ start: { x: col1 - 5, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0, 0, 0) });
					y -= 25;
					drawText('TOTAL:', col4 - 20, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					drawText(`KSH ${quote.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, col5, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					y -= 40;
				}

				// Payment Terms
				if (payment_terms.length > 0) {
					if (y < 200) addNewPage();
					drawText('Payment Terms', 50, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					y -= 25;
					payment_terms.forEach((term: any, index: number) => {
						if (y < 150) addNewPage();
						drawText(`${index + 1}. ${term.milestone}`, 50, y, { size: 13, font: boldFont, color: rgb(0, 0, 0) });
						y -= 15;
						drawText(`${term.percentage}% - KSH ${term.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 60, y, { size: 11, color: rgb(0.2, 0.2, 0.2) });
						if (term.due_date) {
							if (y < 120) addNewPage();
							drawText(`Due: ${new Date(term.due_date).toLocaleDateString()}`, 60, y - 12, { size: 10, color: rgb(0.4, 0.4, 0.4) });
							y -= 12;
						}
						y -= 18;
					});
					y -= 15;
				}

				// Conclusion
				if (quote.conclusion) {
					if (y < 200) addNewPage();
					drawText('Conclusion', 50, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					y -= 22;
					const conclusionLines = quote.conclusion.split('\n');
					conclusionLines.forEach((line: string) => {
						if (y < 100) addNewPage();
						drawText(line, 50, y, { size: 11, color: rgb(0, 0, 0) });
						y -= 13;
					});
					y -= 18;
				}

				// Terms & Conditions
				if (quote.notes) {
					if (y < 250) addNewPage();
					drawText('Terms & Conditions', 50, y, { size: 16, font: boldFont, color: rgb(0, 0, 0) });
					y -= 22;
					const notesLines = quote.notes.split('\n');
					notesLines.forEach((line: string) => {
						if (y < 100) addNewPage();
						drawText(line, 50, y, { size: 11, color: rgb(0, 0, 0) });
						y -= 13;
					});
					y -= 25;
				}

				// Add footer to all pages
				const generatedAt = new Date().toLocaleString();
				pages.forEach((page, index) => {
					const pageHeight = page.getSize().height;
					page.drawText(`Generated on ${generatedAt}`, { x: 50, y: 50, size: 9, color: rgb(0.5, 0.5, 0.5) });
					if (company) {
						page.drawText(`Prepared by ${company.name}`, { x: width - 200, y: 50, size: 9, color: rgb(0.5, 0.5, 0.5) });
					}
					page.drawText(`Page ${index + 1} of ${pages.length}`, { x: width / 2 - 30, y: 50, size: 9, color: rgb(0.5, 0.5, 0.5) });
				});

			} catch (error) {
				console.log('Error generating quote PDF:', error);
				return new Response('Error generating PDF: ' + error.message, { status: 500 });
			}
		}

		if (url.pathname.match(/^\/receipts\/(\d+)$/)) {
			const id = RegExp.$1;
			try {
				const receipt = await env.DB.prepare('SELECT * FROM receipts WHERE id = ?').bind(id).first();
				if (!receipt) {
					return new Response('Receipt not found', { status: 404 });
				}
				const company = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(receipt.company_id).first();
				const client = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(receipt.client_id).first();
				let project = null;
				if (receipt.project_id) {
					project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(receipt.project_id).first();
				}
				return renderPage(<ViewReceipt theme={theme} path={url.pathname} receipt={receipt} company={company} client={client} project={project} />);
			} catch (error) {
				return new Response('Error fetching receipt', { status: 500 });
			}
		}

		if (url.pathname.match(/^\/receipts\/(\d+)\/edit$/)) {
			const id = RegExp.$1;
			try {
				const receipt = await env.DB.prepare('SELECT * FROM receipts WHERE id = ?').bind(id).first();
				if (!receipt) {
					return new Response('Receipt not found', { status: 404 });
				}
				const companies = await env.DB.prepare('SELECT id, name FROM companies').all();
				const clients = await env.DB.prepare('SELECT id, name FROM clients').all();
				const projects = await env.DB.prepare('SELECT id, name FROM projects').all();
				return renderPage(<EditReceipt theme={theme} path={url.pathname} receipt={receipt} companies={companies.results} clients={clients.results} projects={projects.results} />);
			} catch (error) {
				return new Response('Error fetching receipt', { status: 500 });
			}
		}

		if (url.pathname.match(/^\/companies\/(\d+)\/edit$/)) {
			const id = RegExp.$1;
			try {
				const company = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first();
				if (!company) {
					return new Response('Company not found', { status: 404 });
				}
				return renderPage(<EditCompany theme={theme} path={url.pathname} company={company} />);
			} catch (error) {
				return new Response('Error fetching company', { status: 500 });
			}
		}

		if (url.pathname.match(/^\/invoices\/(\d+)\/edit$/)) {
			const id = RegExp.$1;
			try {
				const invoice = await env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first();
				if (!invoice) {
					return new Response('Invoice not found', { status: 404 });
				}
				const companies = await env.DB.prepare('SELECT id, name FROM companies').all();
				const clients = await env.DB.prepare('SELECT id, name FROM clients').all();
				const projects = await env.DB.prepare('SELECT id, name FROM projects').all();
				return renderPage(<EditInvoice theme={theme} path={url.pathname} invoice={invoice} companies={companies.results} clients={clients.results} projects={projects.results} />);
			} catch (error) {
				return new Response('Error fetching invoice', { status: 500 });
			}
		}

		if (url.pathname.match(/^\/transactions\/(\d+)\/edit$/)) {
			const id = RegExp.$1;
			try {
				const transaction = await env.DB.prepare('SELECT * FROM transactions WHERE id = ?').bind(id).first();
				if (!transaction) {
					return new Response('Transaction not found', { status: 404 });
				}
				const projectsResult = await env.DB.prepare('SELECT id, name FROM projects').all();
				const categoriesResult = await env.DB.prepare('SELECT DISTINCT category FROM transactions ORDER BY category').all();
				const categories = categoriesResult.results.map((row: any) => row.category);
				return renderPage(<EditTransaction theme={theme} path={url.pathname} transaction={transaction} projects={projectsResult.results} categories={categories} />);
			} catch (error) {
				return new Response('Error fetching transaction', { status: 500 });
			}
		}

		switch (url.pathname) {
			case '/login':
				if (request.method === 'GET') {
					const error = url.searchParams.get('error');
					return renderPage(<Login error={error} />);
				} else if (request.method === 'POST') {
					const formData = await request.formData();
					const email = formData.get('email') as string;
					const password = formData.get('password') as string;
					const user = await env.DB.prepare('SELECT id, email, password_hash, salt FROM users WHERE email = ?').bind(email).first();
					if (!user) {
						return new Response(null, { status: 302, headers: { 'Location': '/login?error=1' } });
					}
					const calc = await pbkdf2Hash(password, user.salt || '');
					if (calc !== user.password_hash) {
						return new Response(null, { status: 302, headers: { 'Location': '/login?error=1' } });
					}
					const token = crypto.randomUUID();
					const ttl = parseInt(env.SESSION_TTL_SECONDS || '86400', 10);
					const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
					await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expiresAt).run();
					return new Response(null, {
						status: 302,
						headers: {
							'Location': '/',
							'Set-Cookie': `session=${token}; HttpOnly; Path=/; Max-Age=${ttl}; SameSite=Lax; Secure`,
						},
					});
				}
				return new Response('Method not allowed', { status: 405 });
			case '/api/login':
				if (request.method === 'POST') {
					const { email, password } = await request.json();
					const user = await env.DB.prepare('SELECT id, email, password_hash, salt FROM users WHERE email = ?').bind(email).first();
					if (!user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
					const calc = await pbkdf2Hash(password, user.salt || '');
					if (calc !== user.password_hash) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
					const token = crypto.randomUUID();
					const ttl = parseInt(env.SESSION_TTL_SECONDS || '86400', 10);
					const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
					await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expiresAt).run();
					return new Response(JSON.stringify({ success: true }), {
						headers: {
							'Content-Type': 'application/json',
							'Set-Cookie': `session=${token}; HttpOnly; Path=/; Max-Age=${ttl}; SameSite=Lax; Secure`,
						},
					});
				}
				return new Response('Method not allowed', { status: 405 });
			case '/api/logout':
				if (cookies['session']) {
					await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(cookies['session']).run();
				}
				return new Response(JSON.stringify({ success: true }), {
					headers: {
						'Content-Type': 'application/json',
						'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure',
					},
				});
			case '/theme':
				if (request.method === 'POST') {
					const formData = await request.formData();
					const newTheme = formData.get('theme') as string;
					const redirect = formData.get('redirect') as string || '/';
					return new Response(null, {
						status: 302,
						headers: {
							'Location': redirect,
							'Set-Cookie': `theme=${newTheme}; Path=/; Max-Age=31536000`,
						},
					});
				}
				return new Response('Method not allowed', { status: 405 });
			case '/receipts':
				if (request.method === 'GET') {
					try {
						const { results } = await env.DB.prepare(`
							SELECT r.*,
								   c.name as client_name,
								   comp.name as company_name
							FROM receipts r
							LEFT JOIN clients c ON r.client_id = c.id
							LEFT JOIN companies comp ON r.company_id = comp.id
							ORDER BY r.id DESC
						`).all();
						return renderPage(<Receipts receipts={results} theme={theme} path={url.pathname} />);
					} catch (error) {
						return new Response('Error fetching receipts', { status: 500 });
					}
				} else if (request.method === 'POST') {
					const formData = await request.formData();
					const id = formData.get('id') as string;
					const company_id = formData.get('company_id') as string;
					const client_id = formData.get('client_id') as string;
					const project_id = formData.get('project_id') as string || null;
					const date = formData.get('date') as string;
					const payment_method = formData.get('payment_method') as string || null;
					const reference_number = formData.get('reference_number') as string || null;
					const notes = formData.get('notes') as string || null;
					if (!company_id || !client_id || !date) {
						return new Response('Required fields missing', { status: 400 });
					}
					const receiptItems = [];
					let total = 0;
					for (let i = 0; i < 50; i++) {
						const description = formData.get(`description_${i}`) as string;
						const quantity = parseFloat(formData.get(`quantity_${i}`) as string) || 0;
						const rate = parseFloat(formData.get(`rate_${i}`) as string) || 0;
						if (description && quantity > 0 && rate > 0) {
							const amount = quantity * rate;
							receiptItems.push({ description, quantity, rate, amount });
							total += amount;
						}
					}
					if (receiptItems.length === 0) {
						return new Response('At least one item is required', { status: 400 });
					}
					const itemsJson = JSON.stringify(receiptItems);
					try {
						await env.DB.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').bind('admin@bogingo.com', 'dummy_hash', 'Admin').run();
						if (id) {
							// Update existing receipt
							console.log('Updating receipt with id:', id);
							await env.DB.prepare('UPDATE receipts SET company_id = ?, client_id = ?, project_id = ?, amount = ?, date = ?, items = ?, payment_method = ?, reference_number = ?, notes = ? WHERE id = ?').bind(company_id, client_id, project_id, total, date, itemsJson, payment_method, reference_number, notes, id).run();
						} else {
							// Create new receipt
							console.log('Creating receipt with:', {company_id, client_id, project_id, total, date, itemsJson: itemsJson.substring(0, 100), payment_method, reference_number, notes});
							await env.DB.prepare('INSERT INTO receipts (user_id, company_id, client_id, project_id, amount, date, items, payment_method, reference_number, notes) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(company_id, client_id, project_id, total, date, itemsJson, payment_method, reference_number, notes).run();
						}
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/receipts' },
						});
					} catch (error) {
						console.log('Error saving receipt:', error);
						return new Response('Error saving receipt: ' + error.message, { status: 500 });
					}
				}
				return new Response('Method not allowed', { status: 405 });
			case '/invoices':
				if (request.method === 'GET') {
					try {
						const { results } = await env.DB.prepare(`
							SELECT i.*,
								   c.name as client_name,
								   comp.name as company_name
							FROM invoices i
							LEFT JOIN clients c ON i.client_id = c.id
							LEFT JOIN companies comp ON i.company_id = comp.id
							ORDER BY i.id DESC
						`).all();
						return renderPage(<Invoices invoices={results} theme={theme} path={url.pathname} />);
					} catch (error) {
						return new Response('Error fetching invoices', { status: 500 });
					}
				} else if (request.method === 'POST') {
					const formData = await request.formData();
					const id = formData.get('id') as string;
					const company_id = formData.get('company_id') as string;
					const client_id = formData.get('client_id') as string;
					const project_id = formData.get('project_id') as string || null;
					const due_date = formData.get('due_date') as string;
					const bank_name = formData.get('bank_name') as string || null;
					const account_name = formData.get('account_name') as string || null;
					const account_number = formData.get('account_number') as string || null;
					const swift_code = formData.get('swift_code') as string || null;
					const payment_instructions = formData.get('payment_instructions') as string || null;
					if (!company_id || !client_id || !due_date) {
						return new Response('Required fields missing', { status: 400 });
					}
					const invoiceItems = [];
					let total = 0;
					for (let i = 0; i < 50; i++) {
						const description = formData.get(`description_${i}`) as string;
						const quantity = parseFloat(formData.get(`quantity_${i}`) as string) || 0;
						const rate = parseFloat(formData.get(`rate_${i}`) as string) || 0;
						if (description && quantity > 0 && rate > 0) {
							const amount = quantity * rate;
							invoiceItems.push({ description, quantity, rate, amount });
							total += amount;
						}
					}
					if (invoiceItems.length === 0) {
						return new Response('At least one item is required', { status: 400 });
					}
					const itemsJson = JSON.stringify(invoiceItems);
					try {
						await env.DB.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').bind('admin@example.com', 'dummy_hash', 'Admin').run();
						if (id) {
							// Update existing invoice
							console.log('Updating invoice with id:', id);
							await env.DB.prepare('UPDATE invoices SET company_id = ?, client_id = ?, project_id = ?, amount = ?, due_date = ?, items = ?, bank_name = ?, account_name = ?, account_number = ?, swift_code = ?, payment_instructions = ? WHERE id = ?').bind(company_id, client_id, project_id, total, due_date, itemsJson, bank_name, account_name, account_number, swift_code, payment_instructions, id).run();
						} else {
							// Create new invoice
							console.log('Creating invoice with:', {company_id, client_id, project_id, total, due_date, itemsJson: itemsJson.substring(0, 100), bank_name, account_name, account_number});
							await env.DB.prepare('INSERT INTO invoices (user_id, company_id, client_id, project_id, amount, due_date, items, bank_name, account_name, account_number, swift_code, payment_instructions) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(company_id, client_id, project_id, total, due_date, itemsJson, bank_name, account_name, account_number, swift_code, payment_instructions).run();
						}
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/invoices' },
						});
					} catch (error) {
						console.log('Error saving invoice:', error);
						return new Response('Error saving invoice: ' + error.message, { status: 500 });
					}
				}
				return new Response('Method not allowed', { status: 405 });
			case '/companies/new':
				return renderPage(<NewCompany theme={theme} path={url.pathname} />);
			case '/projects/new':
				try {
					const { results } = await env.DB.prepare('SELECT id, name FROM clients').all();
					return renderPage(<NewProject theme={theme} path={url.pathname} clients={results} />);
				} catch (error) {
					return new Response('Error fetching clients', { status: 500 });
				}
			case '/profile':
				try {
					if (!currentUser) return Response.redirect(`${url.origin}/login`);
					const user = await env.DB.prepare('SELECT id, email, name FROM users WHERE id = ?').bind(currentUser.user_id).first();
					return renderPage(<Profile theme={theme} path={url.pathname} user={user} />);
				} catch (error) {
					return new Response('Error loading profile', { status: 500 });
				}
			case '/profile/email':
				if (request.method === 'POST') {
					const formData = await request.formData();
					const currentEmail = formData.get('current_email') as string;
					const newEmail = formData.get('new_email') as string;
					const confirmEmail = formData.get('confirm_email') as string;

					if (newEmail !== confirmEmail) {
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/profile?error=email_mismatch' },
						});
					}

					if (!currentUser) return Response.redirect(`${url.origin}/login`);
					const dbUser = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(currentUser.user_id).first();
					if (!dbUser || dbUser.email !== currentEmail) {
						return new Response(null, { status: 302, headers: { 'Location': '/profile?error=invalid_current_email' } });
					}
					await env.DB.prepare('UPDATE users SET email = ? WHERE id = ?').bind(newEmail, currentUser.user_id).run();
					return new Response(null, { status: 302, headers: { 'Location': '/profile?success=email_updated' } });
				}
				return new Response('Method not allowed', { status: 405 });
			case '/profile/password':
				if (request.method === 'POST') {
					const formData = await request.formData();
					const currentPassword = formData.get('current_password') as string;
					const newPassword = formData.get('new_password') as string;
					const confirmPassword = formData.get('confirm_password') as string;

					if (newPassword !== confirmPassword) {
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/profile?error=password_mismatch' },
						});
					}

					if (!currentUser) return Response.redirect(`${url.origin}/login`);
					const user = await env.DB.prepare('SELECT id, password_hash, salt FROM users WHERE id = ?').bind(currentUser.user_id).first();
					if (!user) return new Response('User not found', { status: 404 });
					const currentCalc = await pbkdf2Hash(currentPassword, user.salt || '');
					if (currentCalc !== user.password_hash) {
						return new Response(null, { status: 302, headers: { 'Location': '/profile?error=invalid_current_password' } });
					}
					if (newPassword.length < 6) {
						return new Response(null, { status: 302, headers: { 'Location': '/profile?error=password_too_short' } });
					}
					const newSalt = generateSalt();
					const newHash = await pbkdf2Hash(newPassword, newSalt);
					await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').bind(newHash, newSalt, currentUser.user_id).run();
					return new Response(null, { status: 302, headers: { 'Location': '/profile?success=password_updated' } });
				}
				return new Response('Method not allowed', { status: 405 });
			case '/transactions/new':
				try {
					const projectsResult = await env.DB.prepare('SELECT id, name FROM projects').all();
					const categoriesResult = await env.DB.prepare('SELECT DISTINCT category FROM transactions ORDER BY category').all();
					const categories = categoriesResult.results.map((row: any) => row.category);
					return renderPage(<NewTransaction theme={theme} path={url.pathname} projects={projectsResult.results} categories={categories} />);
				} catch (error) {
					return new Response('Error fetching data', { status: 500 });
				}
			case '/invoices/new':
				try {
					const companies = await env.DB.prepare('SELECT id, name FROM companies').all();
					const clients = await env.DB.prepare('SELECT id, name FROM clients').all();
					const projects = await env.DB.prepare('SELECT id, name FROM projects').all();
					return renderPage(<NewInvoice theme={theme} path={url.pathname} companies={companies.results} clients={clients.results} projects={projects.results} />);
				} catch (error) {
					return new Response('Error fetching data', { status: 500 });
				}
			case '/receipts/new':
				try {
					console.log('Fetching data for receipts/new');
					const companies = await env.DB.prepare('SELECT id, name FROM companies').all();
					console.log('Companies:', companies.results.length);
					const clients = await env.DB.prepare('SELECT id, name FROM clients').all();
					console.log('Clients:', clients.results.length);
					const projects = await env.DB.prepare('SELECT id, name FROM projects').all();
					console.log('Projects:', projects.results.length);
					return renderPage(<NewReceipt theme={theme} path={url.pathname} companies={companies.results} clients={clients.results} projects={projects.results} />);
				} catch (error) {
					console.log('Error fetching data:', error);
					return new Response('Error fetching data: ' + error.message, { status: 500 });
				}
			case '/clients/new':
				return renderPage(<NewClient theme={theme} path={url.pathname} />);
			case '/clients':
				if (request.method === 'GET') {
					try {
						const { results } = await env.DB.prepare('SELECT * FROM clients').all();
						return renderPage(<Clients clients={results} theme={theme} path={url.pathname} />);
					} catch (error) {
						return new Response('Error fetching clients', { status: 500 });
					}
				} else if (request.method === 'POST') {
					const formData = await request.formData();
					const name = formData.get('name') as string;
					const email = formData.get('email') as string;
					const phone = formData.get('phone') as string;
					const address = formData.get('address') as string;
					if (!name || !email) {
						return new Response('Name and email are required', { status: 400 });
					}
					try {
						await env.DB.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').bind('admin@bogingo.com', 'dummy_hash', 'Admin').run();
						await env.DB.prepare('INSERT INTO clients (user_id, name, email, phone, address) VALUES (1, ?, ?, ?, ?)').bind(name, email, phone, address).run();
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/clients' },
						});
					} catch (error) {
						return new Response('Error creating client', { status: 500 });
					}
				}
				return new Response('Method not allowed', { status: 405 });
			case '/projects':
				if (request.method === 'GET') {
					try {
						const { results } = await env.DB.prepare('SELECT * FROM projects').all();
						return renderPage(<Projects projects={results} theme={theme} path={url.pathname} />);
					} catch (error) {
						return new Response('Error fetching projects', { status: 500 });
					}
				} else if (request.method === 'POST') {
					const formData = await request.formData();
					const name = formData.get('name') as string;
					const client_id = formData.get('client_id') as string;
					const description = formData.get('description') as string;
					if (!name || !client_id) {
						return new Response('Name and client are required', { status: 400 });
					}
					try {
						await env.DB.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').bind('admin@bogingo.com', 'dummy_hash', 'Admin').run();
						await env.DB.prepare('INSERT INTO projects (user_id, name, client_id, description) VALUES (1, ?, ?, ?)').bind(name, client_id, description).run();
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/projects' },
						});
					} catch (error) {
						return new Response('Error creating project', { status: 500 });
					}
				}
				return new Response('Method not allowed', { status: 405 });
			case '/transactions':
				if (request.method === 'GET') {
					try {
						const { results } = await env.DB.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
						return renderPage(<Transactions transactions={results} theme={theme} path={url.pathname} />);
					} catch (error) {
						return new Response('Error fetching transactions', { status: 500 });
					}
				} else if (request.method === 'POST') {
					const formData = await request.formData();
					const id = formData.get('id') as string;
					const type = formData.get('type') as string;
					const amount = parseFloat(formData.get('amount') as string);
					const category = formData.get('category') as string;
					const date = formData.get('date') as string;
					const description = formData.get('description') as string;
					const project_id = formData.get('project_id') as string || null;
					if (!type || !amount || !category || !date) {
						return new Response('Type, amount, category, and date are required', { status: 400 });
					}
					try {
						await env.DB.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').bind('admin@example.com', 'dummy_hash', 'Admin').run();
						if (id) {
							// Update existing transaction
							await env.DB.prepare('UPDATE transactions SET type = ?, amount = ?, category = ?, date = ?, description = ?, project_id = ? WHERE id = ?').bind(type, amount, category, date, description, project_id, id).run();
						} else {
							// Create new transaction
							await env.DB.prepare('INSERT INTO transactions (user_id, type, amount, category, date, description, project_id) VALUES (1, ?, ?, ?, ?, ?, ?)').bind(type, amount, category, date, description, project_id).run();
						}
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/transactions' },
						});
					} catch (error) {
						return new Response('Error saving transaction', { status: 500 });
					}
				}
				return new Response('Method not allowed', { status: 405 });
			default:
				if (!currentUser && url.pathname !== '/login') {
					return Response.redirect(`${url.origin}/login`);
				}
				if (url.pathname === '/') {
					try {
							// Fetch dashboard stats
							const incomeResult = await env.DB.prepare('SELECT SUM(amount) as total FROM transactions WHERE type = ?').bind('income').first();
							const expenseResult = await env.DB.prepare('SELECT SUM(amount) as total FROM transactions WHERE type = ?').bind('expense').first();
							const pendingInvoicesResult = await env.DB.prepare('SELECT COUNT(*) as count FROM invoices WHERE status != ?').bind('paid').first();
							const activeProjectsResult = await env.DB.prepare('SELECT COUNT(*) as count FROM projects').first();

							// Fetch recent transactions
							const recentTransactions = await env.DB.prepare('SELECT * FROM transactions ORDER BY date DESC LIMIT 5').all();

							// Fetch upcoming invoices
							const upcomingInvoices = await env.DB.prepare(`
								SELECT i.*,
									   c.name as client_name,
									   comp.name as company_name
								FROM invoices i
								LEFT JOIN clients c ON i.client_id = c.id
								LEFT JOIN companies comp ON i.company_id = comp.id
								WHERE i.due_date >= date('now')
								ORDER BY i.due_date ASC
								LIMIT 5
							`).all();

							const stats = {
								totalIncome: incomeResult?.total || 0,
								totalExpenses: expenseResult?.total || 0,
								pendingInvoices: pendingInvoicesResult?.count || 0,
								activeProjects: activeProjectsResult?.count || 0,
							};

							return renderPage(<Dashboard theme={theme} path={url.pathname} stats={stats} recentTransactions={recentTransactions.results} upcomingInvoices={upcomingInvoices.results} />);
						} catch (error) {
							console.log('Error fetching dashboard data:', error);
							// Return dashboard with empty data on error
							const emptyStats = {
								totalIncome: 0,
								totalExpenses: 0,
								pendingInvoices: 0,
								activeProjects: 0,
							};
							return renderPage(<Dashboard theme={theme} path={url.pathname} stats={emptyStats} recentTransactions={[]} upcomingInvoices={[]} />);
						}
				} else if (url.pathname === '/companies') {
				if (request.method === 'GET') {
					try {
						const { results } = await env.DB.prepare('SELECT * FROM companies').all();
						return renderPage(<Companies companies={results} theme={theme} path={url.pathname} />);
					} catch (error) {
						return new Response('Error fetching companies', { status: 500 });
					}
				} else if (request.method === 'POST') {
					const formData = await request.formData();
					const id = formData.get('id') as string;
					const name = formData.get('name') as string;
					const email = formData.get('email') as string;
					const phone = formData.get('phone') as string;
					const address = formData.get('address') as string;
					const logoFile = formData.get('logo') as File | null;
					if (!name || !email) {
						return new Response('Name and email are required', { status: 400 });
					}
					let logo_url = '';
					if (logoFile && logoFile.size > 0) {
						const key = `logos/${Date.now()}-${logoFile.name}`;
						console.log('Uploading logo to key:', key);
						await env.BUCKET.put(key, logoFile);
						logo_url = `/logos/${key}`;
						console.log('Logo uploaded, URL:', logo_url);
					}
					try {
						await env.DB.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').bind('admin@example.com', 'dummy_hash', 'Admin').run();
						if (id) {
							// Update
							const updateFields = [];
							const values = [];
							if (logo_url) {
								updateFields.push('logo_url = ?');
								values.push(logo_url);
							}
							updateFields.push('name = ?, email = ?, phone = ?, address = ?');
							values.push(name, email, phone, address, id);
							await env.DB.prepare(`UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`).bind(...values).run();
						} else {
							// Insert
							await env.DB.prepare('INSERT INTO companies (user_id, name, email, phone, address, logo_url) VALUES (1, ?, ?, ?, ?, ?)').bind(name, email, phone, address, logo_url).run();
						}
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/companies' },
						});
					} catch (error) {
						return new Response('Error saving company', { status: 500 });
					}
				}
				return new Response('Method not allowed', { status: 405 });
				} else if (url.pathname === '/quotes') {
				if (request.method === 'GET') {
					try {
						const { results } = await env.DB.prepare(`
							SELECT q.*,
								   c.name as client_name,
								   comp.name as company_name
							FROM quotes q
							LEFT JOIN clients c ON q.client_id = c.id
							LEFT JOIN companies comp ON q.company_id = comp.id
							ORDER BY q.id DESC
						`).all();
						return renderPage(<Quotes quotes={results} theme={theme} path={url.pathname} />);
					} catch (error) {
						console.log('Error fetching quotes:', error);
						return renderPage(<Quotes quotes={[]} theme={theme} path={url.pathname} />);
					}
				} else if (request.method === 'POST') {
					const formData = await request.formData();
					const id = formData.get('id') as string;
					const company_id = formData.get('company_id') as string;
					const client_id = formData.get('client_id') as string;
					const project_id = formData.get('project_id') as string || null;
					const title = formData.get('title') as string;
					const introduction = formData.get('introduction') as string || null;
					const scope_summary = formData.get('scope_summary') as string || null;
					const validity_period = parseInt(formData.get('validity_period') as string) || 30;
					const conclusion = formData.get('conclusion') as string || null;
					const notes = formData.get('notes') as string || null;

					// Parse deliverables
					const deliverables = [];
					for (let i = 0; i < 20; i++) {
						const title = formData.get(`deliverable_title_${i}`) as string;
						const description = formData.get(`deliverable_description_${i}`) as string;
						const timeline = formData.get(`deliverable_timeline_${i}`) as string;
						if (title && description) {
							deliverables.push({ title, description, timeline, milestones: [] });
						}
					}

					// Parse items
					const items = [];
					let total = 0;
					for (let i = 0; i < 50; i++) {
						const category = formData.get(`category_${i}`) as string;
						const item = formData.get(`item_${i}`) as string;
						const description = formData.get(`description_${i}`) as string;
						const quantity = parseFloat(formData.get(`quantity_${i}`) as string) || 0;
						const unit = formData.get(`unit_${i}`) as string || 'item';
						const rate = parseFloat(formData.get(`rate_${i}`) as string) || 0;
						if (item && quantity > 0 && rate > 0) {
							const amount = quantity * rate;
							items.push({ category, item, description, quantity, unit, rate, amount });
							total += amount;
						}
					}

					// Parse payment terms
					const payment_terms = [];
					for (let i = 0; i < 10; i++) {
						const milestone = formData.get(`milestone_${i}`) as string;
						const percentage = parseFloat(formData.get(`percentage_${i}`) as string) || 0;
						const due_date = formData.get(`due_date_${i}`) as string;
						const description = formData.get(`payment_description_${i}`) as string;
						if (milestone && percentage > 0) {
							const amount = (total * percentage) / 100;
							payment_terms.push({ milestone, percentage, amount, due_date, description });
						}
					}

					if (!title || items.length === 0) {
						return new Response('Title and at least one item are required', { status: 400 });
					}

					const deliverablesJson = JSON.stringify(deliverables);
					const itemsJson = JSON.stringify(items);
					const paymentTermsJson = JSON.stringify(payment_terms);

					try {
						await env.DB.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (1, ?, ?, ?)').bind('admin@example.com', 'dummy_hash', 'Admin').run();
						if (id && id !== '' && id !== 'undefined') {
							// Update existing quote
							console.log('Updating quote with id:', id);
							await env.DB.prepare('UPDATE quotes SET company_id = ?, client_id = ?, project_id = ?, title = ?, introduction = ?, scope_summary = ?, deliverables = ?, items = ?, payment_terms = ?, validity_period = ?, conclusion = ?, notes = ?, amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(company_id, client_id, project_id, title, introduction, scope_summary, deliverablesJson, itemsJson, paymentTermsJson, validity_period, conclusion, notes, total, id).run();
						} else {
							// Create new quote
							console.log('Creating quote');
							await env.DB.prepare('INSERT INTO quotes (user_id, company_id, client_id, project_id, title, introduction, scope_summary, deliverables, items, payment_terms, validity_period, conclusion, notes, amount) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(company_id, client_id, project_id, title, introduction, scope_summary, deliverablesJson, itemsJson, paymentTermsJson, validity_period, conclusion, notes, total).run();
						}
						return new Response(null, {
							status: 302,
							headers: { 'Location': '/quotes' },
						});
					} catch (error) {
						console.log('Error saving quote:', error);
						return new Response('Error saving quote: ' + error.message, { status: 500 });
					}
				}
				return new Response('Method not allowed', { status: 405 });
				} else if (url.pathname === '/quotes/new') {
				try {
					const companies = await env.DB.prepare('SELECT id, name FROM companies').all();
					const clients = await env.DB.prepare('SELECT id, name FROM clients').all();
					const projects = await env.DB.prepare('SELECT id, name FROM projects').all();
					return renderPage(<NewQuote theme={theme} path={url.pathname} companies={companies.results} clients={clients.results} projects={projects.results} />);
				} catch (error) {
					console.log('Error fetching data for quotes/new:', error);
					return new Response('Error fetching data: ' + error.message, { status: 500 });
				}
				} else if (url.pathname.match(/^\/quotes\/(\d+)\/edit$/)) {
			const id = RegExp.$1;
			try {
				const quote = await env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
				if (!quote) {
					return new Response('Quote not found', { status: 404 });
				}
				const companies = await env.DB.prepare('SELECT id, name FROM companies').all();
				const clients = await env.DB.prepare('SELECT id, name FROM clients').all();
				const projects = await env.DB.prepare('SELECT id, name FROM projects').all();
				return renderPage(<EditQuote theme={theme} path={url.pathname} companies={companies.results} clients={clients.results} projects={projects.results} quote={quote} />);
			} catch (error) {
				console.log('Error fetching quote for edit:', error);
				return new Response('Error fetching quote', { status: 500 });
			}
		} else if (url.pathname.match(/^\/quotes\/(\d+)$/)) {
			const id = RegExp.$1;
			try {
				const quote = await env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
				if (!quote) {
					return new Response('Quote not found', { status: 404 });
				}
				const company = quote.company_id ? await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(quote.company_id).first() : null;
				const client = quote.client_id ? await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(quote.client_id).first() : null;
				let project = null;
				if (quote.project_id) {
					project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(quote.project_id).first();
				}
				return renderPage(<ViewQuote theme={theme} path={url.pathname} quote={quote} company={company} client={client} project={project} />);
			} catch (error) {
				console.log('Error fetching quote for view:', error);
				return new Response('Error fetching quote', { status: 500 });
			}
		} else {
			return new Response('Not Found', { status: 404 });
		}
		}
	}
};
