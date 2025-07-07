declare module 'topojson-client' {
    export function feature(
        topology: any,
        object: any
    ): {
        type: 'FeatureCollection';
        features: any[];
    };
}
