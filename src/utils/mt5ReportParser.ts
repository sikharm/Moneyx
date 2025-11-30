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

  // Find and parse trading data from MT5 reports
  // MT5 reports can have different formats:
  // Format A: Deals table with "direction" column (in/out) - count "out" rows
  // Format B: Positions table with "position", "symbol", "type", "volume", "profit" columns
  let totalLots = 0;
  let totalTrades = 0;
  const processedPositionIds = new Set<string>();

  // Debug logging
  console.log('=== MT5 Report Parser Debug ===');

  const tables = doc.querySelectorAll('table');
  console.log(`Found ${tables.length} tables in document`);

  // Try Format A: Look for Deals table with "direction" column
  let dealsTable: Element | null = null;
  let useDealsFormat = false;

  for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
    const table = tables[tableIdx];
    const headerRow = table.querySelector('tr');
    if (headerRow) {
      const headerText = headerRow.textContent?.toLowerCase() || '';
      // Deals table has: Time, Deal, Symbol, Type, Direction, Volume, Price, Order
      if (headerText.includes('direction') && headerText.includes('volume')) {
        dealsTable = table;
        useDealsFormat = true;
        console.log(`Found Deals table (Format A) at Table ${tableIdx}`);
        break;
      }
    }
  }

  // Parse Deals format (Format A)
  if (useDealsFormat && dealsTable) {
    const rows = dealsTable.querySelectorAll('tr');
    console.log(`Deals table has ${rows.length} rows`);

    let headerIndexes = { direction: -1, volume: -1, order: -1 };

    for (const row of rows) {
      const cells = row.querySelectorAll('td, th');
      const cellTexts = Array.from(cells).map(c => c.textContent?.trim().toLowerCase() || '');
      
      if (cellTexts.includes('direction')) {
        headerIndexes.direction = cellTexts.findIndex(t => t === 'direction');
        headerIndexes.volume = cellTexts.findIndex(t => t === 'volume');
        headerIndexes.order = cellTexts.findIndex(t => t === 'order');
        console.log('Format A - Header indexes:', headerIndexes);
        break;
      }
    }

    if (headerIndexes.direction >= 0 && headerIndexes.volume >= 0) {
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length <= Math.max(headerIndexes.direction, headerIndexes.volume)) continue;

        const direction = cells[headerIndexes.direction]?.textContent?.trim().toLowerCase();
        const volumeText = cells[headerIndexes.volume]?.textContent?.trim() || '';
        const orderId = headerIndexes.order >= 0 ? cells[headerIndexes.order]?.textContent?.trim() || '' : '';

        if (direction === 'out') {
          if (orderId && processedPositionIds.has(orderId)) continue;
          if (orderId) processedPositionIds.add(orderId);

          const volume = parseNumber(volumeText);
          if (volume > 0) {
            totalLots += volume;
            totalTrades++;
            console.log(`Format A: Volume=${volume}, Order=${orderId}`);
          }
        }
      }
    }
  }

  // Try Format B: Positions table (no direction column)
  // Header: Time | Position | Symbol | Type | Volume | Price | S / L | T / P | Time | Price | Commission | Swap | Profit
  if (totalLots === 0 && totalTrades === 0) {
    console.log('Trying Format B (Positions table)...');
    
    for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
      const table = tables[tableIdx];
      const rows = table.querySelectorAll('tr');
      
      let headerIndexes = { position: -1, volume: -1, profit: -1, symbol: -1 };
      let headerRowIdx = -1;

      // Find header row
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const cells = rows[rowIdx].querySelectorAll('td, th');
        const cellTexts = Array.from(cells).map(c => c.textContent?.trim().toLowerCase() || '');
        
        // Look for Positions table header
        if (cellTexts.includes('position') && cellTexts.includes('volume') && cellTexts.includes('profit')) {
          headerIndexes.position = cellTexts.findIndex(t => t === 'position');
          headerIndexes.volume = cellTexts.findIndex(t => t === 'volume');
          headerIndexes.profit = cellTexts.lastIndexOf('profit'); // Use last "profit" column
          headerIndexes.symbol = cellTexts.findIndex(t => t === 'symbol');
          headerRowIdx = rowIdx;
          console.log(`Format B - Found header at Table ${tableIdx}, Row ${rowIdx}:`, headerIndexes);
          console.log('Header:', cellTexts.join(' | '));
          break;
        }
      }

      if (headerRowIdx >= 0 && headerIndexes.volume >= 0) {
        // Parse data rows after header
        for (let rowIdx = headerRowIdx + 1; rowIdx < rows.length; rowIdx++) {
          const cells = rows[rowIdx].querySelectorAll('td');
          if (cells.length < headerIndexes.volume + 1) continue;

          const positionId = cells[headerIndexes.position]?.textContent?.trim() || '';
          const volumeText = cells[headerIndexes.volume]?.textContent?.trim() || '';
          const profitText = headerIndexes.profit >= 0 ? cells[headerIndexes.profit]?.textContent?.trim() || '' : '';
          const symbol = headerIndexes.symbol >= 0 ? cells[headerIndexes.symbol]?.textContent?.trim() || '' : '';

          // Skip empty rows, header-like rows, and summary rows
          if (!positionId || positionId.toLowerCase() === 'position') continue;
          if (positionId.toLowerCase().includes('total') || positionId.toLowerCase().includes('balance')) continue;
          
          // Must be a numeric position ID
          if (!/^\d+$/.test(positionId)) continue;

          // Skip if already processed
          if (processedPositionIds.has(positionId)) continue;
          processedPositionIds.add(positionId);

          const volume = parseNumber(volumeText);
          const profit = parseNumber(profitText);

          // Valid trade: has volume and has a profit value (can be 0, positive, or negative)
          if (volume > 0) {
            totalLots += volume;
            totalTrades++;
            console.log(`Format B: Position=${positionId}, Symbol=${symbol}, Volume=${volume}, Profit=${profit}`);
          }
        }

        if (totalTrades > 0) {
          console.log(`Format B parsed ${totalTrades} trades from Table ${tableIdx}`);
          break;
        }
      }
    }
  }

  // Fallback: Look for "out" direction in any table
  if (totalLots === 0 && totalTrades === 0) {
    console.log('Using fallback method...');
    const rows = doc.querySelectorAll('tr');
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length < 6) continue;

      const cellTexts = Array.from(cells).map(c => c.textContent?.trim().toLowerCase() || '');
      const directionIdx = cellTexts.findIndex(t => t === 'out');
      
      if (directionIdx >= 0) {
        for (let i = Math.max(0, directionIdx - 2); i <= Math.min(cells.length - 1, directionIdx + 2); i++) {
          const text = cells[i]?.textContent?.trim() || '';
          if (/^\d+\.\d{2}$/.test(text)) {
            const volume = parseFloat(text);
            if (volume > 0 && volume <= 100) {
              totalLots += volume;
              totalTrades++;
              console.log(`Fallback: Found volume ${volume}`);
              break;
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
