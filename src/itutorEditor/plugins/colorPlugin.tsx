import { EditorState, RichUtils } from 'draft-js';
import { PluginCreator } from './createEditorWithPlugins';
import { getInlineStyles, clearInlineStyles } from './utils';
import * as Immutable from 'immutable';

const COLOR_STYLE_PREFIX = 'color-';

const getColorStyles = (editorState: EditorState) => {
    return getInlineStyles(editorState)
        .filter(style => !!style && style.startsWith(COLOR_STYLE_PREFIX))
        .toSet();
};

export const setColor = (editorState: EditorState, color: string): EditorState => {
    const oldColorStyles = getColorStyles(editorState);
    const newColorStyle = COLOR_STYLE_PREFIX + color;

    const colorRemovedEditorState = clearInlineStyles(editorState, oldColorStyles);

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

export const createColorPlugin: PluginCreator = () => {
    return {
        customStyleFn: (inlineStyles: Immutable.OrderedSet<string>): React.CSSProperties => {
            const colorStyle = inlineStyles.find(s => !!s && s.startsWith(COLOR_STYLE_PREFIX));
            if (!colorStyle) {
                return {};
            }

            const color = colorStyle.replace(COLOR_STYLE_PREFIX, '');
            return { color };
        }
    };
};