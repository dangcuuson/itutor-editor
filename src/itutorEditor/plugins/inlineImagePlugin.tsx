/* tslint:disable */
import * as React from 'react';
import { EditorState, Modifier, CharacterMetadata, ContentState } from 'draft-js';
import { DraftPlugin } from './draft-js-plugins-editor';

const INLINE_IMAGE = 'INLINE_IMAGE';

export interface ImgData {
    src: string;
}

export const createInlineImgPlugin = (): DraftPlugin => {
    return {
        decorators: [{
            strategy: (block, callback, contentState) => {
                const filterFn = (metadata: CharacterMetadata): boolean => {
                    const entityKey = metadata.getEntity();
                    if (!entityKey) {
                        return false;
                    }
                    const entity = contentState.getEntity(entityKey);
                    return !!entity && entity.getType() === INLINE_IMAGE;
                };
                block.findEntityRanges(filterFn, callback);
            },
            component: InlineImgComponent
        }]
    };
};

interface InlineImgProps {
    contentState: ContentState;
    decoratedText: string;
    entityKey: string;
    offetKey: string;
    getEditorState: () => EditorState;
}
class InlineImgComponent extends React.Component<InlineImgProps> {
    render() {
        console.log('>>InlineImgComponent.render');
        const props = this.props;
        const entity = props.contentState.getEntity(props.entityKey);
        const data = entity.getData() as ImgData;
        return (
            <span>
                <img
                    src={data.src}
                    style={{ cursor: 'pointer' }}
                />
                {this.props.children}
            </span>
        );
    }
}

interface InsertImgBtnProps {
    editorState: EditorState;
    onChange: (editorState: EditorState) => void;
}
interface InsertImgBtnState {
    showDialog: boolean;
}
export class InsertImgBtn extends React.Component<InsertImgBtnProps, InsertImgBtnState> {

    constructor(props: InsertImgBtnProps) {
        super(props);
        this.state = {
            showDialog: false
        };
    }

    insertImg = (data: ImgData) => {
        const { editorState, onChange } = this.props;
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();

        // remove current selection
        const contentStateAfterRemoval = Modifier.removeRange(contentState, selectionState, 'backward');
        const targetSelection = contentStateAfterRemoval.getSelectionAfter();

        const contentStateWithEntity = contentStateAfterRemoval.createEntity(
            INLINE_IMAGE,
            'IMMUTABLE',
            data
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

        const newContentState = Modifier.insertText(
            contentStateWithEntity,
            targetSelection,
            ' ',
            undefined,
            entityKey
        );

        const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
        onChange(newEditorState);
    }

    render() {
        return (
            <div>
                <button
                    // tslint:disable-next-line:max-line-length
                    onClick={() => this.insertImg({ src: 'https://support.kickofflabs.com/wp-content/uploads/2016/06/300x150.png' })}
                    children="Insert dummy img"
                />
            </div>
        );
    }
}