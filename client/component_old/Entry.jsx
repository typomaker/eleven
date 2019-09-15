import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Avatar from '@material-ui/core/Avatar';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import LockIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import ReCaptcha from "react-google-recaptcha";
import api from '../src/lib/api';

const styles = theme => ({

    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
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
    reCaptchaContainer: {
        marginTop: theme.spacing.unit * 3,
        textAlign: 'center'
    },
    reCaptcha: {
        display: 'inline-block'
    }
});
const recaptchaRef = React.createRef();
const initial = {
    email: '',
    password: '',
    passwordShow: false,
    reCaptcha: '',
    reCaptchaChecked: false,
    errors: {
        email: null,
        password: null,
        reCaptcha: null,
    }
};

class Entry extends React.Component {
    state = initial;

    static get defaultProps() {
        return {
            onConfirm: () => {
            },
            onCancel: () => {
            },
        }
    };

    handleSwitchPasswordVisibility = () => {
        this.setState(state => ({passwordShow: !state.passwordShow}));
    };
    handleInputChange = async (event) => {
        let value;
        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else {
            value = event.target.value;
        }
        if (event.target.name === 'reCaptchaChecked') {
            if (this.state.reCaptchaChecked) {
                return;
            }
            recaptchaRef.current.execute()
        }
        this.setState({[event.target.name]: value});
    };
    handleReCaptcha = (reCaptcha) => {
        this.setState({
            reCaptcha,
            reCaptchaChecked: false,
            errors: Object.assign({}, this.state.errors, {reCaptcha: null})
        })
    };
    handleConfirm = async (e) => {
        e.preventDefault();
        let errors = {};
        if (!this.state.email.length) {
            errors.email = 'Email is required';
        }
        if (!this.state.password.length) {
            errors.password = 'Password is required';
        } else if (this.state.password.length < 6) {
            errors.password = "Password too short"
        }
        if (!this.state.reCaptcha || !this.state.reCaptcha.length) {
            errors.reCaptcha = "Confirm that you are not a robot"
        }
        this.setState({errors});

        if (!Object.keys(errors).length) {
            const response = await api.create('session', JSON.stringify({
                email: this.state.email,
                password: this.state.password,
                reCaptcha: this.state.reCaptcha,
            }));
            if (!response.ok) {
                if (response.status === 400) {
                    recaptchaRef.current.reset();
                    this.setState({errors: await response.json(), reCaptcha: '', reCaptchaChecked: false})
                }
            } else {
                this.props.onConfirm(await response.json());
                this.setState(initial);
            }
        }
    };

    render() {
        const {classes, open, onCancel, fullScreen} = this.props;
        return (
            <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
                scroll={"body"}
                maxWidth={"xs"}
                onClose={onCancel}
                fullScreen={fullScreen}
            >
                <DialogContent className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockIcon/>
                    </Avatar>
                    <Typography>
                        Sign in
                    </Typography>
                    <form className={classes.form} onSubmit={this.handleConfirm}>
                        <TextField
                            fullWidth
                            autoFocus
                            label="Email address"
                            name={"email"}
                            value={this.state.email}
                            onChange={this.handleInputChange}
                            margin="normal"
                            helperText={this.state.errors.email}
                            error={!!this.state.errors.email}
                        />
                        <TextField
                            label="Password"
                            name={"password"}
                            type={this.state.passwordShow ? 'text' : 'password'}
                            value={this.state.password}
                            onChange={this.handleInputChange}
                            autoComplete="current-password"
                            margin="normal"
                            fullWidth
                            helperText={this.state.errors.password}
                            error={!!this.state.errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Toggle password visibility"
                                            onClick={this.handleSwitchPasswordVisibility}
                                        >
                                            {this.state.passwordShow ? <Visibility/> : <VisibilityOff/>}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <ReCaptcha
                            ref={recaptchaRef}
                            sitekey="6LeionsUAAAAAD_73sJcZxlSa3PhivXpJY25KGhL"
                            size={'invisible'}
                            onChange={this.handleReCaptcha}
                        />
                        <FormControl required error={!!this.state.errors.reCaptcha} margin={"normal"}>
                            <FormControlLabel
                                onClick={this.handleInputChange}
                                name={"reCaptchaChecked"}
                                control={<Checkbox
                                    color="primary"
                                    icon={
                                        this.state.reCaptchaChecked && !this.state.reCaptcha
                                            ? <CircularProgress size={24}/>
                                            : undefined
                                    }
                                />}
                                label="I'm not a robot"
                                checked={!!this.state.reCaptcha}
                            />
                            <FormHelperText>{this.state.errors.reCaptcha}</FormHelperText>
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Confirm
                        </Button>
                        <Button
                            className={classes.cancel}
                            fullWidth
                            color="primary"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    </form>
                </DialogContent>


            </Dialog>
        )
    }
}

export default withStyles(styles)(withMobileDialog()(Entry));