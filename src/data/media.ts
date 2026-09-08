import imageSizes from './image-sizes.json';
const sizes: Record<string, {width:number;height:number}> = imageSizes;
export function imageDimensions(src?: string) { return sizes[src || ''] || {}; }
