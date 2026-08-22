type ReceiptLineItem = {
	description: string;
	quantity: number;
	rate: number;
	amount: number;
};

type ReceiptExtraction = {
	merchant_name: string | null;
	receipt_date: string | null;
	currency: string | null;
	subtotal: number | null;
	tax: number | null;
	total: number | null;
	payment_method: string | null;
	reference_number: string | null;
	confidence: number | null;
	line_items: ReceiptLineItem[];
};

type ReceiptOcrResult = {
	model: string;
	raw_text: string;
	extraction: ReceiptExtraction;
};

type ReceiptSyncRow = {
	id: number;
	user_id: number;
	receipt_type: string;
	merchant_name: string | null;
	amount: number | null;
	date: string | null;
	description: string | null;
	project_id: number | null;
	items: string | null;
};

const RECEIPT_JSON_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		merchant_name: { type: 'string' },
		receipt_date: { type: 'string' },
		currency: { type: 'string' },
		subtotal: { type: 'number' },
		tax: { type: 'number' },
		total: { type: 'number' },
		payment_method: { type: 'string' },
		reference_number: { type: 'string' },
		confidence: { type: 'number' },
		line_items: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				properties: {
					description: { type: 'string' },
					quantity: { type: 'number' },
					rate: { type: 'number' },
					amount: { type: 'number' }
				},
				required: ['description']
			}
		}
	},
	required: ['merchant_name', 'receipt_date', 'currency', 'subtotal', 'tax', 'total', 'payment_method', 'reference_number', 'confidence', 'line_items']
};

function toBase64(bytes: ArrayBuffer): string {
	const chunkSize = 0x8000;
	const data = new Uint8Array(bytes);
	let binary = '';
	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.subarray(i, i + chunkSize);
		binary += String.fromCharCode(...chunk);
	}
	return btoa(binary);
}

function normalizeAmount(input: unknown): number | null {
	const text = String(input ?? '').replace(/,/g, '').trim();
	if (!text) return null;
	const parsed = Number.parseFloat(text);
	return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(input: unknown): string | null {
	const text = String(input ?? '').trim();
	if (!text) return null;

	const parsed = new Date(text);
	if (!Number.isNaN(parsed.getTime())) {
		return parsed.toISOString().split('T')[0];
	}

	const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
	if (match) {
		const day = match[1].padStart(2, '0');
		const month = match[2].padStart(2, '0');
		const year = match[3].length === 2 ? `20${match[3]}` : match[3];
		const alt = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
		if (!Number.isNaN(alt.getTime())) {
			return alt.toISOString().split('T')[0];
		}
	}

	return null;
}

function extractJsonObject(rawText: string): any {
	const trimmed = rawText.trim();
	try {
		return JSON.parse(trimmed);
	} catch {
		const start = trimmed.indexOf('{');
		const end = trimmed.lastIndexOf('}');
		if (start !== -1 && end !== -1 && end > start) {
			try {
				return JSON.parse(trimmed.slice(start, end + 1));
			} catch {
				return null;
			}
		}
		return null;
	}
}

function coerceLineItems(items: any): ReceiptLineItem[] {
	if (!Array.isArray(items)) return [];

	return items
		.map((item) => {
			const description = String(item?.description ?? item?.name ?? item?.label ?? '').trim();
			if (!description) return null;

			const quantity = normalizeAmount(item?.quantity) ?? 1;
			const amount = normalizeAmount(item?.amount) ?? normalizeAmount(item?.total) ?? normalizeAmount(item?.rate) ?? 0;
			const rate = normalizeAmount(item?.rate) ?? (quantity ? amount / quantity : amount);

			return {
				description,
				quantity,
				rate,
				amount,
			};
		})
		.filter(Boolean) as ReceiptLineItem[];
}

function buildReceiptItems(extraction: ReceiptExtraction): ReceiptLineItem[] {
	const lineItems = coerceLineItems(extraction.line_items);
	if (lineItems.length > 0) return lineItems;

	const total = extraction.total ?? 0;
	const merchant = extraction.merchant_name || 'Receipt';
	return [{
		description: `${merchant} purchase`,
		quantity: 1,
		rate: total,
		amount: total,
	}];
}

function buildExtractionPayload(parsed: any): ReceiptExtraction {
	const rawLineItems = coerceLineItems(parsed?.line_items);
	const total = normalizeAmount(parsed?.total);
	const subtotal = normalizeAmount(parsed?.subtotal);
	const tax = normalizeAmount(parsed?.tax);
	const confidence = normalizeAmount(parsed?.confidence);
	const merchantName = String(parsed?.merchant_name ?? parsed?.merchant ?? '').trim();
	const receiptDate = normalizeDate(parsed?.receipt_date ?? parsed?.date ?? parsed?.transaction_date);
	const currency = String(parsed?.currency ?? 'KSH').trim() || 'KSH';
	const paymentMethod = String(parsed?.payment_method ?? parsed?.payment ?? '').trim();
	const referenceNumber = String(parsed?.reference_number ?? parsed?.reference ?? '').trim();

	return {
		merchant_name: merchantName || null,
		receipt_date: receiptDate,
		currency,
		subtotal,
		tax,
		total,
		payment_method: paymentMethod || null,
		reference_number: referenceNumber || null,
		confidence,
		line_items: rawLineItems,
	};
}

function getReceiptAmount(receipt: ReceiptSyncRow): number | null {
	const directAmount = normalizeAmount(receipt.amount);
	if (directAmount !== null) {
		return directAmount;
	}

	if (!receipt.items) {
		return null;
	}

	try {
		const items = JSON.parse(receipt.items);
		if (!Array.isArray(items)) return null;

		const total = items.reduce((sum: number, item: any) => {
			const amount = normalizeAmount(item?.amount) ?? 0;
			return sum + amount;
		}, 0);

		return Number.isFinite(total) && total > 0 ? total : null;
	} catch {
		return null;
	}
}

export async function syncReceiptExpenseTransaction(env: any, receiptId: number, userId: number): Promise<void> {
	const receipt = await env.DB.prepare(`
		SELECT id, user_id, receipt_type, merchant_name, amount, date, description, project_id, items
		FROM receipts
		WHERE id = ? AND user_id = ?
	`).bind(receiptId, userId).first() as ReceiptSyncRow | null;

	if (!receipt || receipt.receipt_type !== 'incoming') {
		return;
	}

	const amount = getReceiptAmount(receipt);
	if (amount === null) {
		return;
	}

	const description = String(receipt.merchant_name || receipt.description || `Receipt #${receipt.id}`).trim();
	const date = receipt.date || new Date().toISOString().split('T')[0];
	const category = 'Miscellaneous';
	const existingTransaction = await env.DB.prepare(`
		SELECT id, category
		FROM transactions
		WHERE receipt_id = ? AND user_id = ?
		LIMIT 1
	`).bind(receiptId, userId).first() as { id: number; category: string | null } | null;

	if (existingTransaction?.id) {
		await env.DB.prepare(`
			UPDATE transactions
			SET type = 'expense',
				amount = ?,
				date = ?,
				description = ?,
				project_id = ?,
				receipt_id = ?
			WHERE id = ? AND user_id = ?
		`).bind(
			amount,
			date,
			description,
			receipt.project_id || null,
			receiptId,
			existingTransaction.id,
			userId
		).run();
		return;
	}

	await env.DB.prepare(`
		INSERT INTO transactions (user_id, type, amount, category, date, description, project_id, receipt_id)
		VALUES (?, 'expense', ?, ?, ?, ?, ?, ?)
	`).bind(
		userId,
		amount,
		category,
		date,
		description,
		receipt.project_id || null,
		receiptId
	).run();
}

async function extractFromMarkdown(env: any, fileBytes: ArrayBuffer, fileName: string): Promise<ReceiptOcrResult> {
	const markdownResult = await env.AI.toMarkdown({
		name: fileName,
		blob: new Blob([fileBytes], { type: 'application/pdf' }),
	});

	const markdownDoc = Array.isArray(markdownResult) ? markdownResult[0] : markdownResult;
	if (!markdownDoc || markdownDoc.format === 'error') {
		throw new Error(markdownDoc?.error || 'Failed to convert receipt PDF to markdown');
	}

	const markdownText = String(markdownDoc.data || '').trim();
	if (!markdownText) {
		throw new Error('No extractable text found in receipt PDF');
	}

	const response = await env.AI.run('@cf/google/gemma-3-12b-it', {
		messages: [
			{
				role: 'system',
				content: 'You extract structured receipt data from text. Return only JSON that matches the requested schema. Use null for missing fields.'
			},
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: `Extract receipt details from this markdown text:\n\n${markdownText}`
					}
				]
			}
		],
		guided_json: RECEIPT_JSON_SCHEMA,
		max_tokens: 900,
		temperature: 0
	});

	const rawText = String((response as any)?.response || '').trim();
	const parsed = extractJsonObject(rawText) || {};

	return {
		model: '@cf/google/gemma-3-12b-it',
		raw_text: markdownText,
		extraction: buildExtractionPayload(parsed),
	};
}

async function extractFromImage(env: any, fileBytes: ArrayBuffer, mimeType: string, fileName: string): Promise<ReceiptOcrResult> {
	const dataUri = `data:${mimeType || 'image/jpeg'};base64,${toBase64(fileBytes)}`;
	const response = await env.AI.run('@cf/google/gemma-3-12b-it', {
		messages: [
			{
				role: 'system',
				content: 'You extract structured receipt data from images. Return only JSON that matches the requested schema. Use null for missing fields.'
			},
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: `Extract receipt details from this receipt image named ${fileName}.`
					},
					{
						type: 'image_url',
						image_url: { url: dataUri }
					}
				]
			}
		],
		guided_json: RECEIPT_JSON_SCHEMA,
		max_tokens: 900,
		temperature: 0
	});

	const rawText = String((response as any)?.response || '').trim();
	const parsed = extractJsonObject(rawText) || {};

	return {
		model: '@cf/google/gemma-3-12b-it',
		raw_text: rawText,
		extraction: buildExtractionPayload(parsed),
	};
}

export async function processReceiptUpload(params: {
	env: any;
	receiptId: number;
	userId: number;
	fileKey: string;
	fileName: string | null;
	fileType: string | null;
}): Promise<void> {
	const { env, receiptId, userId, fileKey, fileName, fileType } = params;

	await env.DB.prepare(
		"UPDATE receipts SET ocr_status = 'processing', ocr_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
	).bind(receiptId, userId).run();

	try {
		const object = await env.BUCKET.get(fileKey);
		if (!object) {
			throw new Error('Uploaded receipt file was not found in storage');
		}

		const fileBytes = await object.arrayBuffer();
		const contentType = String(object.httpMetadata?.contentType || fileType || '').toLowerCase();
		const originalName = fileName || fileKey.split('/').pop() || `receipt-${receiptId}`;
		let result: ReceiptOcrResult;

		if (contentType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
			result = await extractFromMarkdown(env, fileBytes, originalName);
		} else {
			result = await extractFromImage(env, fileBytes, contentType || 'image/jpeg', originalName);
		}

		const extraction = result.extraction;
		const lineItems = buildReceiptItems(extraction);
		const lineItemTotal = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
		const total = extraction.total ?? (lineItemTotal || null);
		const updateQuery = `
			UPDATE receipts
			SET ocr_status = 'complete',
				ocr_model = ?,
				ocr_text = ?,
				ocr_json = ?,
				ocr_confidence = ?,
				merchant_name = COALESCE(?, merchant_name),
				description = COALESCE(?, description),
				date = COALESCE(?, date),
				amount = COALESCE(?, amount),
				payment_method = COALESCE(?, payment_method),
				reference_number = COALESCE(?, reference_number),
				items = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ? AND user_id = ?
		`;

		await env.DB.prepare(updateQuery).bind(
			result.model,
			result.raw_text,
			JSON.stringify(extraction),
			extraction.confidence,
			extraction.merchant_name,
			extraction.merchant_name ? `Receipt from ${extraction.merchant_name}` : null,
			extraction.receipt_date,
			total,
			extraction.payment_method,
			extraction.reference_number,
			JSON.stringify(lineItems),
			receiptId,
			userId
		).run();

		await syncReceiptExpenseTransaction(env, receiptId, userId);
	} catch (error: any) {
		await env.DB.prepare(
			"UPDATE receipts SET ocr_status = 'failed', ocr_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
		).bind(error.message || 'OCR processing failed', receiptId, userId).run();
	}
}
