export interface DeviceModel {
  deviceName: string;
  deviceType: string;
  tariffGroup: string;
  location: string;
  subLocation: string;
  detailLocation: string;

  power?: string;
  status?: string;
  phase?: string;
}

export const deviceModelDummies = [
  {
    deviceName: "Device 1",
    deviceType: "Type A",
    tariffGroup: "R1",
    location: "Location 1",
    subLocation: "Sub-location 1",
    detailLocation: "Detail location 1",
    power: "1000",
    status: "Active",
    phase: "Phase 1",
  },
  {
    deviceName: "Device 2",
    deviceType: "Type B",
    tariffGroup: "R2",
    location: "Location 2",
    subLocation: "Sub-location 2",
    detailLocation: "Detail location 2",
    power: "2000",
    status: "Inactive",
    phase: "Phase 2",
  },
  {
    deviceName: "Device 3",
    deviceType: "Type C",
    tariffGroup: "R1",
    location: "Location 3",
    subLocation: "Sub-location 3",
    detailLocation: "Detail location 3",
    power: "1500",
    status: "Active",
    phase: "Phase 1",
  },
  {
    deviceName: "Device 4",
    deviceType: "Type D",
    tariffGroup: "R2",
    location: "Location 4",
    subLocation: "Sub-location 4",
    detailLocation: "Detail location 4",
    power: "2500",
    status: "Inactive",
    phase: "Phase 2",
  },
  {
    deviceName: "Device 5",
    deviceType: "Type E",
    tariffGroup: "R1",
    location: "Location 5",
    subLocation: "Sub-location 5",
    detailLocation: "Detail location 5",
    power: "3000",
    status: "Active",
    phase: "Phase 1",
  },
];
