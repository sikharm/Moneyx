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

export const parseMT5Report = (htmlContent: string): ParsedReportData => {
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

  // Count total lots from trade rows
  // Look for rows with "out" direction (closed trades)
  let totalLots = 0;
  let totalTrades = 0;
  
  const rows = doc.querySelectorAll('tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
      // Check if this is a trade row by looking for "out" or specific patterns
      const directionCell = Array.from(cells).find(c => 
        c.textContent?.trim().toLowerCase() === 'out'
      );
      
      if (directionCell) {
        totalTrades++;
        // Volume is typically in a specific column - look for numeric values that could be lots
        cells.forEach(cell => {
          const text = cell.textContent?.trim() || '';
          // Lot sizes are typically small numbers like 0.01, 0.10, 1.00
          if (/^\d+\.\d{2}$/.test(text)) {
            const lotValue = parseFloat(text);
            if (lotValue > 0 && lotValue < 1000) {
              // Likely a lot size
              totalLots += lotValue;
            }
          }
        });
      }
    }
  });

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
