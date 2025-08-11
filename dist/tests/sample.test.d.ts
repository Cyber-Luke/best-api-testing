export declare class SampleTests {
    static basicTest(): {
        execute: () => {
            message: string;
        };
        effects: {
            name: string;
            validate: (ctx: {
                message: string;
            }) => boolean;
        }[];
    };
}
