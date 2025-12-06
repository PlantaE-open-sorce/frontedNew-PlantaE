export interface CreatePlantPayload {
  name: string;
  species: string;
  location?: string | null;
  sensorId?: string | null;
}

export interface UpdatePlantPayload extends Partial<CreatePlantPayload> {
  status?: string;
}
