import * as React from 'react';
import * as _ from 'lodash';
import * as ClassNames from 'classnames';
import { SketchPicker } from 'react-color';
import { EditorState, RichUtils, DraftBlockType } from 'draft-js';
import {
    createStyles, withStyles, WithStyles, Theme, NativeSelect, FormControl,
    InputLabel, Input, IconButton
} from '@material-ui/core';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
import {
    FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatColorText,
    FormatListBulleted, FormatListNumbered, FormatClear
} from '@material-ui/icons';
import { getFontSize, setFontSize } from './fontSizePlugin';
import { getAlignment, setAlignment, Alignment } from './alignmentPlugin';
import { getColor, setColor } from './colorPlugin';
import { clearAllInlineStyle } from './utils';

interface OwnProps {
    editorState: EditorState;
    onChange: (editorState: EditorState) => void;
}

type Props = OwnProps & WithStyles<typeof styles>;

interface State {
    showColorPicker?: boolean;
}

class Toolbar extends React.Component<Props, State> {
    colorPickerWrapperRef: HTMLElement | null;
    colorPickerBtnRef: HTMLElement | null;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    toggleInlineStyle = (style: 'BOLD' | 'ITALIC' | 'UNDERLINE') => {
        const newEditorState = RichUtils.toggleInlineStyle(this.props.editorState, style);
        this.props.onChange(newEditorState);
    }

    setAlignment = (alignment: Alignment) => {
        const newEditorState = setAlignment(this.props.editorState, alignment);
        this.props.onChange(newEditorState);
    }

    setColor = (color: string) => {
        const newEditorState = setColor(this.props.editorState, color);
        this.props.onChange(newEditorState);
    }

    setFontSize = (fontSize: string) => {
        const newEditorState = setFontSize(this.props.editorState, fontSize);
        this.props.onChange(newEditorState);
    }

    setBlockType = (blockType: DraftBlockType) => {
        const newEditorState = RichUtils.toggleBlockType(this.props.editorState, blockType);
        this.props.onChange(newEditorState);
    }

    clearInlineStyle = () => {
        const newEditorState = clearAllInlineStyle(this.props.editorState);
        this.props.onChange(newEditorState);
    }

    preventBubblingUp = (event) => { event.preventDefault(); };

    handleWindowClick = (event: MouseEvent) => {
        if (!this.colorPickerBtnRef || !this.colorPickerWrapperRef) {
            return;
        }

        if (this.colorPickerBtnRef.contains(event.target as any)) {
            return;
        }

        if (!this.colorPickerWrapperRef.contains(event.target as any)) {
            this.setState({ showColorPicker: false });
        }
    }

    renderIconBtn(groupValues: (string | undefined)[], value: string, onClick: () => void, children: React.ReactChild) {
        const { classes } = this.props;
        const toggled = groupValues.includes(value);
        const classNames = ClassNames({
            [classes.btn]: true,
            [classes.btnToggled]: toggled
        });
        return (
            <IconButton
                value={value}
                className={classNames}
                onClick={onClick}
                onMouseDown={this.preventBubblingUp}
                children={children}
            />
        );
    }

    componentDidMount() {
        window.addEventListener('click', this.handleWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleWindowClick);
    }

    render() {
        const { editorState, classes } = this.props;
        const inlineStyles = editorState.getCurrentInlineStyle().toArray();
        const alignment = getAlignment(editorState);
        const color = getColor(editorState);
        const blockType = RichUtils.getCurrentBlockType(editorState);
        const fontSize = getFontSize(editorState);

        const alignmentLeft: Alignment = 'left';
        const alignmentCenter: Alignment = 'center';
        const alignmentRight: Alignment = 'right';
        return (
            <div className={classes.root}>
                <div className={classes.btnGroup}>
                    {this.renderIconBtn(
                        inlineStyles, 'BOLD', () => this.toggleInlineStyle('BOLD'), <FormatBold />
                    )}
                    {this.renderIconBtn(
                        inlineStyles, 'ITALIC', () => this.toggleInlineStyle('ITALIC'), <FormatItalic />
                    )}
                    {this.renderIconBtn(
                        inlineStyles, 'UNDERLINE', () => this.toggleInlineStyle('UNDERLINE'), <FormatUnderlined />
                    )}
                </div>

                <div className={classes.btnGroup}>
                    {this.renderIconBtn(
                        [alignment], alignmentLeft, () => this.setAlignment(alignmentLeft), <FormatAlignLeft />
                    )}
                    {this.renderIconBtn(
                        [alignment], alignmentCenter, () => this.setAlignment(alignmentCenter), <FormatAlignCenter />
                    )}
                    {this.renderIconBtn(
                        [alignment], alignmentRight, () => this.setAlignment(alignmentRight), <FormatAlignRight />
                    )}
                    {this.renderIconBtn(
                        [blockType],
                        'ordered-list-item',
                        () => this.setBlockType('ordered-list-item'),
                        <FormatListNumbered />
                    )}
                    {this.renderIconBtn(
                        [blockType],
                        'unordered-list-item',
                        () => this.setBlockType('unordered-list-item'),
                        <FormatListBulleted />
                    )}
                </div>
                <div className={classes.btnGroup}>
                    <FormControl>
                        <InputLabel>Font Size</InputLabel>
                        <NativeSelect
                            value={fontSize}
                            onChange={e => {
                                const newFontSize = e.currentTarget.value;
                                if (!newFontSize) {
                                    return;
                                }
                                this.setFontSize(newFontSize);
                            }}
                            style={{ width: '75px' }}
                            input={<Input />}
                        >
                            <option value={''} />
                            {_.range(10, 71).map(size => <option key={size} value={size} children={size} />)}
                        </NativeSelect>
                    </FormControl>
                    <IconButton
                        value="color"
                        buttonRef={r => { this.colorPickerBtnRef = r; }}
                        className={classes.btn}
                        onMouseDown={this.preventBubblingUp}
                        onClick={e => this.setState({ showColorPicker: !this.state.showColorPicker })}
                        children={<FormatColorText style={{ color }} />}
                    />
                    {!!this.state.showColorPicker && (
                        <div
                            ref={r => { this.colorPickerWrapperRef = r; }}
                            style={{ position: 'absolute', zIndex: 1 }}
                        >
                            <SketchPicker
                                color={color}
                                onChange={result => this.setColor(result.hex)}
                            />
                        </div>
                    )}
                    {this.renderIconBtn([], 'clear-format', this.clearInlineStyle, <FormatClear />)}
                </div>
            </div >
        );
    }
}

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        alignItems: 'center',

    },
    btn: {
        borderRadius: 0
    },
    btnToggled: {
        backgroundColor: theme.palette.grey['400']
    },
    btnGroup: {
        margin: `0 ${theme.spacing.unit}px`,
        background: theme.palette.background.default
    }
});

export default withStyles(styles)(Toolbar);