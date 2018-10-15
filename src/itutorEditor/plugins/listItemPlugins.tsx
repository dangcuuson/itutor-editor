import * as React from 'react';
import { DraftBlockType } from 'draft-js';
import { PluginCreator, PluginCreatorArgs } from './createEditorWithPlugins';
import * as Immutable from 'immutable';
import decorateComponentWithProps from 'decorate-component-with-props';
import './listItemPlugins.css';

interface DraftBlockRenderConfig {
    element: any;
    wrapper?: React.ReactElement<any>;
}

interface WrapperProps {
    Element: 'ul' | 'ol';
}
class ListItemWrapper extends React.Component<WrapperProps> {
    render() {
        const { Element, ...props } = this.props;
        return <Element className="iTutor-editor-list" {...props}>{this.props.children}</Element>;

    }
}

interface DecoratedItemProps {
    creatorArgs: PluginCreatorArgs;
}
interface ItemProps extends DecoratedItemProps {
    'data-offset-key': string;
}
class ListItem extends React.Component<ItemProps> {
    render() {
        const { creatorArgs, ...props } = this.props;
        const { getEditorState, getCustomStyleFn } = creatorArgs;
        const editorState = getEditorState();
        const contentState = editorState.getCurrentContent();
        const blockKey = this.props['data-offset-key'].split('-')[0];
        const currentBlock = contentState.getBlockForKey(blockKey);
        const styleSet = currentBlock.getInlineStyleAt(0);

        const customStyleFn = getCustomStyleFn();
        const style: React.CSSProperties = !customStyleFn ? {} : customStyleFn(styleSet);

        // RichUtils style
        if (styleSet.includes('BOLD')) {
            style.fontWeight = 'bold';
        }
        if (styleSet.includes('ITALIC')) {
            style.fontStyle = 'italic';
        }
        // underline may not need to be included in the bullet
        // if (styleSet.includes('UNDERLINE')) {
        //     style.textDecoration = 'underline';
        // }

        return <li style={style} {...props}>{this.props.children}</li>;
    }
}

export const createListItemPlugin: PluginCreator = (creatorArgs) => {
    const decoratedProps: DecoratedItemProps = { creatorArgs };
    const blockRenderMap: { [K in DraftBlockType]?: DraftBlockRenderConfig } = {
        'unordered-list-item': {
            element: decorateComponentWithProps(ListItem, decoratedProps),
            wrapper: <ListItemWrapper Element="ul" />
        },
        'ordered-list-item': {
            element: decorateComponentWithProps(ListItem, decoratedProps),
            wrapper: <ListItemWrapper Element="ol" />
        }
    };

    return {
        blockRenderMap: Immutable.Map<DraftBlockType, DraftBlockRenderConfig>(blockRenderMap)
    };
};