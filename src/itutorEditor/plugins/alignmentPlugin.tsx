import { DraftPlugin } from './draft-js-plugins-editor';
import { EditorState, ContentBlock, Modifier } from 'draft-js';
import { getSelectedBlocks } from './utils';
import * as Immutable from 'immutable';
import './alignmentPlugin.css';

export type Alignment = 'left' | 'right' | 'center';

export const createAlignmentPlugin = (): DraftPlugin => {
    return {
        blockStyleFn: (contentBlock: ContentBlock) => {
            const blockData = contentBlock.getData();
            const align = blockData.get('alignment', 'left');
            return `iTutor-editor-align-${align}`;
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

    let alignment = getAlignmentOfBlock(selectedBlocks[0]);
    for (let i = 1; i < selectedBlocks.length; i++) {
        const nextAlignment = getAlignmentOfBlock(selectedBlocks[i]);
        if (alignment !== nextAlignment) {
            return undefined;
        }
    }

    return alignment;
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