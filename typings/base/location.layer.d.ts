declare namespace flagwind {
    const locationLayerOptions: {
        onMapClick: (evt: any) => void;
    };
    interface ILocationLayer {
        clear(): void;
    }
}
