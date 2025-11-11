declare module 'polyline' {
  export function decode(str: string, precision?: number): number[][];
  export function encode(coordinates: number[][], precision?: number): string;
  export function fromGeoJSON(geojson: any, precision?: number): string;
  export function toGeoJSON(str: string, precision?: number): any;
}
