import * as React from 'react';
import { KeyBindingUtil, EditorState, AtomicBlockUtils, Modifier, CharacterMetadata, BlockMapBuilder, ContentBlock, ContentState } from 'draft-js';
import { DraftPlugin, PluginFunctions } from './draft-js-plugins-editor';
import * as Immutable from 'immutable';

export const createMyPlugin = (): DraftPlugin => {
    return {
        keyBindingFn: (e: React.KeyboardEvent<{}>) => {
            if (e.key === 's' && KeyBindingUtil.hasCommandModifier(e)) {
                return 'bla';
            }
            return null;
        },
        handleKeyCommand: (command: string, editorState: EditorState, func: PluginFunctions) => {
            if (command === 'bla') {
                const contentState = editorState.getCurrentContent();
                const selectionState = editorState.getSelection();

                const contentStateAfterRemoval = Modifier.removeRange(contentState, selectionState, 'backward');
                const targetSelection = contentStateAfterRemoval.getSelectionAfter();

                const contentStateWithEntity = contentStateAfterRemoval.createEntity(
                    'IMAGE',
                    'IMMUTABLE',
                    // tslint:disable-next-line:max-line-length
                    { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Images_2015_logo.svg/1200px-Google_Images_2015_logo.svg.png' }
                );
                const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                const charData = CharacterMetadata.create({ entity: entityKey });

                const currentBlock = contentStateWithEntity.getBlockForKey(targetSelection.getStartKey());
                const newCharacterList = currentBlock.getCharacterList().push(charData);
                const newBlock = currentBlock.set('characterList', newCharacterList);
                const newBlockMap = contentStateWithEntity.getBlockMap().set(newBlock.get('key'), newBlock as any);
                // console.log('>>newBlock', newBlock, newBlock.toObject());

                const newContentState = contentStateWithEntity.set('blockMap', newBlockMap) as any;
                console.log('>>newContentState', newContentState, newContentState.toObject());
                const newEditorState = EditorState.push(editorState, newContentState, 'insert-fragment');
                func.setEditorState(newEditorState);

                return 'handled';
            }
            return 'not-handled';
        },
        decorators: [{
            // tslint:disable-next-line:max-line-length
            strategy: (block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) => {
                const filterFn = (metadata: CharacterMetadata): boolean => {
                    const entityKey = metadata.getEntity();
                    const entity = contentState.getEntity(entityKey);
                    return !!entity && entity.getType() !== 'IMAGE';
                };
                block.findEntityRanges(filterFn, callback);
            }
        }]
    };
};