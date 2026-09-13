export type CallStatus = "idle" | "connecting" | "connected" | "ended" | "error";
export type ServiceRequest = {
  room: "110";
  requestType: "amenity_request";
  item: "extra_towels" | "bottled_water";
  quantity: number;
  department: "Housekeeping";
  status: "created";
};
export type TranscriptEntry = { role: "user" | "agent"; text: string; eventId?: number };
export type CallViewProps = {
  callStatus: CallStatus;
  micMuted: boolean;
  callDuration: number;
  isSpeaking: boolean;
  latestRequest: ServiceRequest | null;
  wifiResolved: boolean;
  transcript: TranscriptEntry[];
  error: string | null;
  configurationWarning?: string;
  preview?: boolean;
  onStart: () => void;
  onEnd: () => void;
  onMute: () => void;
};
