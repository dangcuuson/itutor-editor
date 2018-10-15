import { EditorState, Modifier, RichUtils, ContentState, SelectionState } from 'draft-js';
import { PluginCreator, DraftPlugin } from './createEditorWithPlugins';
import { getSelectedBlocks } from './utils';
import * as Immutable from 'immutable';

const FONTSIZE_STYLE_PREFIX = 'font-size-';

const getFontSizeStyles = (editorState: EditorState) => {
    const selection = editorState.getSelection();

    if (selection.isCollapsed()) {
        return editorState.getCurrentInlineStyle().filter(style => !!style && style.startsWith(FONTSIZE_STYLE_PREFIX));
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
                .filter(style => !!style && style.startsWith(FONTSIZE_STYLE_PREFIX));

            return acc.merge(blockStyles);
        },
        Immutable.Set<string>()
    );
};

export const setFontSize = (editorState: EditorState, fontSize: string): EditorState => {
    const selection = editorState.getSelection();

    const oldFontSizeStyles = getFontSizeStyles(editorState);
    const newFontSizeStyle = FONTSIZE_STYLE_PREFIX + fontSize;

    const newContentState = oldFontSizeStyles.reduce<ContentState>(
        (acc, fontSizeStyle) => {
            return Modifier.removeInlineStyle(acc!, selection, fontSizeStyle!);
        },
        editorState.getCurrentContent()
    );

    const fontSizeRemovedEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');

    const newEditorState = RichUtils.toggleInlineStyle(
        fontSizeRemovedEditorState,
        newFontSizeStyle
    );
    return newEditorState;
};

export const getFontSize = (editorState: EditorState): string => {
    const fontSizeStyles = getFontSizeStyles(editorState);
    if (fontSizeStyles.size !== 1) {
        return '';
    }

    return fontSizeStyles.first().replace(FONTSIZE_STYLE_PREFIX, '');
};

export const createFontSizePlugin: PluginCreator = (): DraftPlugin => {
    const fontSizePlugin: DraftPlugin = {
        customStyleFn: (inlineStyles) => {
            const fontSizeStyle = inlineStyles.find(s => !!s && s.startsWith(FONTSIZE_STYLE_PREFIX));
            if (!fontSizeStyle) {
                return { fontSize: '16px' };
            }

            const fontSize = fontSizeStyle.replace(FONTSIZE_STYLE_PREFIX, '');
            const sizeUnit = isNaN(+fontSize) ? '' : 'px';
            return { fontSize: fontSize + sizeUnit };
        }
    };
    return fontSizePlugin;
};