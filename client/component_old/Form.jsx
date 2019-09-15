import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import PlaceIcon from "@material-ui/icons/Place";
import * as Place from './Place';
import Environment from './Environment';


const styles = theme => ({
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
    cancel: {
        marginTop: theme.spacing.unit * 3,
    },
    locationButton: {
        marginBottom: theme.spacing.unit * 3,
        justifyContent: 'left',
        textAlign: 'left',
    },
    locationIcon: {
        marginRight: theme.spacing.unit,
    },
});

class Form extends React.Component {
    state = {
        location: '',
        text: '',
    };

    static get defaultProps() {
        return {
            onConfirm: () => {
            },
            onCancel: () => {
            },
        }
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };
    handleConfirm = async (e) => {
        e.preventDefault();
    };

    render() {
        const {classes, open, onCancel} = this.props;
        return (
            <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
                scroll={"body"}
                maxWidth={"xs"}
                onClose={onCancel}
                fullScreen={true}
            >
                <DialogContent className={classes.content}>
                    <Grid container item spacing={16} xs={12} sm={8} md={4}>
                        <form className={classes.form} onSubmit={this.handleConfirm}>
                                <TextField
                                    name={"location"}
                                    value={this.state.location}
                                    onChange={this.handleInputChange}
                                    margin={"normal"}
                                    variant={"outlined"}
                                    fullWidth
                                />
                                <TextField
                                    name={"text"}
                                    multiline
                                    rowsMax="20"
                                    fullWidth
                                    rows={3}
                                    value={this.state.text}
                                    onChange={this.handleInputChange}
                                    margin="normal"
                                    variant={"outlined"}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                >
                                    Publish
                                </Button>
                                <Button
                                    className={classes.cancel}
                                    color="primary"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>
                        </form>
                    </Grid>
                </DialogContent>


            </Dialog>
        )
    }
}

export default withStyles(styles)(Form);