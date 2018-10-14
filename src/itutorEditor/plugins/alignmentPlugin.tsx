import { PluginCreator } from './createEditorWithPlugins';
import { EditorState, ContentBlock, Modifier } from 'draft-js';
import { getSelectedBlocks } from './utils';
import * as Immutable from 'immutable';
import './alignmentPlugin.css';

export type Alignment = 'left' | 'right' | 'center';

export const createAlignmentPlugin: PluginCreator = () => {
    return {
        blockStyleFn: (contentBlock: ContentBlock) => {
            const blockData = contentBlock.getData();
            const defaultAlignment: Alignment = 'left';
            const align = blockData.get('alignment', defaultAlignment);
            return `iTutor-editor-align iTutor-editor-align-${align}`;
        }
    };
};

export const getAlignment = (editorState: EditorState): Alignment | undefined => {
    const getAlignmentOfBlock = (block: ContentBlock): Alignment => {
        const blockData = block.getData();
        const blockAlignment = blockData.get('alignment');
        return blockAlignment || 'left';
    };

    const selectedBlocks = getSelectedBlocks(editorState);
    const blockAlignments = Immutable.Set(selectedBlocks.map(getAlignmentOfBlock));
    return blockAlignments.size === 1 ? blockAlignments.first() : undefined;
};

export const setAlignment = (editorState: EditorState, alignment: Alignment): EditorState => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const newContentState = Modifier.mergeBlockData(
        contentState, selectionState, Immutable.Map({ 'alignment': alignment })
    );
    const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
    return newEditorState;
};