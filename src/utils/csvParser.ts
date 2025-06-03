// CSV parser utility for real clothing store data
export interface CSVTransaction {
  customer: number;
  itemsBought: number;
  serviceTime: number;
  paymentMethod: 'Cash' | 'Card' | 'Voucher & Card';
  notes?: string;
  cashier: string;
  isBreak?: boolean;
}

export interface ProcessedStoreData {
  dayType: 'weekday' | 'weekend';
  transactions: CSVTransaction[];
  avgServiceTime: number;
  avgItemsPerCustomer: number;
  paymentDistribution: {
    cash: number;
    card: number;
    voucher: number;
  };
  totalCustomers: number;
  cashierBreaks: number;
  staffCount: number;
}

export async function parseCSV(csvContent: string): Promise<CSVTransaction[]> {
  const lines = csvContent.trim().split('\n');
  const dataLines = lines.slice(1); // Skip header line
  
  const transactions: CSVTransaction[] = [];
  
  for (const line of dataLines) {
    const [customerStr, itemsStr, serviceTimeStr, paymentMethod, notes, cashier] = line.split(',');
    
    // Handle break entries
    if (customerStr === 'Break' || !customerStr || customerStr.trim() === '') {
      transactions.push({
        customer: 0,
        itemsBought: 0,
        serviceTime: parseInt(serviceTimeStr) || 0,
        paymentMethod: 'Card',
        notes: notes || 'Break',
        cashier: cashier || '',
        isBreak: true
      });
      continue;
    }
    
    const customer = parseInt(customerStr);
    const itemsBought = parseFloat(itemsStr);
    const serviceTime = parseInt(serviceTimeStr);
    
    if (!isNaN(customer) && !isNaN(itemsBought) && !isNaN(serviceTime)) {
      transactions.push({
        customer,
        itemsBought,
        serviceTime,
        paymentMethod: paymentMethod as 'Cash' | 'Card' | 'Voucher & Card',
        notes,
        cashier,
        isBreak: false
      });
    }
  }
  
  return transactions;
}

export function processStoreData(transactions: CSVTransaction[], dayType: 'weekday' | 'weekend'): ProcessedStoreData {
  const customerTransactions = transactions.filter(t => !t.isBreak);
  const breaks = transactions.filter(t => t.isBreak);
  
  // Calculate averages
  const totalServiceTime = customerTransactions.reduce((sum, t) => sum + t.serviceTime, 0);
  const totalItems = customerTransactions.reduce((sum, t) => sum + t.itemsBought, 0);
  const avgServiceTime = totalServiceTime / customerTransactions.length;
  const avgItemsPerCustomer = totalItems / customerTransactions.length;
  
  // Calculate payment distribution
  const paymentCounts = {
    cash: 0,
    card: 0,
    voucher: 0
  };
  
  customerTransactions.forEach(t => {
    if (t.paymentMethod === 'Cash') {
      paymentCounts.cash++;
    } else if (t.paymentMethod === 'Card') {
      paymentCounts.card++;
    } else if (t.paymentMethod === 'Voucher & Card') {
      paymentCounts.voucher++;
    }
  });
  
  const total = customerTransactions.length;
  const paymentDistribution = {
    cash: paymentCounts.cash / total,
    card: paymentCounts.card / total,
    voucher: paymentCounts.voucher / total
  };
  
  // Count unique cashiers
  const uniqueCashiers = new Set(customerTransactions.map(t => t.cashier)).size;
  
  return {
    dayType,
    transactions: customerTransactions,
    avgServiceTime: Math.round(avgServiceTime),
    avgItemsPerCustomer: Math.round(avgItemsPerCustomer * 10) / 10,
    paymentDistribution,
    totalCustomers: customerTransactions.length,
    cashierBreaks: breaks.length,
    staffCount: uniqueCashiers
  };
}

// Sample function to load and process CSV data
export async function loadStoreData(csvContent: string, dayType: 'weekday' | 'weekend'): Promise<ProcessedStoreData> {
  const transactions = await parseCSV(csvContent);
  return processStoreData(transactions, dayType);
}

// Helper function to convert processed data to simulation parameters
export function dataToSimulationParams(data: ProcessedStoreData): {
  arrivalRate: number;
  serviceTimeRegular: number;
  paymentDistribution: { cash: number; card: number; voucher: number };
} {
  // Convert customers per day to customers per minute for simulation
  // Assuming 8-hour operating day (480 minutes)
  const arrivalRate = data.totalCustomers / 480;
  
  return {
    arrivalRate,
    serviceTimeRegular: data.avgServiceTime,
    paymentDistribution: data.paymentDistribution
  };
}
