import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Grid from "@material-ui/core/Grid/Grid";
import Dialog from "@material-ui/core/Dialog/Dialog";
import React from "react";
import withStyles from '@material-ui/core/styles/withStyles';
import Button from "@material-ui/core/Button/Button";

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
});

class Publication extends React.Component {
    render() {
        const {open, onCancel, classes} = this.props;
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


export default withStyles(styles)(Publication);