export interface ParsedReportData {
  balance: number;
  equity: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  totalLots: number;
  totalTrades: number;
  profitFactor: number | null;
  reportPeriodStart: string | null;
  reportPeriodEnd: string | null;
  rawSummary: Record<string, string | number>;
}

export interface ParseOptions {
  isCentAccount?: boolean;
}

/**
 * MT5 Report Parser - Unified Core Logic
 * 
 * PRIMARY METHOD (MoneyX M1 style):
 * - Look for "Deals" table with "Direction" column
 * - Count rows where direction = "out" (closing trades)
 * - Sum the "Volume" column for total lots
 * - Track by Order ID to avoid duplicates
 * 
 * FALLBACK METHOD:
 * - If no Deals table found, look for "Positions" table
 * - Each row with valid Position ID = 1 trade
 * - Sum Volume column for total lots
 */
export const parseMT5Report = (htmlContent: string, options: ParseOptions = {}): ParsedReportData => {
  const { isCentAccount = false } = options;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const rawSummary: Record<string, string | number> = {};
  
  // Helper to extract value from table cells
  const extractValue = (label: string): string | null => {
    const allTds = doc.querySelectorAll('td');
    for (let i = 0; i < allTds.length; i++) {
      const td = allTds[i];
      if (td.textContent?.trim().toLowerCase().includes(label.toLowerCase())) {
        let sibling = td.nextElementSibling;
        while (sibling) {
          const boldEl = sibling.querySelector('b');
          if (boldEl) {
            return boldEl.textContent?.trim() || null;
          }
          if (sibling.textContent?.trim()) {
            return sibling.textContent.trim();
          }
          sibling = sibling.nextElementSibling;
        }
      }
    }
    return null;
  };

  // Parse numeric value (handles spaces as thousands separators)
  const parseNumber = (value: string | null): number => {
    if (!value) return 0;
    const cleaned = value.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Extract main financial values
  const balance = parseNumber(extractValue('Balance:'));
  const equity = parseNumber(extractValue('Equity:'));
  const grossProfit = parseNumber(extractValue('Gross Profit:'));
  const grossLoss = parseNumber(extractValue('Gross Loss:'));
  const netProfit = grossProfit + grossLoss;
  const profitFactor = parseNumber(extractValue('Profit Factor:')) || null;

  // Store raw summary
  rawSummary.balance = balance;
  rawSummary.equity = equity;
  rawSummary.grossProfit = grossProfit;
  rawSummary.grossLoss = grossLoss;
  rawSummary.netProfit = netProfit;
  if (profitFactor !== null) rawSummary.profitFactor = profitFactor;

  // ============================================
  // CORE TRADING DATA PARSING - UNIFIED LOGIC
  // ============================================
  let totalLots = 0;
  let totalTrades = 0;
  const processedIds = new Set<string>();

  console.log('=== MT5 Report Parser (Unified Core Logic) ===');

  const tables = doc.querySelectorAll('table');
  console.log(`Found ${tables.length} tables`);

  // STEP 1: Find Deals table with "Direction" column (PRIMARY METHOD)
  let dealsTable: Element | null = null;
  
  for (const table of tables) {
    const headerRow = table.querySelector('tr');
    if (headerRow) {
      const headerText = headerRow.textContent?.toLowerCase() || '';
      if (headerText.includes('direction') && headerText.includes('volume')) {
        dealsTable = table;
        console.log('✓ Found Deals table (Primary Method)');
        break;
      }
    }
  }

  // STEP 2: Parse using PRIMARY METHOD (Deals table with Direction)
  if (dealsTable) {
    const rows = dealsTable.querySelectorAll('tr');
    let directionIdx = -1;
    let volumeIdx = -1;
    let orderIdx = -1;

    // Find header indexes
    for (const row of rows) {
      const cells = row.querySelectorAll('td, th');
      const cellTexts = Array.from(cells).map(c => c.textContent?.trim().toLowerCase() || '');
      
      if (cellTexts.includes('direction')) {
        directionIdx = cellTexts.findIndex(t => t === 'direction');
        volumeIdx = cellTexts.findIndex(t => t === 'volume');
        orderIdx = cellTexts.findIndex(t => t === 'order');
        console.log(`Header indexes - Direction: ${directionIdx}, Volume: ${volumeIdx}, Order: ${orderIdx}`);
        break;
      }
    }

    // Parse data rows - count "out" directions only
    if (directionIdx >= 0 && volumeIdx >= 0) {
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length <= Math.max(directionIdx, volumeIdx)) continue;

        const direction = cells[directionIdx]?.textContent?.trim().toLowerCase();
        const volumeText = cells[volumeIdx]?.textContent?.trim() || '';
        const orderId = orderIdx >= 0 ? cells[orderIdx]?.textContent?.trim() || '' : '';

        // Only count "out" trades (closing trades)
        if (direction === 'out') {
          // Skip duplicates by Order ID
          if (orderId && processedIds.has(orderId)) continue;
          if (orderId) processedIds.add(orderId);

          const volume = parseNumber(volumeText);
          if (volume > 0) {
            totalLots += volume;
            totalTrades++;
          }
        }
      }
      console.log(`Primary Method Result: ${totalTrades} trades, ${totalLots.toFixed(2)} lots`);
    }
  }

  // STEP 3: FALLBACK - Look for Positions table if Deals table not found/parsed
  if (totalLots === 0 && totalTrades === 0) {
    console.log('Primary method found no data, trying Fallback (Positions table)...');
    
    for (const table of tables) {
      const rows = table.querySelectorAll('tr');
      let positionIdx = -1;
      let volumeIdx = -1;
      let headerRowIdx = -1;

      // Find header with "position" and "volume"
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td, th');
        const cellTexts = Array.from(cells).map(c => c.textContent?.trim().toLowerCase() || '');
        
        if (cellTexts.includes('position') && cellTexts.includes('volume')) {
          positionIdx = cellTexts.findIndex(t => t === 'position');
          volumeIdx = cellTexts.findIndex(t => t === 'volume');
          headerRowIdx = i;
          console.log(`Found Positions table header at row ${i}`);
          break;
        }
      }

      if (headerRowIdx >= 0 && volumeIdx >= 0) {
        // Parse data rows
        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll('td');
          if (cells.length < volumeIdx + 1) continue;

          const positionId = cells[positionIdx]?.textContent?.trim() || '';
          const volumeText = cells[volumeIdx]?.textContent?.trim() || '';

          // Skip invalid rows
          if (!positionId || !/^\d+$/.test(positionId)) continue;
          if (processedIds.has(positionId)) continue;
          processedIds.add(positionId);

          const volume = parseNumber(volumeText);
          if (volume > 0) {
            totalLots += volume;
            totalTrades++;
          }
        }

        if (totalTrades > 0) {
          console.log(`Fallback Result: ${totalTrades} trades, ${totalLots.toFixed(2)} lots`);
          break;
        }
      }
    }
  }

  console.log(`=== Final: ${totalTrades} trades, ${totalLots.toFixed(2)} lots ===`);

  // Apply cent account conversion for lots
  if (isCentAccount) {
    totalLots = totalLots / 100;
    console.log(`Cent account conversion: ${totalLots.toFixed(4)} standard lots`);
  }

  // Extract date range from report
  let reportPeriodStart: string | null = null;
  let reportPeriodEnd: string | null = null;
  
  const titleElement = doc.querySelector('title');
  const headerText = titleElement?.textContent || doc.body.textContent || '';
  
  const dateRangeMatch = headerText.match(/(\d{4}[.\-\/]\d{2}[.\-\/]\d{2})\s*[-–]\s*(\d{4}[.\-\/]\d{2}[.\-\/]\d{2})/);
  if (dateRangeMatch) {
    reportPeriodStart = dateRangeMatch[1].replace(/[.\-\/]/g, '-');
    reportPeriodEnd = dateRangeMatch[2].replace(/[.\-\/]/g, '-');
  }

  rawSummary.totalLots = totalLots;
  rawSummary.totalTrades = totalTrades;
  rawSummary.isCentAccount = isCentAccount ? 1 : 0;

  return {
    balance,
    equity,
    grossProfit,
    grossLoss,
    netProfit,
    totalLots,
    totalTrades,
    profitFactor,
    reportPeriodStart,
    reportPeriodEnd,
    rawSummary,
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};