import { EditorState, Modifier, RichUtils, ContentState, SelectionState } from 'draft-js';
import { PluginCreator } from './createEditorWithPlugins';
import { getSelectedBlocks } from './utils';
import * as Immutable from 'immutable';

const COLOR_STYLE_PREFIX = 'color-';

const getColorStyles = (editorState: EditorState) => {
    const selection = editorState.getSelection();

    if (selection.isCollapsed()) {
        return editorState.getCurrentInlineStyle().filter(style => !!style && style.startsWith(COLOR_STYLE_PREFIX));
    }

    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const endKey = selection.getEndKey();
    const endOffset = selection.getEndOffset();

    const selectedBlocks = getSelectedBlocks(editorState);
    return selectedBlocks.reduce<Immutable.Set<string>>(
        (acc, block) => {
            const blockKey = block.getKey();
            const start = blockKey === startKey ? startOffset : 0;
            const end = blockKey === endKey ? endOffset : block.getLength();

            const blockStyles = block.getCharacterList()
                .slice(start, end)
                .flatMap(charMeta => charMeta!.getStyle())
                .filter(style => !!style && style.startsWith(COLOR_STYLE_PREFIX));

            return acc.merge(blockStyles);
        },
        Immutable.Set<string>()
    );
};

export const setColor = (editorState: EditorState, color: string): EditorState => {
    const selection = editorState.getSelection();

    const oldColorStyles = getColorStyles(editorState);
    const newColorStyle = COLOR_STYLE_PREFIX + color;

    const newContentState = oldColorStyles.reduce<ContentState>(
        (acc, colorStyle) => {
            return Modifier.removeInlineStyle(acc!, selection, colorStyle!);
        },
        editorState.getCurrentContent()
    );

    const colorRemovedEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');

    const newEditorState = RichUtils.toggleInlineStyle(
        colorRemovedEditorState,
        newColorStyle
    );
    return newEditorState;
};

export const getColor = (editorState: EditorState): string => {
    const colorStyles = getColorStyles(editorState);
    if (colorStyles.size !== 1) {
        return '';
    }

    return colorStyles.first().replace(COLOR_STYLE_PREFIX, '');
};

export const getColorStyleFn = (inlineStyles: Immutable.OrderedSet<string>): React.CSSProperties => {
    const colorStyle = inlineStyles.find(s => !!s && s.startsWith(COLOR_STYLE_PREFIX));
    if (!colorStyle) {
        return {};
    }

    const color = colorStyle.replace(COLOR_STYLE_PREFIX, '');
    return { color };
};

export const createColorPlugin: PluginCreator = () => {
    return {
        customStyleFn: getColorStyleFn
    };
};