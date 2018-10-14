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
}

export interface DraftPlugin extends Pick<
    EditorProps,
    'blockStyleFn' | 'blockRendererFn' | 'blockRenderMap' | 'customStyleFn' | 'handleDroppedFiles' | 'handlePastedFiles'
    > {
    decorators?: DraftDecorator[];
}

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
                setEditorState: this.props.onChange
            };
            this.plugins = pluginCreators.map(creator => creator(creatorArgs));
        }

        mergePluginsToProps = (props: EditorProps): EditorProps => {
            const plugins = this.plugins;
            function getPropsArray<T extends keyof EditorProps & keyof DraftPlugin>(key: T): EditorProps[T][] {
                return [props[key], ...plugins.map(p => p[key])];
            }

            const blockStyleFn: () => EditorProps['blockStyleFn'] = () => {
                const fns = getPropsArray('blockStyleFn').filter(isDefined);
                if (fns.length === 0) {
                    return undefined;
                }
                return (...args) => {
                    return fns.map(fn => fn(...args)).join(' ');
                };
            };

            const blockRendererFn: () => EditorProps['blockRendererFn'] = () => {
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

            const blockRenderMap: () => EditorProps['blockRenderMap'] = () => {
                const maps = getPropsArray('blockRenderMap').filter(isDefined);
                if (maps.length === 0) {
                    return undefined;
                }
                return maps.reduce((acc, map) => acc.merge(map), DefaultDraftBlockRenderMap);
            };

            const customStyleFn: () => EditorProps['customStyleFn'] = () => {
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

            function combineHandleFns<TArgs extends Array<any>>(
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

            return {
                ...props,
                editorState: editorStateWithDecorators,
                blockStyleFn: blockStyleFn(),
                blockRendererFn: blockRendererFn(),
                blockRenderMap: blockRenderMap(),
                customStyleFn: customStyleFn(),
                handleDroppedFiles: combineHandleFns(getPropsArray('handleDroppedFiles')),
                handlePastedFiles: combineHandleFns(getPropsArray('handlePastedFiles'))
            };
        }

        render() {
            return <Editor {...this.mergePluginsToProps(this.props)} />;
        }
    };
};