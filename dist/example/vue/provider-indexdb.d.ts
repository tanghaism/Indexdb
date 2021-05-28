import IndexDB, { Options } from '../../index';
import { App } from 'vue';
export declare function useDB(): IndexDB;
declare const _default: {
    install: (app: App, props: {
        databaseName: string;
        options: Options;
    }) => void;
};
export default _default;
