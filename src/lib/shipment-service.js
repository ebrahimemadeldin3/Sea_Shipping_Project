import { getStorageItem, setStorageItem, KEYS } from './storage';

export const STATUS_LIST = [
  'PENDING_REVIEW',
  'ACCEPTED',
  'PREPARING',
  'AT_ORIGIN_PORT',
  'IN_TRANSIT',
  'AT_DESTINATION_PORT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REJECTED'
];

export const WORKFLOW_SEQUENCE = [
  { id: 'PENDING_REVIEW', label: 'Request Submitted' },
  { id: 'ACCEPTED', label: 'Request Accepted' },
  { id: 'PREPARING', label: 'Preparing' },
  { id: 'AT_ORIGIN_PORT', label: 'At Origin Port' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'AT_DESTINATION_PORT', label: 'Destination Port' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { id: 'DELIVERED', label: 'Delivered' }
];

export function getShipments() {
  return getStorageItem(KEYS.SHIPMENTS, []);
}

export function getShipmentById(id) {
  return getShipments().find(s => s.id === id);
}

export function getShipmentByNumber(number) {
  const normalized = number.trim().toUpperCase();
  return getShipments().find(s => s.shipmentNumber === normalized);
}

export function getCustomerShipments(customerId) {
  return getShipments().filter(s => s.customerId === customerId);
}

function generateShipmentNumber() {
  const shipments = getShipments();
  const year = new Date().getFullYear();
  // Find max number for this year
  const prefix = `SEA-${year}-`;
  let maxNum = 0;
  
  shipments.forEach(s => {
    if (s.shipmentNumber && s.shipmentNumber.startsWith(prefix)) {
      const numStr = s.shipmentNumber.replace(prefix, '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = String(maxNum + 1).padStart(5, '0');
  return `${prefix}${nextNum}`;
}

export function createShipment(customerId, data) {
  const shipments = getShipments();
  const now = new Date().toISOString();
  
  const newShipment = {
    ...data,
    id: `shp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    shipmentNumber: generateShipmentNumber(),
    customerId,
    status: 'PENDING_REVIEW',
    timeline: [
      {
        id: `evt_${Date.now()}_1`,
        status: 'PENDING_REVIEW',
        title: 'Request Submitted',
        note: 'Shipment request received and is pending review by Navora Operations.',
        timestamp: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  shipments.unshift(newShipment); // Add to beginning (newest first)
  setStorageItem(KEYS.SHIPMENTS, shipments);
  
  return newShipment;
}

export function generateFullTimeline(shipment) {
  if (!shipment) return [];
  
  if (shipment.status === 'REJECTED') {
    return [
      { status: 'PENDING_REVIEW', label: 'Request Submitted', state: 'completed', event: shipment.timeline.find(e => e.status === 'PENDING_REVIEW') },
      { status: 'REJECTED', label: 'Request Rejected', state: 'current', event: shipment.timeline.find(e => e.status === 'REJECTED') }
    ];
  }

  const result = [];

  // We go backwards through the sequence because the shipment status represents the current highest state achieved.
  // Actually, let's just go forward through the sequence and find the matching events in timeline array.
  
  // The shipment.timeline is ordered newest first.
  const timelineEvents = [...(shipment.timeline || [])].reverse(); 

  let currentStateIndex = WORKFLOW_SEQUENCE.findIndex(w => w.id === shipment.status);
  
  if (currentStateIndex === -1) {
    currentStateIndex = 0;
  }

  WORKFLOW_SEQUENCE.forEach((step, index) => {
    const matchingEvent = timelineEvents.find(e => e.status === step.id);
    let state = 'future';
    
    if (index < currentStateIndex) {
      state = 'completed';
    } else if (index === currentStateIndex) {
      state = 'current';
    }

    // Some steps might have been skipped in the data, but visually we show them as completed if we are past them.
    result.push({
      status: step.id,
      label: step.label,
      state: state, // 'completed', 'current', 'future'
      event: matchingEvent || null
    });
  });

  return result;
}

export function updateShipment(id, updates) {
  const shipments = getShipments();
  const index = shipments.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Shipment not found');

  const now = new Date().toISOString();
  
  shipments[index] = {
    ...shipments[index],
    ...updates,
    updatedAt: now
  };

  setStorageItem(KEYS.SHIPMENTS, shipments);
  return shipments[index];
}

export function addTimelineEvent(shipmentId, eventData) {
  const shipment = getShipmentById(shipmentId);
  if (!shipment) throw new Error('Shipment not found');

  const newEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ...eventData,
    timestamp: new Date().toISOString()
  };

  const timeline = [newEvent, ...(shipment.timeline || [])];
  
  return updateShipment(shipmentId, { timeline });
}

export function updateShipmentStatus(id, newStatus, additionalData = {}, timelineEvent = {}) {
  if (!STATUS_LIST.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  // Update data
  updateShipment(id, {
    status: newStatus,
    ...additionalData
  });

  // Add timeline
  return addTimelineEvent(id, {
    status: newStatus,
    title: timelineEvent.title || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
    note: timelineEvent.note || '',
    location: timelineEvent.location || ''
  });
}
