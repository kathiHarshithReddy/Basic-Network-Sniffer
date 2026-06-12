export interface Packet {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  payloadInfo: string;
  size: number;
}
