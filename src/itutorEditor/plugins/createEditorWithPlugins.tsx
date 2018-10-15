import * as React from 'react';
import * as _ from 'lodash';
import {
    Editor, EditorProps, EditorState, ContentBlock, ContentState, CompositeDecorator, DraftHandleValue,
    DefaultDraftBlockRenderMap
} from 'draft-js';

export interface PluginCreator {
    (args: PluginCreatorArgs): DraftPlugin;
}

export interface PluginCreatorArgs {
    getEditorState: () => EditorState;
    setEditorState: (editorState: EditorState) => void;
    getCustomStyleFn: () => EditorProps['customStyleFn'];
}

export interface DraftPlugin extends Pick<
    EditorProps,
    'blockStyleFn' | 'blockRendererFn' | 'blockRenderMap' | 'customStyleFn' |
    'handleKeyCommand' | 'handleReturn' | 'handleBeforeInput' |
    'handlePastedFiles' | 'handleDroppedFiles' | 'handleDrop'
    > {
    decorators?: DraftDecorator[];
}

type OptionalToNull<T> = {
    [K in keyof T]-?: undefined extends T[K] ? T[K] | null : T[K];
};

type NullToUndefined<T> = {
    [K in keyof T]: null extends T[K] ? NonNullable<T[K]> | undefined : T[K];
};

// e.g: { x?: string } => { x: string | undefined }
// the idea is to make Typescript complain if we create obj with missing field
type OptionalToOrUndefined<T> = NullToUndefined<OptionalToNull<T>>;

export interface DraftDecorator<TProps = any> {
    strategy: (block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) => void;
    component: Function;
    props?: TProps;
}

function isDefined<T>(value: T | undefined): value is T {
    return typeof value !== 'undefined';
}

export const createEditorWithPlugins = (
    pluginCreators: PluginCreator[]
): React.ComponentClass<EditorProps> => {

    return class extends React.Component<EditorProps> {

        plugins: DraftPlugin[];

        constructor(props: EditorProps) {
            super(props);

            const creatorArgs: PluginCreatorArgs = {
                getEditorState: () => this.props.editorState,
                setEditorState: this.props.onChange,
                getCustomStyleFn: () => this.mergePluginsToProps(this.props).customStyleFn
            };
            this.plugins = pluginCreators.map(creator => creator(creatorArgs));
        }

        mergePluginsToProps = (props: EditorProps): EditorProps => {
            const plugins = this.plugins;
            function getPropsArray<T extends keyof EditorProps & keyof DraftPlugin>(key: T): EditorProps[T][] {
                return [props[key], ...plugins.map(p => p[key])];
            }

            const mergeBlockStyleFn: () => EditorProps['blockStyleFn'] = () => {
                const fns = getPropsArray('blockStyleFn').filter(isDefined);
                if (fns.length === 0) {
                    return undefined;
                }
                return (...args) => {
                    return fns.map(fn => fn(...args)).join(' ');
                };
            };

            const mergeBlockRendererFn: () => EditorProps['blockRendererFn'] = () => {
                const fns = getPropsArray('blockRendererFn').filter(isDefined);
                if (fns.length === 0) {
                    return undefined;
                }
                return (...args) => {
                    for (const fn of fns) {
                        const renderer = fn(...args);
                        if (renderer) {
                            return renderer;
                        }
                    }
                };
            };

            const mergeBlockRenderMap: () => EditorProps['blockRenderMap'] = () => {
                const maps = getPropsArray('blockRenderMap').filter(isDefined);
                if (maps.length === 0) {
                    return undefined;
                }
                return maps.reduce((acc, map) => acc.merge(map), DefaultDraftBlockRenderMap);
            };

            const mergeCustomStyleFn: () => EditorProps['customStyleFn'] = () => {
                const fns = getPropsArray('customStyleFn').filter(isDefined);
                if (fns.length === 0) {
                    return undefined;
                }
                return (...args) => {
                    return fns.reduce(
                        (acc, fn) => {
                            acc = { ...acc, ...fn(...args) };
                            return acc;
                        },
                        {}
                    );
                };
            };

            type HandleFn<TArgs extends Array<any>> = (...args: TArgs) => DraftHandleValue;

            function mergeHandleFns<TArgs extends Array<any>>(
                handleFns: (HandleFn<TArgs> | undefined)[]
            ): HandleFn<TArgs> {
                const fns = handleFns.filter(isDefined);
                if (fns.length === 0) {
                    return () => 'not-handled';
                }
                return (...args: TArgs) => {
                    for (const fn of fns) {
                        const result = fn(...args);
                        if (result === 'handled') {
                            return 'handled';
                        }
                    }
                    return 'not-handled';
                };
            }

            const decorators = this.plugins.map(p => p.decorators).filter(isDefined);
            const decorator = new CompositeDecorator(_.flatMap(decorators));

            const editorStateWithDecorators = decorators.length === 0
                ? props.editorState
                : EditorState.set(props.editorState, { decorator });

            const propsMergedWithPlugin: OptionalToOrUndefined<DraftPlugin> = {
                blockStyleFn: mergeBlockStyleFn(),
                blockRendererFn: mergeBlockRendererFn(),
                blockRenderMap: mergeBlockRenderMap(),
                customStyleFn: mergeCustomStyleFn(),
                handleKeyCommand: mergeHandleFns(getPropsArray('handleKeyCommand')),
                handleReturn: mergeHandleFns(getPropsArray('handleReturn')),
                handleBeforeInput: mergeHandleFns(getPropsArray('handleBeforeInput')),
                handleDroppedFiles: mergeHandleFns(getPropsArray('handleDroppedFiles')),
                handlePastedFiles: mergeHandleFns(getPropsArray('handlePastedFiles')),
                handleDrop: mergeHandleFns(getPropsArray('handleDrop')),
                decorators: undefined
            };

            return {
                ...props,
                editorState: editorStateWithDecorators,
                ...propsMergedWithPlugin as any
            };
        }

        render() {
            return <Editor {...this.mergePluginsToProps(this.props)} />;
        }
    };
};