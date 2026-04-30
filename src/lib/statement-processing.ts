export interface ExtractedStatementTransaction {
  txDate: string;
  description: string;
  amount: number;
  direction: 'debit' | 'credit';
  balance: number | null;
  reference: string | null;
  counterparty: string | null;
  rawLine: string | null;
  is_charge?: boolean;
  temp_id?: number;
  parent_temp_id?: number;
}

export interface CategorizedStatementTransaction {
  category: string;
  confidence: number;
  reason: string;
  method: 'rule' | 'ai';
}

interface StatementAiCategorization {
  category?: string;
  confidence?: number;
  reason?: string;
}

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

function cleanAmount(input: unknown): number {
  const text = String(input ?? '').replace(/,/g, '').trim();
  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

function normalizeDate(input: unknown): string {
  const value = String(input ?? '').trim();
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
    const alt = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    if (!Number.isNaN(alt.getTime())) {
      return alt.toISOString();
    }
  }

  return new Date().toISOString();
}

function inferDirection(description: string, amount: number, hint?: unknown): 'debit' | 'credit' {
  const loweredHint = String(hint ?? '').toLowerCase();
  if (loweredHint === 'debit' || loweredHint === 'credit') {
    return loweredHint;
  }

  if (String(hint ?? '').includes('-')) {
    return 'debit';
  }

  const loweredDescription = description.toLowerCase();
  if (
    loweredDescription.includes('received') ||
    loweredDescription.includes('deposit') ||
    loweredDescription.includes('reversal') ||
    loweredDescription.includes('from')
  ) {
    return 'credit';
  }

  if (
    loweredDescription.includes('sent to') ||
    loweredDescription.includes('paybill') ||
    loweredDescription.includes('buy goods') ||
    loweredDescription.includes('withdraw') ||
    loweredDescription.includes('airtime')
  ) {
    return 'debit';
  }

  return amount < 0 ? 'debit' : 'credit';
}

export function categorizeByRule(tx: ExtractedStatementTransaction): CategorizedStatementTransaction {
  const text = `${tx.description} ${tx.counterparty || ''}`.toLowerCase();

  if (text.includes('airtime') || text.includes('bundles')) {
    return { category: 'Airtime', confidence: 0.95, reason: 'Keyword match: airtime/bundles', method: 'rule' };
  }
  if (text.includes('paybill') || text.includes('kplc') || text.includes('water') || text.includes('utility')) {
    return { category: 'Bills', confidence: 0.9, reason: 'Keyword match: utility/paybill', method: 'rule' };
  }
  if (text.includes('salary') || text.includes('payroll')) {
    return { category: 'Salary', confidence: 0.95, reason: 'Keyword match: salary/payroll', method: 'rule' };
  }
  if (text.includes('withdraw') || text.includes('atm')) {
    return { category: 'Cash Withdrawal', confidence: 0.92, reason: 'Keyword match: cash withdrawal', method: 'rule' };
  }
  if (text.includes('fuel') || text.includes('uber') || text.includes('bolt') || text.includes('matatu') || text.includes('taxi')) {
    return { category: 'Transport', confidence: 0.88, reason: 'Keyword match: transport', method: 'rule' };
  }
  if (text.includes('restaurant') || text.includes('food') || text.includes('cafe') || text.includes('hotel')) {
    return { category: 'Food', confidence: 0.85, reason: 'Keyword match: food/hospitality', method: 'rule' };
  }
  if (text.includes('rent') || text.includes('house')) {
    return { category: 'Rent', confidence: 0.9, reason: 'Keyword match: rent/housing', method: 'rule' };
  }
  if (text.includes('bank transfer') || text.includes('received from')) {
    return { category: 'Transfer', confidence: 0.75, reason: 'Keyword match: transfer', method: 'rule' };
  }
  if (text.includes('charge') || text.includes('fee')) {
    return { category: 'Transaction Fee', confidence: 0.98, reason: 'Keyword match: charge/fee', method: 'rule' };
  }
  if (text.includes('m-shwari') || text.includes('mshwari')) {
    return { category: 'Savings/Loan', confidence: 0.9, reason: 'Keyword match: M-Shwari', method: 'rule' };
  }
  if (text.includes('fuliza')) {
    return { category: 'Loan', confidence: 0.9, reason: 'Keyword match: Fuliza', method: 'rule' };
  }
  if (text.includes('buy goods') || text.includes('till')) {
    return { category: 'Shopping', confidence: 0.85, reason: 'Keyword match: Buy Goods/Till', method: 'rule' };
  }
  if (text.includes('agent withdrawal')) {
    return { category: 'Cash Withdrawal', confidence: 0.95, reason: 'Keyword match: agent withdrawal', method: 'rule' };
  }
  if (text.includes('kplc') || text.includes('token') || text.includes('electricity')) {
    return { category: 'Bills', confidence: 0.98, reason: 'Keyword match: KPLC', method: 'rule' };
  }
  if (text.includes('zuku') || text.includes('safaricom home') || text.includes('internet') || text.includes('wifi')) {
    return { category: 'Bills', confidence: 0.95, reason: 'Keyword match: Internet', method: 'rule' };
  }
  if (text.includes('nhif') || text.includes('nssf') || text.includes('tax') || text.includes('kra')) {
    return { category: 'Bills', confidence: 0.95, reason: 'Keyword match: Government/Tax', method: 'rule' };
  }
  if (text.includes('ebp') || text.includes('equitel') || text.includes('bank')) {
    return { category: 'Transfer', confidence: 0.85, reason: 'Keyword match: Bank/Transfer', method: 'rule' };
  }
  if (text.includes('airtime') || text.includes('top up')) {
    return { category: 'Bills', confidence: 0.98, reason: 'Keyword match: Airtime', method: 'rule' };
  }
  if (text.includes('paybill') || text.includes('business no')) {
    return { category: 'Bills', confidence: 0.85, reason: 'Keyword match: Paybill', method: 'rule' };
  }
  if (text.includes('pochi') || text.includes('la biashara')) {
    return { category: 'Shopping', confidence: 0.85, reason: 'Keyword match: Pochi', method: 'rule' };
  }
  if (text.includes('m-pesa g2')) {
    return { category: 'Transfer', confidence: 0.8, reason: 'Keyword match: M-PESA G2', method: 'rule' };
  }
  if (text.includes('sacco')) {
    return { category: 'Bills', confidence: 0.9, reason: 'Keyword match: SACCO', method: 'rule' };
  }
  if (text.includes('globalpay') || text.includes('linode') || text.includes('akamai')) {
    return { category: 'Bills', confidence: 0.95, reason: 'Keyword match: GlobalPay/Cloud', method: 'rule' };
  }
  if (text.includes('commission')) {
    return { category: 'Income', confidence: 0.9, reason: 'Keyword match: Commission', method: 'rule' };
  }
  if (text.includes('customer transfer to -')) {
    return { category: 'Transfer', confidence: 0.9, reason: 'Pattern match: Customer Transfer', method: 'rule' };
  }
  if (text.includes('pay bill online to')) {
    return { category: 'Bills', confidence: 0.9, reason: 'Pattern match: Pay Bill Online', method: 'rule' };
  }
  if (text.includes('od loan') || text.includes('loan repayment')) {
    return { category: 'Loan', confidence: 0.95, reason: 'Keyword match: OD Loan/Repayment', method: 'rule' };
  }
  if (text.includes('m-shwari loan') || text.includes('mshwari loan')) {
    return { category: 'Loan', confidence: 0.95, reason: 'Keyword match: M-Shwari Loan', method: 'rule' };
  }
  if (text.includes('sent to') || text.includes('customer transfer to')) {
    return { category: 'Transfer', confidence: 0.9, reason: 'Keyword match: sent/transfer', method: 'rule' };
  }
  if (text.includes('received from')) {
    return { category: 'Income', confidence: 0.9, reason: 'Keyword match: received from', method: 'rule' };
  }

  if (tx.direction === 'credit') {
    return { category: 'Income', confidence: 0.6, reason: 'Default rule for incoming funds', method: 'rule' };
  }

  return { category: 'Uncategorized', confidence: 0.2, reason: 'No matching rule', method: 'rule' };
}

function normalizeExtractedTx(tx: any): ExtractedStatementTransaction {
  const description = String(tx.description ?? tx.narration ?? tx.details ?? '').trim();
  const amount = cleanAmount(tx.amount ?? tx.transactionAmount);
  const direction = inferDirection(description, amount, tx.direction ?? tx.drCr);

  return {
    txDate: normalizeDate(tx.txDate ?? tx.date ?? tx.transactionDate),
    description,
    amount,
    direction,
    balance: tx.balance === undefined || tx.balance === null ? null : cleanAmount(tx.balance),
    reference: tx.reference ? String(tx.reference) : null,
    counterparty: tx.counterparty ? String(tx.counterparty) : null,
    rawLine: tx.rawLine ? String(tx.rawLine) : null
  };
}

import { PDFParse } from 'pdf-parse';

/**
 * Local extraction of transactions from M-Pesa PDF bytes.
 */
export async function extractMpesaTransactions(env: any, fileBytes: ArrayBuffer, password: string): Promise<ExtractedStatementTransaction[]> {
  try {
    console.log('Extracting text from PDF (with decryption)...');
    const parser = new PDFParse({ data: fileBytes as any, password });
    const result = await parser.getText();
    const text = result.text;
    
    if (!text) {
      console.error('No text extracted from PDF.');
      return [];
    }

    console.log('Parsing transactions from text...');
    const transactions: ExtractedStatementTransaction[] = [];
    
    // Updated regex for M-Pesa transactions: [Receipt] [Date] [Time] [Details...] [Status] [Amount] [Balance]
    // The amount can be negative (debit) or positive (credit)
    const txRegex = /([A-Z0-9]{10})\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([\s\S]+?)\s+(Completed|Failed)\s+(-?[\d,.]+)\s+([\d,.]+)/g;
    
    let match;
    let tempIdTracker = 0;
    while ((match = txRegex.exec(text)) !== null) {
      const receipt = match[1];
      const dateStr = `${match[2]} ${match[3]}`;
      const detailRaw = match[4].replace(/\s+/g, ' ').trim();
      const status = match[5];
      const amountRaw = match[6].replace(/,/g, '');
      const balance = cleanAmount(match[7]);

      if (status !== 'Completed') continue;

      const amount = parseFloat(amountRaw);
      const isNegative = amount < 0;
      const absAmount = Math.abs(amount);

      transactions.push({
        txDate: normalizeDate(dateStr),
        description: detailRaw,
        amount: absAmount,
        direction: isNegative ? 'debit' : 'credit',
        balance: balance,
        reference: receipt,
        counterparty: null,
        rawLine: match[0],
        temp_id: tempIdTracker++,
        is_charge: false
      });
    }

    // Correlation logic: Group transactions by reference and identify charges
    const byRef = new Map<string, ExtractedStatementTransaction[]>();
    for (const tx of transactions) {
      if (tx.reference) {
        if (!byRef.has(tx.reference)) byRef.set(tx.reference, []);
        byRef.get(tx.reference)!.push(tx);
      }
    }

    for (const [ref, group] of byRef.entries()) {
      if (group.length > 1) {
        // Sort by amount descending to find the "Main" transaction easily
        // Charges are typically smaller
        group.sort((a, b) => b.amount - a.amount);
        const main = group[0];
        
        for (let i = 1; i < group.length; i++) {
          const sub = group[i];
          const loweredDesc = sub.description.toLowerCase();
          if (loweredDesc.includes('charge') || loweredDesc.includes('fee') || loweredDesc.includes('overdraw') || sub.amount < main.amount) {
            sub.is_charge = true;
            sub.parent_temp_id = main.temp_id;
          }
        }
      }
    }

    console.log(`Extracted ${transactions.length} transactions.`);
    return transactions;
  } catch (error: any) {
    console.error('Extraction failed:', error.message);
    throw new Error(`Failed to extract transactions: ${error.message}`);
  }
}

/**
 * Categorizes transactions using Cloudflare Workers AI.
 */
export async function categorizeWithAiFallback(env: any, rows: ExtractedStatementTransaction[]): Promise<CategorizedStatementTransaction[]> {
  const categorized = rows.map(categorizeByRule);
  
  // Group transactions by description and direction to reduce AI load
  // Large statements (3k+ tx) often have many identical transaction types
  const needsAiGroups = new Map<string, { description: string, direction: string, indices: number[] }>();
  
  categorized.forEach((item, index) => {
    if (item.category === 'Uncategorized') {
      const tx = rows[index];
      const key = `${tx.description}|${tx.direction}`;
      if (!needsAiGroups.has(key)) {
        needsAiGroups.set(key, { 
          description: tx.description, 
          direction: tx.direction, 
          indices: [] 
        });
      }
      needsAiGroups.get(key)!.indices.push(index);
    }
  });

  if (needsAiGroups.size === 0 || !env.AI) {
    return categorized;
  }

  const uniqueItems = Array.from(needsAiGroups.values());
  const BATCH_SIZE = 30; // Balanced for parallelism
  const batchPromises = [];
  
  for (let i = 0; i < uniqueItems.length; i += BATCH_SIZE) {
    const batch = uniqueItems.slice(i, i + BATCH_SIZE);
    
    // Create a promise for each batch for parallel execution
    batchPromises.push((async () => {
      console.log(`Starting parallel AI batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
      try {
        // Truncate descriptions and remove direction to save tokens
        const descriptions = batch.map(item => item.description.substring(0, 60));

        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            { role: 'system', content: 'Categorize into: Food, Transport, Bills, Rent, Salary, Transfer, Shopping, Health, Entertainment, Education, Others. Return ONLY JSON: {"TxDesc": "Category"}. No preamble.' },
            { role: 'user', content: `Descriptions: ${JSON.stringify(descriptions)}` }
          ]
        });

        if (!response?.response) return [];

        const rawResponse = response.response;
        const mapping: Record<string, string> = {};
        
        // Robust Extraction
        try {
            const start = rawResponse.indexOf('{');
            const end = rawResponse.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                const aiData = JSON.parse(rawResponse.substring(start, end + 1));
                if (aiData?.c) {
                    batch.forEach((item, idx) => { if (aiData.c[idx]) mapping[item.description] = aiData.c[idx]; });
                } else {
                    Object.assign(mapping, aiData);
                }
            }
        } catch (e) {
            // Regex Fallback
            const regex = /"([^"]+)":\s*"([^"]+)"/g;
            let match;
            while ((match = regex.exec(rawResponse)) !== null) {
                mapping[match[1]] = match[2];
            }
        }

        return batch.map(item => {
            const cat = mapping[item.description] || mapping[item.description.substring(0, 60)];
            return { description: item.description, category: cat || null };
        });
      } catch (err: any) {
        console.error('Parallel AI batch failed:', err.message);
        return [];
      }
    })());
  }

  // Await all AI calls in parallel
  const allResults = await Promise.all(batchPromises);
  
  // Flatten and Apply
  allResults.flat().forEach(res => {
    if (!res.category) return;
    const group = Array.from(needsAiGroups.values()).find(g => g.description === res.description);
    if (group) {
        const categoryResult: CategorizedStatementTransaction = {
            category: res.category,
            confidence: 0.85,
            reason: 'Categorized via Parallel AI',
            method: 'ai'
        };
        group.indices.forEach(idx => { categorized[idx] = categoryResult; });
    }
  });

  return categorized;
}

export async function processMpesaStatementUpload(params: {
  env: any;
  uploadId: number;
  userId: number;
  fileKey: string;
  password: string;
}) {
  const { env, uploadId, userId, fileKey, password } = params;

  try {
    const object = await env.BUCKET.get(fileKey);
    if (!object) {
      throw new Error('Uploaded statement file was not found in storage.');
    }

    const fileBytes = await object.arrayBuffer();

    // Clear existing transactions/categories for this upload to avoid duplicates on reprocess
    await env.DB.prepare('DELETE FROM transaction_categories WHERE transaction_id IN (SELECT id FROM statement_transactions WHERE upload_id = ?)').bind(uploadId).run();
    await env.DB.prepare('DELETE FROM statement_transactions WHERE upload_id = ?').bind(uploadId).run();

    const extracted = await extractMpesaTransactions(env, fileBytes, password);
    const categorized = await categorizeWithAiFallback(env, extracted);

    console.log(`Starting DB batch insertion for ${extracted.length} transactions...`);

    // Prepare all transaction insertions (Pass 1: Insert without parent_id)
    const txInsertStmts = extracted.map(tx => env.DB.prepare(`
      INSERT INTO statement_transactions (
        upload_id, user_id, external_ref, tx_date, description, amount, direction, balance, counterparty, raw_line, is_charge, parent_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
      RETURNING id
    `).bind(
      uploadId,
      userId,
      tx.reference,
      tx.txDate,
      tx.description,
      tx.amount,
      tx.direction,
      tx.balance,
      tx.counterparty,
      tx.rawLine,
      tx.is_charge ? 1 : 0
    ));

    // Execute transaction as a single batch for speed
    // Split into chunks of 100 to avoid D1 statement limits if needed, but 3k should fit in a few batches
    const TX_BATCH_SIZE = 100;
    const dbIdMap = new Map<number, number>();
    let categorizedCount = 0;

    for (let i = 0; i < txInsertStmts.length; i += TX_BATCH_SIZE) {
      const chunk = txInsertStmts.slice(i, i + TX_BATCH_SIZE);
      const results: any[] = await env.DB.batch(chunk);
      
      results.forEach((res, idx) => {
        const globalIdx = i + idx;
        const tx = extracted[globalIdx];
        const dbId = res.results[0]?.id;
        if (dbId && tx.temp_id !== undefined) {
          dbIdMap.set(tx.temp_id, dbId);
        }
      });
    }

    // Pass 2: Insert categories and link parent_id
    const catInsertStmts = [];
    const parentUpdateStmts = [];

    for (let i = 0; i < extracted.length; i++) {
      const tx = extracted[i];
      const cat = categorized[i];
      const dbId = dbIdMap.get(tx.temp_id!);

      if (!dbId) continue;

      // Category insertion
      catInsertStmts.push(env.DB.prepare(`
        INSERT INTO transaction_categories (
          transaction_id, category, confidence, method, reason, is_active
        ) VALUES (?, ?, ?, ?, ?, 1)
      `).bind(
        dbId,
        cat.category,
        cat.confidence,
        cat.method,
        cat.reason
      ));

      if (cat.category !== 'Uncategorized') {
        categorizedCount += 1;
      }

      // Parent ID linkage (if it's a charge)
      if (tx.parent_temp_id !== undefined) {
        const parentDbId = dbIdMap.get(tx.parent_temp_id);
        if (parentDbId) {
          parentUpdateStmts.push(env.DB.prepare(`
            UPDATE statement_transactions SET parent_id = ? WHERE id = ?
          `).bind(parentDbId, dbId));
        }
      }
    }

    // Execute category insertions in batches
    for (let i = 0; i < catInsertStmts.length; i += TX_BATCH_SIZE) {
      await env.DB.batch(catInsertStmts.slice(i, i + TX_BATCH_SIZE));
    }

    // Execute parent_id updates in batches
    if (parentUpdateStmts.length > 0) {
      for (let i = 0; i < parentUpdateStmts.length; i += TX_BATCH_SIZE) {
        await env.DB.batch(parentUpdateStmts.slice(i, i + TX_BATCH_SIZE));
      }
    }

    await env.DB.prepare(`
      UPDATE statement_uploads
      SET status = 'completed',
          processed_at = ?,
          total_transactions = ?,
          categorized_transactions = ?,
          error_message = NULL
      WHERE id = ? AND user_id = ?
    `).bind(
      new Date().toISOString(),
      extracted.length,
      categorizedCount,
      uploadId,
      userId
    ).run();
  } catch (error: any) {
    await env.DB.prepare(`
      UPDATE statement_uploads
      SET status = 'failed',
          processed_at = ?,
          error_message = ?
      WHERE id = ? AND user_id = ?
    `).bind(
      new Date().toISOString(),
      error?.message || 'Failed to process statement',
      uploadId,
      userId
    ).run();
  }
}
