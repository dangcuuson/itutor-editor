import { EditorState } from 'draft-js';

export const getSelectedBlocks = (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();

    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq();
    const startKeyIndex = blockKeys.findIndex(v => v === startKey);
    const endKeyIndex = blockKeys.findIndex(v => v === endKey);

    return blockMap.slice(startKeyIndex, endKeyIndex + 1).toList();
};