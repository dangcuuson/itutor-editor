import { EditorState, ContentBlock } from 'draft-js';

export const getSelectedBlocks = (editorState: EditorState): ContentBlock[] => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const anchorKey = selection.getAnchorKey();
    const focusKey = selection.getFocusKey();

    const isSameBlock = anchorKey === focusKey;
    const startingBlock = contentState.getBlockForKey(anchorKey);
    const selectedBlocks = [startingBlock];

    if (!isSameBlock) {
        let blockKey = anchorKey;

        while (blockKey !== focusKey) {
            const nextBlock = contentState.getBlockAfter(blockKey);
            if (!nextBlock) {
                break;
            }
            selectedBlocks.push(nextBlock);
            blockKey = nextBlock.getKey();
        }
    }

    return selectedBlocks;
};