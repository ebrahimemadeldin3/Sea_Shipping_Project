export const payments = [
  { id: 'PY-501', customer: 'Bluewave Trading Ltd', amount: '$284,500', date: '2026-07-26', method: 'Bank Transfer', status: 'Paid', reference: 'TRF-8831', invoice: 'INV-2210' },
  { id: 'PY-502', customer: 'Nordica Energy', amount: '$176,200', date: '2026-07-30', method: 'Bank Transfer', status: 'Pending', reference: 'TRF-8844', invoice: 'INV-2211' },
  { id: 'PY-503', customer: 'Meridian Auto Parts', amount: '$412,300', date: '2026-08-01', method: 'Credit', status: 'Processing', reference: 'CRD-5501', invoice: 'INV-2212' },
  { id: 'PY-504', customer: 'Desert Oasis Retail', amount: '$96,400', date: '2026-08-02', method: 'Card', status: 'Paid', reference: 'CARD-0092', invoice: 'INV-2213' },
  { id: 'PY-505', customer: 'Gulf Pharma Group', amount: '$74,900', date: '2026-07-22', method: 'Bank Transfer', status: 'Paid', reference: 'TRF-8819', invoice: 'INV-2208' },
  { id: 'PY-506', customer: 'Harbor Textiles', amount: '$88,600', date: '2026-07-19', method: 'Credit', status: 'Overdue', reference: 'CRD-5480', invoice: 'INV-2204' },
  { id: 'PY-507', customer: 'Crescent Foods', amount: '$58,100', date: '2026-07-31', method: 'Card', status: 'Refunded', reference: 'CARD-0089', invoice: 'INV-2214' },
  { id: 'PY-508', customer: 'Atlas Steelworks', amount: '$142,800', date: '2026-07-20', method: 'Bank Transfer', status: 'Paid', reference: 'TRF-8821', invoice: 'INV-2209' },
  { id: 'PY-509', customer: 'Vantage Logistics', amount: '$44,300', date: '2026-08-03', method: 'Card', status: 'Processing', reference: 'CARD-0095', invoice: 'INV-2215' },
  { id: 'PY-510', customer: 'Titan Commodities', amount: '$198,900', date: '2026-07-27', method: 'Bank Transfer', status: 'Paid', reference: 'TRF-8836', invoice: 'INV-2216' },
  { id: 'PY-511', customer: 'Nile Harvest Co.', amount: '$198,900', date: '2026-07-28', method: 'Bank Transfer', status: 'Pending', reference: 'TRF-8839', invoice: 'INV-2217' },
  { id: 'PY-512', customer: 'Sunrise Beverages', amount: '$96,700', date: '2026-08-01', method: 'Credit', status: 'Paid', reference: 'CRD-5508', invoice: 'INV-2218' },
]

export const invoices = [
  { id: 'INV-2210', customer: 'Bluewave Trading Ltd', amount: '$284,500', issued: '2026-07-20', due: '2026-08-04', status: 'Paid', items: 'Freight SH-2401' },
  { id: 'INV-2211', customer: 'Nordica Energy', amount: '$176,200', issued: '2026-07-22', due: '2026-08-06', status: 'Pending', items: 'Freight SH-2405' },
  { id: 'INV-2212', customer: 'Meridian Auto Parts', amount: '$412,300', issued: '2026-07-23', due: '2026-08-07', status: 'Outstanding', items: 'Freight SH-2403' },
  { id: 'INV-2213', customer: 'Desert Oasis Retail', amount: '$96,400', issued: '2026-07-24', due: '2026-08-08', status: 'Paid', items: 'Freight SH-2404' },
  { id: 'INV-2214', customer: 'Crescent Foods', amount: '$58,100', issued: '2026-07-25', due: '2026-08-09', status: 'Refunded', items: 'Freight SH-2407' },
  { id: 'INV-2215', customer: 'Vantage Logistics', amount: '$44,300', issued: '2026-07-26', due: '2026-08-10', status: 'Outstanding', items: 'Freight SH-2413' },
  { id: 'INV-2216', customer: 'Titan Commodities', amount: '$198,900', issued: '2026-07-27', due: '2026-08-11', status: 'Paid', items: 'Freight SH-2402' },
  { id: 'INV-2217', customer: 'Nile Harvest Co.', amount: '$198,900', issued: '2026-07-28', due: '2026-08-12', status: 'Pending', items: 'Freight SH-2402' },
  { id: 'INV-2218', customer: 'Sunrise Beverages', amount: '$96,700', issued: '2026-07-29', due: '2026-08-13', status: 'Paid', items: 'Freight SH-2414' },
  { id: 'INV-2208', customer: 'Gulf Pharma Group', amount: '$74,900', issued: '2026-07-15', due: '2026-07-29', status: 'Paid', items: 'Freight SH-2408' },
  { id: 'INV-2209', customer: 'Atlas Steelworks', amount: '$142,800', issued: '2026-07-16', due: '2026-07-30', status: 'Paid', items: 'Freight SH-2406' },
  { id: 'INV-2204', customer: 'Harbor Textiles', amount: '$88,600', issued: '2026-07-10', due: '2026-07-24', status: 'Overdue', items: 'Freight SH-2410' },
]

export const paymentMethodSplit = [
  { label: 'Bank Transfer', value: 58 },
  { label: 'Credit', value: 24 },
  { label: 'Card', value: 18 },
]

export const revenueSeries = [
  { month: 'Jan', revenue: 2.1, cost: 1.2 },
  { month: 'Feb', revenue: 2.4, cost: 1.3 },
  { month: 'Mar', revenue: 2.8, cost: 1.4 },
  { month: 'Apr', revenue: 2.6, cost: 1.5 },
  { month: 'May', revenue: 3.2, cost: 1.6 },
  { month: 'Jun', revenue: 3.5, cost: 1.7 },
  { month: 'Jul', revenue: 3.9, cost: 1.8 },
  { month: 'Aug', revenue: 4.2, cost: 1.9 },
]

export const deliverySeries = [
  { month: 'Jan', deliveries: 86 },
  { month: 'Feb', deliveries: 94 },
  { month: 'Mar', deliveries: 108 },
  { month: 'Apr', deliveries: 102 },
  { month: 'May', deliveries: 121 },
  { month: 'Jun', deliveries: 138 },
  { month: 'Jul', deliveries: 149 },
  { month: 'Aug', deliveries: 156 },
]

export const fuelConsumption = [
  { month: 'Jan', consumption: 820 },
  { month: 'Feb', consumption: 780 },
  { month: 'Mar', consumption: 940 },
  { month: 'Apr', consumption: 910 },
  { month: 'May', consumption: 1010 },
  { month: 'Jun', consumption: 1180 },
  { month: 'Jul', consumption: 1260 },
  { month: 'Aug', consumption: 1320 },
]

export const profitTrend = [
  { month: 'Jan', profit: 0.9 },
  { month: 'Feb', profit: 1.1 },
  { month: 'Mar', profit: 1.4 },
  { month: 'Apr', profit: 1.1 },
  { month: 'May', profit: 1.6 },
  { month: 'Jun', profit: 1.8 },
  { month: 'Jul', profit: 2.1 },
  { month: 'Aug', profit: 2.3 },
]

export const customerGrowth = [
  { month: 'Jan', customers: 178 },
  { month: 'Feb', customers: 192 },
  { month: 'Mar', customers: 210 },
  { month: 'Apr', customers: 226 },
  { month: 'May', customers: 244 },
  { month: 'Jun', customers: 268 },
  { month: 'Jul', customers: 291 },
  { month: 'Aug', customers: 312 },
]

export const cargoDistribution = [
  { label: 'Container', value: 42 },
  { label: 'Bulk Dry', value: 24 },
  { label: 'Liquid', value: 18 },
  { label: 'Reefer', value: 10 },
  { label: 'Other', value: 6 },
]

export const fleetUtilization = [
  { label: 'Utilized', value: 68 },
  { label: 'Available', value: 32 },
]

export const portTrafficHeat = {
  labels: ['Wk1', 'Wk2', 'Wk3', 'Wk4'],
  rows: [
    [42, 56, 48, 61],
    [55, 72, 64, 78],
    [48, 63, 58, 71],
    [39, 52, 46, 58],
    [61, 74, 68, 83],
  ],
  yLabels: ['Jebel Ali', 'Shanghai', 'Singapore', 'Rotterdam', 'Busan'],
}
