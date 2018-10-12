import * as React from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { EditorState, RichUtils } from 'draft-js';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { createStyles, withStyles, WithStyles, Theme, Popover } from '@material-ui/core';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
import { FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatColorFill } from '@material-ui/icons';
import { getAlignment, setAlignment, Alignment } from './alignmentPlugin';
import { getColor, setColor } from './colorPlugin';

interface OwnProps {
    editorState: EditorState;
    onChange: (editorState: EditorState) => void;
}

type Props = OwnProps & WithStyles<typeof styles>;

interface State {
    showColorPicker?: boolean;
}

class Toolbar extends React.Component<Props, State> {

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

    preventBubblingUp = (event) => { event.preventDefault(); };

    render() {
        const { editorState, classes } = this.props;
        const inlineStyles = editorState.getCurrentInlineStyle().toArray();
        const alignment = getAlignment(editorState);
        const color = getColor(editorState);
        return (
            <React.Fragment>
                <ToggleButtonGroup value={inlineStyles} className={classes.toggleContainer}>
                    <ToggleButton
                        value="BOLD"
                        onMouseDown={this.preventBubblingUp}
                        onClick={() => this.toggleInlineStyle('BOLD')}
                        children={<FormatBold />}
                    />
                    <ToggleButton
                        value="ITALIC"
                        onMouseDown={this.preventBubblingUp}
                        onClick={() => this.toggleInlineStyle('ITALIC')}
                        children={<FormatItalic />}
                    />
                    <ToggleButton
                        value="UNDERLINE"
                        onMouseDown={this.preventBubblingUp}
                        onClick={() => this.toggleInlineStyle('UNDERLINE')}
                        children={<FormatUnderlined />}
                    />
                </ToggleButtonGroup>

                <ToggleButtonGroup value={alignment} className={classes.toggleContainer}>
                    <ToggleButton
                        value="left"
                        onMouseDown={this.preventBubblingUp}
                        onClick={() => this.setAlignment('left')}
                        children={<FormatAlignLeft />}
                    />
                    <ToggleButton
                        value="center"
                        onMouseDown={this.preventBubblingUp}
                        onClick={() => this.setAlignment('center')}
                        children={<FormatAlignCenter />}
                    />
                    <ToggleButton
                        value="right"
                        onMouseDown={this.preventBubblingUp}
                        onClick={() => this.setAlignment('right')}
                        children={<FormatAlignRight />}
                    />
                </ToggleButtonGroup>
                <ToggleButtonGroup>
                    <ToggleButton
                        value="color"
                        onMouseDown={this.preventBubblingUp}
                        onClick={e => this.setState({ showColorPicker: !this.state.showColorPicker })}
                        children={<FormatColorFill style={{ color }} />}
                    />
                    {!!this.state.showColorPicker && (
                        <div style={{ position: 'absolute' }}>
                            <SketchPicker
                                color={color}
                                onChange={result => this.setColor(result.hex)}
                            />
                        </div>
                    )}
                </ToggleButtonGroup>
            </React.Fragment>
        );
    }
}

const styles = (theme: Theme) => createStyles({
    toggleContainer: {
        height: 56,
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: `${theme.spacing.unit}px 0`,
        background: theme.palette.background.default,
    }
});

export default withStyles(styles)(Toolbar);