import * as React from 'react';
import EditorWithPlugins from 'draft-js-plugins-editor';
import {
    EditorProps, EditorState, Editor, ContentBlock, DraftHandleValue,
    SelectionState, DraftDragType, ContentState
} from 'draft-js';
import * as Immutable from 'immutable';

/* tslint:disable:max-line-length */

type SyntheticKeyboardEvent = React.KeyboardEvent<{}>;
type SyntheticEvent = React.SyntheticEvent<{}>;

// https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md
export interface PluginFunctions {
    getPlugins: () => DraftPlugin[];
    getProps: () => EditorProps;
    setEditorState: (editorState: EditorState) => void;
    getEditorState: () => EditorState;
    getReadonly: () => boolean;
    setReadOnly: (readonly: boolean) => void;
    getEditorRef: () => Editor;
}

export interface DraftDecorator<TProps = Object> {
    strategy: (block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) => void;
    component: Function;
    props?: TProps;
}

// https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md
export interface DraftPlugin {
    blockRendererFn?: (block: ContentBlock, pluginFuncs: PluginFunctions) => any;
    keyBindingFn?: (e: SyntheticKeyboardEvent, pluginFuncs: PluginFunctions) => string | null;
    blockStyleFn?: (block: ContentBlock, pluginFuncs: PluginFunctions) => string;
    blockRendererMap?: Immutable.Map<any, any>;
    customStyleMap?: any;
    handleReturn?: (e: SyntheticKeyboardEvent, editorState: EditorState, pluginFuncs: PluginFunctions) => DraftHandleValue;
    handleKeyCommand?: (command: string, editorState: EditorState, pluginFuncs: PluginFunctions) => DraftHandleValue;
    handleBeforeInput?: (chars: string, editorState: EditorState, pluginFuncs: PluginFunctions) => DraftHandleValue;
    handlePastedText?: (text: string, html: string | undefined, editorState: EditorState, pluginFuncs: PluginFunctions) => DraftHandleValue;
    handlePastedFiles?: (files: Array<Blob>, pluginFuncs: PluginFunctions) => DraftHandleValue;
    handleDroppedFiles?: (selection: SelectionState, files: Array<Blob>, pluginFuncs: PluginFunctions) => DraftHandleValue;
    handleDrop?: (selection: SelectionState, dataTransfer: Object, isInternal: DraftDragType, pluginFuncs: PluginFunctions) => DraftHandleValue;
    onEscape?: (e: SyntheticKeyboardEvent, pluginFuncs: PluginFunctions) => void;
    onTab?: (e: SyntheticKeyboardEvent, pluginFuncs: PluginFunctions) => void;
    onUpArrow?: (e: SyntheticKeyboardEvent, pluginFuncs: PluginFunctions) => void;
    onDownArrow?: (e: SyntheticKeyboardEvent, pluginFuncs: PluginFunctions) => void;
    onRightArrow?: (e: SyntheticKeyboardEvent, pluginFuncs: PluginFunctions) => void;
    onLeftArrow?: (e: SyntheticKeyboardEvent, pluginFuncs: PluginFunctions) => void;

    onBlur?: (e: SyntheticEvent, pluginFuncs: PluginFunctions) => void;
    onFocus?: (e: SyntheticEvent, pluginFuncs: PluginFunctions) => void;

    initialize?: (pluginFuncs: PluginFunctions) => void;
    onChange?: (editorState: EditorState, pluginFuncs: PluginFunctions) => EditorState;
    willUnmount?: (pluginFuncs?: PluginFunctions) => void;
    decorators?: DraftDecorator[];
}

export interface EditorWithPluginsProps extends EditorProps {
    plugins?: DraftPlugin[];
}

export default EditorWithPlugins as React.ComponentClass<EditorWithPluginsProps>;