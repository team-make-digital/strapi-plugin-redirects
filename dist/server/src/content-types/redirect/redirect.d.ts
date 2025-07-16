declare const _default: {
    kind: string;
    collectionName: string;
    info: {
        singularName: string;
        pluralName: string;
        displayName: string;
    };
    options: {
        draftAndPublish: boolean;
        timestamps: boolean;
    };
    attributes: {
        contentType: {
            type: string;
            required: boolean;
        };
        oldSlug: {
            type: string;
            required: boolean;
        };
        newSlug: {
            type: string;
            required: boolean;
        };
        redirectType: {
            type: string;
            required: boolean;
            default: string;
        };
        comment: {
            type: string;
        };
    };
};
export default _default;
