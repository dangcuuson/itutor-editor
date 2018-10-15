import { EditorState, ContentBlock, ContentState, Modifier } from 'draft-js';
import * as Immutable from 'immutable';

export const getSelectedBlocks = (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();

    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq();
    const startKeyIndex = blockKeys.findIndex(v => v === startKey);
    const endKeyIndex = blockKeys.findIndex(v => v === endKey);

    return blockMap.slice(startKeyIndex, endKeyIndex + 1).toList().toArray();
};

export const updateBlock = (contentState: ContentState, block: ContentBlock): ContentState => {
    return contentState.merge({
        blockMap: contentState.getBlockMap().merge({ [block.getKey()]: block })
    }) as ContentState;
};

export const getInlineStyles = (editorState: EditorState): Immutable.OrderedSet<string> => {
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
        return editorState.getCurrentInlineStyle();
    }

    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const endKey = selection.getEndKey();
    const endOffset = selection.getEndOffset();

    const selectedBlocks = getSelectedBlocks(editorState);
    return selectedBlocks.reduce<Immutable.OrderedSet<string>>(
        (acc, block) => {
            const blockKey = block.getKey();
            const start = blockKey === startKey ? startOffset : 0;
            const end = blockKey === endKey ? endOffset : block.getLength();

            const blockStyles = block.getCharacterList()
                .slice(start, end)
                .flatMap(charMeta => charMeta!.getStyle());

            return acc.merge(blockStyles);
        },
        Immutable.OrderedSet<string>()
    );
};

export const clearInlineStyles = (
    editorState: EditorState,
    stylesToRemove: Immutable.OrderedSet<string>
): EditorState => {
    const selection = editorState.getSelection();
    const newContentState = stylesToRemove.reduce<ContentState>(
        (acc, fontSizeStyle) => {
            return Modifier.removeInlineStyle(acc!, selection, fontSizeStyle!);
        },
        editorState.getCurrentContent()
    );
    return EditorState.push(editorState, newContentState, 'change-inline-style');
};

export const clearAllInlineStyle = (editorState: EditorState): EditorState => {
    return clearInlineStyles(editorState, getInlineStyles(editorState));
};