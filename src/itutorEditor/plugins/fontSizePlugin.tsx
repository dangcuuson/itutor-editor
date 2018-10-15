import { EditorState, Modifier, RichUtils, ContentState, SelectionState } from 'draft-js';
import { PluginCreator, DraftPlugin } from './createEditorWithPlugins';
import { getInlineStyles, clearInlineStyles } from './utils';

const FONTSIZE_STYLE_PREFIX = 'font-size-';

const getFontSizeStyles = (editorState: EditorState) => {
    return getInlineStyles(editorState)
        .filter(style => !!style && style.startsWith(FONTSIZE_STYLE_PREFIX))
        .toSet();
};

export const setFontSize = (editorState: EditorState, fontSize: string): EditorState => {
    const oldFontSizeStyles = getFontSizeStyles(editorState);
    const newFontSizeStyle = FONTSIZE_STYLE_PREFIX + fontSize;

    const fontSizeRemovedEditorState = clearInlineStyles(editorState, oldFontSizeStyles);

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