export interface MaintenanceItem {
  id: string;
  name: string;
  interval: number;
  current: number;
  lastResetDate: string;
  isMaster?: boolean;
}

const today = new Date().toISOString().split('T')[0];

export const INITIAL_MAINTENANCE_ITEMS: MaintenanceItem[] = [
  { id: '1', name: 'CHAIN LUBING', interval: 700, current: 257, lastResetDate: today },
  { id: '2', name: 'CHAIN TENSION & LUBRICATION', interval: 700, current: 257, lastResetDate: today },
  { id: '3', name: 'ENGINE OIL', interval: 2000, current: 759, lastResetDate: today },
  { id: '4', name: 'OIL FILTER', interval: 2000, current: 759, lastResetDate: today },
  { id: '5', name: 'AIR FILTER CLEANING', interval: 4000, current: 759, lastResetDate: today },
  { id: '6', name: 'BRAKE PADS (FRONT)', interval: 5000, current: 759, lastResetDate: today },
  { id: '7', name: 'CARBURETOR / FUEL INJECTOR CLEANING', interval: 5000, current: 759, lastResetDate: today },
  { id: '8', name: 'FRONT FORK OIL', interval: 7000, current: 759, lastResetDate: today },
  { id: '9', name: 'REAR SHOCK OIL', interval: 7000, current: 759, lastResetDate: today },
  { id: '10', name: 'BRAKE FLUID (FRONT)', interval: 7000, current: 759, lastResetDate: today },
  { id: '11', name: 'BRAKE FLUID (REAR)', interval: 7000, current: 759, lastResetDate: today },
  { id: '12', name: 'SPARK PLUG', interval: 8000, current: 759, lastResetDate: today },
  { id: '13', name: 'BRAKE PADS (REAR)', interval: 8000, current: 759, lastResetDate: today },
  { id: '14', name: 'CLUTCH CABLE / LEVER', interval: 10000, current: 759, lastResetDate: today },
  { id: '15', name: 'THROTTLE CABLE / LEVER', interval: 10000, current: 759, lastResetDate: today },
  { id: '16', name: 'AIR FILTER REPLACE', interval: 12000, current: 759, lastResetDate: today },
  { id: '17', name: 'COOLANT', interval: 12000, current: 759, lastResetDate: today },
  { id: '18', name: 'WHEEL BEARINGS', interval: 12000, current: 759, lastResetDate: today },
  { id: '19', name: 'EXHAUST SYSTEM CHECK', interval: 12000, current: 759, lastResetDate: today },
  { id: '20', name: 'BATTERY', interval: 15000, current: 759, lastResetDate: today },
  { id: '21', name: 'SUSPENSION (FRONT)', interval: 16000, current: 759, lastResetDate: today },
  { id: '22', name: 'SUSPENSION (REAR)', interval: 16000, current: 759, lastResetDate: today },
  { id: '23', name: 'CHAIN & SPROCKET CHANGE', interval: 20000, current: 759, lastResetDate: today },
  { id: '24', name: 'REAR TYRE', interval: 20000, current: 759, lastResetDate: today },
  { id: '25', name: 'STEERING HEAD BEARINGS', interval: 20000, current: 759, lastResetDate: today },
  { id: '26', name: 'FRONT TYRE', interval: 25000, current: 759, lastResetDate: today },
  { id: '27', name: 'DRIVE CHAIN ADJUSTMENT', interval: 0, current: 759, lastResetDate: today, isMaster: true },
  { id: '28', name: 'BODY BOLTS & FASTENERS CHECK', interval: 0, current: 759, lastResetDate: today, isMaster: true },
  { id: '29', name: 'THROTTLE & CLUTCH LEVER LUBRICATION', interval: 0, current: 759, lastResetDate: today, isMaster: true },
];

export const MONTHLY_DATA = [
  { month: 'JAN', km: 48 },
  { month: 'FEB', km: 0 },
  { month: 'MAR', km: 0 },
  { month: 'APR', km: 0 },
  { month: 'MAY', km: 0 },
  { month: 'JUN', km: 0 },
  { month: 'JUL', km: 0 },
  { month: 'AUG', km: 0 },
  { month: 'SEP', km: 0 },
  { month: 'OCT', km: 0 },
  { month: 'NOV', km: 0 },
  { month: 'DEC', km: 0 },
];
