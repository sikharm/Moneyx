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
        // Look for the next cell with a bold value
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
    // Remove spaces, replace comma with dot for decimals
    const cleaned = value.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Extract main values
  const balanceStr = extractValue('Balance:');
  const equityStr = extractValue('Equity:');
  const grossProfitStr = extractValue('Gross Profit:');
  const grossLossStr = extractValue('Gross Loss:');
  const profitFactorStr = extractValue('Profit Factor:');

  const balance = parseNumber(balanceStr);
  const equity = parseNumber(equityStr);
  const grossProfit = parseNumber(grossProfitStr);
  const grossLoss = parseNumber(grossLossStr);
  const netProfit = grossProfit + grossLoss; // grossLoss is usually negative
  const profitFactor = parseNumber(profitFactorStr) || null;

  // Store raw summary
  rawSummary.balance = balance;
  rawSummary.equity = equity;
  rawSummary.grossProfit = grossProfit;
  rawSummary.grossLoss = grossLoss;
  rawSummary.netProfit = netProfit;
  if (profitFactor !== null) rawSummary.profitFactor = profitFactor;

  // Find and parse the Deals section specifically
  // MT5 reports have sections: Positions, Orders, Deals
  // We only want to count lots from the Deals section with "out" direction
  let totalLots = 0;
  let totalTrades = 0;
  const processedOrderIds = new Set<string>();

  // Debug logging
  console.log('=== MT5 Report Parser Debug ===');

  // Find all tables and look for the Deals section
  const tables = doc.querySelectorAll('table');
  let dealsTable: Element | null = null;
  let dealsTableMethod = '';

  console.log(`Found ${tables.length} tables in document`);

  // Method 1: Look for a row header containing "Deals"
  for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
    const table = tables[tableIdx];
    const rows = table.querySelectorAll('tr');
    for (const row of rows) {
      const headerText = row.textContent?.trim() || '';
      // Look for "Deals" section header - typically bold text
      if (headerText.toLowerCase() === 'deals' || 
          (headerText.toLowerCase().includes('deals') && row.querySelector('b'))) {
        // Found the Deals header, the table containing this or the next table is our target
        dealsTable = table;
        dealsTableMethod = `Method 1 (header text) - Table ${tableIdx}`;
        console.log(`Found Deals table via ${dealsTableMethod}`);
        break;
      }
    }
    if (dealsTable) break;
  }

  // Method 2: If no explicit Deals header found, look for table with Deal column header
  if (!dealsTable) {
    for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
      const table = tables[tableIdx];
      const headerRow = table.querySelector('tr');
      if (headerRow) {
        const headerText = headerRow.textContent?.toLowerCase() || '';
        // Deals table typically has columns: Time, Deal, Symbol, Type, Direction, Volume, Price, Order
        if (headerText.includes('deal') && headerText.includes('direction') && headerText.includes('volume')) {
          dealsTable = table;
          dealsTableMethod = `Method 2 (column headers) - Table ${tableIdx}`;
          console.log(`Found Deals table via ${dealsTableMethod}`);
          break;
        }
      }
    }
  }

  // Method 3: Look for table with "Time" and "Volume" and has "out" in rows
  if (!dealsTable) {
    for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
      const table = tables[tableIdx];
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        const headerText = firstRow.textContent?.toLowerCase() || '';
        if (headerText.includes('time') && headerText.includes('volume')) {
          // Check if this table has "out" direction rows
          const hasOutRows = Array.from(table.querySelectorAll('td')).some(
            td => td.textContent?.trim().toLowerCase() === 'out'
          );
          if (hasOutRows) {
            dealsTable = table;
            dealsTableMethod = `Method 3 (time+volume+out) - Table ${tableIdx}`;
            console.log(`Found Deals table via ${dealsTableMethod}`);
            break;
          }
        }
      }
    }
  }

  // Parse the Deals table
  if (dealsTable) {
    const rows = dealsTable.querySelectorAll('tr');
    console.log(`Deals table has ${rows.length} rows`);

    let headerIndexes = {
      direction: -1,
      volume: -1,
      order: -1,
    };

    // First, find the header row and column indexes
    for (const row of rows) {
      const cells = row.querySelectorAll('td, th');
      const cellTexts = Array.from(cells).map(c => c.textContent?.trim().toLowerCase() || '');
      
      // Check if this is a header row
      if (cellTexts.includes('direction') || cellTexts.includes('volume')) {
        headerIndexes.direction = cellTexts.findIndex(t => t === 'direction');
        headerIndexes.volume = cellTexts.findIndex(t => t === 'volume');
        headerIndexes.order = cellTexts.findIndex(t => t === 'order');
        console.log('Header indexes found:', headerIndexes);
        console.log('Header row:', cellTexts.join(' | '));
        break;
      }
    }

    // If we found the column indexes, parse data rows
    if (headerIndexes.direction >= 0 && headerIndexes.volume >= 0) {
      let rowCount = 0;
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length <= headerIndexes.direction || cells.length <= headerIndexes.volume) continue;

        const direction = cells[headerIndexes.direction]?.textContent?.trim().toLowerCase();
        const volumeText = cells[headerIndexes.volume]?.textContent?.trim() || '';
        const orderId = headerIndexes.order >= 0 && cells[headerIndexes.order] 
          ? cells[headerIndexes.order].textContent?.trim() || ''
          : '';

        // Only count "out" direction (closed trades)
        if (direction === 'out') {
          rowCount++;
          // Skip if we already processed this order (prevent duplicates)
          if (orderId && processedOrderIds.has(orderId)) {
            console.log(`Row ${rowCount}: SKIPPED - duplicate order ${orderId}`);
            continue;
          }
          if (orderId) {
            processedOrderIds.add(orderId);
          }

          // Parse volume
          const volume = parseNumber(volumeText);
          if (volume > 0) {
            totalLots += volume;
            totalTrades++;
            console.log(`Row ${rowCount}: Direction=${direction}, Volume=${volumeText} (${volume}), Order=${orderId} - COUNTED`);
          } else {
            console.log(`Row ${rowCount}: Direction=${direction}, Volume=${volumeText} - SKIPPED (zero volume)`);
          }
        }
      }
    } else {
      console.log('Could not find header indexes - direction or volume column missing');
    }
  } else {
    console.log('No Deals table found using any method');
  }

  // Fallback: If no Deals table found or no data parsed, use old method but be more careful
  if (totalLots === 0 && totalTrades === 0) {
    console.log('Using fallback method to find trades...');
    const rows = doc.querySelectorAll('tr');
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length < 6) continue;

      // Look for rows with "out" in direction column
      const cellTexts = Array.from(cells).map(c => c.textContent?.trim().toLowerCase() || '');
      const directionIdx = cellTexts.findIndex(t => t === 'out');
      
      if (directionIdx >= 0 && directionIdx < cells.length - 1) {
        // Volume is typically right before or after direction column
        // Try to find a valid volume value (small decimal number)
        for (let i = Math.max(0, directionIdx - 2); i <= Math.min(cells.length - 1, directionIdx + 2); i++) {
          const text = cells[i]?.textContent?.trim() || '';
          // Volume format: X.XX (e.g., 0.01, 0.10, 1.00)
          if (/^\d+\.\d{2}$/.test(text)) {
            const volume = parseFloat(text);
            // Valid lot sizes are typically between 0.01 and 100
            if (volume > 0 && volume <= 100) {
              totalLots += volume;
              totalTrades++;
              console.log(`Fallback: Found trade with volume ${volume}`);
              break; // Only count once per row
            }
          }
        }
      }
    }
  }

  console.log(`=== Final Result: ${totalTrades} trades, ${totalLots} lots ===`);

  // Convert cent lots to standard lots if this is a cent account
  // Cent accounts have lots that are 100x smaller (1 cent lot = 0.01 standard lot)
  if (isCentAccount) {
    totalLots = totalLots / 100;
  }

  // Try to extract date range from report title/header
  let reportPeriodStart: string | null = null;
  let reportPeriodEnd: string | null = null;
  
  const titleElement = doc.querySelector('title');
  const headerText = titleElement?.textContent || doc.body.textContent || '';
  
  // Look for date patterns like "2024.01.01 - 2024.12.31"
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
