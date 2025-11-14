export interface Device {
  id: string;
  ownerId: string;
  hwModel: string;
  active: boolean;
  note?: string;
}

export interface RegisterDevicePayload {
  deviceId: string;
  ownerId: string;
  hwModel: string;
  secret?: string;
}

export interface DeviceNotePayload {
  note: string;
}
