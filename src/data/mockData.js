export const mockShipments = [
  {
    id: 'SEA-2026-00128',
    customer: 'Ahmed Mohamed',
    originCountry: 'Egypt',
    originPort: 'Alexandria',
    destinationCountry: 'Italy',
    destinationPort: 'Genoa',
    cargoType: 'Electronics',
    weight: '850 kg',
    quantity: '1',
    containerType: '40ft Standard',
    status: 'IN_TRANSIT',
    estimatedPrice: '$2,450',
    vessel: 'MV Navora Star',
    departureDate: 'October 2, 2026',
    estimatedArrival: 'October 12, 2026',
    timeline: [
      { status: 'Request Submitted', date: 'Sep 30 — 10:32 AM', completed: true },
      { status: 'Request Accepted', date: 'Sep 30 — 3:45 PM', completed: true },
      { status: 'Cargo Received', date: 'Oct 1 — 11:20 AM', completed: true },
      { status: 'Departed Alexandria', date: 'Oct 2 — 8:15 AM', completed: true },
      { status: 'In Transit', date: 'Current Status', completed: false, current: true },
      { status: 'Genoa Port', date: '', completed: false },
      { status: 'Delivered', date: '', completed: false }
    ]
  },
  {
    id: 'SEA-2026-00129',
    customer: 'Ahmed Mohamed',
    originCountry: 'China',
    originPort: 'Shanghai',
    destinationCountry: 'Netherlands',
    destinationPort: 'Rotterdam',
    cargoType: 'Machinery',
    weight: '2,400 kg',
    quantity: '2',
    containerType: '40ft High Cube',
    status: 'PENDING_REVIEW',
    estimatedPrice: '-',
    vessel: '-',
    departureDate: '-',
    estimatedArrival: '-',
    timeline: [
      { status: 'Request Submitted', date: 'Oct 3 — 09:00 AM', completed: true },
      { status: 'Pending Review', date: 'Current Status', completed: false, current: true }
    ]
  }
];

export const getStatusLabel = (status) => {
  const map = {
    'PENDING_REVIEW': 'Pending Review',
    'ACCEPTED': 'Accepted',
    'REJECTED': 'Rejected',
    'PREPARING': 'Preparing',
    'AT_ORIGIN_PORT': 'At Origin Port',
    'IN_TRANSIT': 'In Transit',
    'AT_DESTINATION_PORT': 'At Destination Port',
    'OUT_FOR_DELIVERY': 'Out for Delivery',
    'DELIVERED': 'Delivered'
  };
  return map[status] || status;
};

export const getStatusBadgeClass = (status) => {
  return `badge-${status.toLowerCase()}`;
};
