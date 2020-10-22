import React, { useState, useContext, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Facebook from './Facebook';
import ReCaptcha from "react-google-recaptcha";
import Avatar from '@material-ui/core/Avatar';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import LockIcon from '@material-ui/icons/LockOutlined';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Slide from '@material-ui/core/Slide';
import validator from 'validator';
import Localization from "./Localization";
import Session from './Session';

const useStyles = makeStyles((theme: Theme) => createStyles({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
    },
    avatar: {
        margin: theme.spacing(),
        backgroundColor: theme.palette.secondary.main,
        width: 64,
        height: 64
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    cancel: {
        marginTop: theme.spacing(3),
    },
    reCaptchaContainer: {
        marginTop: theme.spacing(3),
        textAlign: 'center'
    },
    reCaptcha: {
        display: 'inline-block'
    }
}));

const recaptchaRef = React.createRef<ReCaptcha>();

export default function Signin() {
    const translate = Localization.useTranslator();
    const [session, sessionDispatch] = Session.useContext();

    const classes = useStyles({});
    const [email, setEmail] = useState({ value: '', error: '' });
    const [password, setPassword] = useState({ value: '', error: '', visible: false });
    const [recaptcha2, setRecaptcha2] = useState({ value: '', checked: false, error: '' });

    function onSwitchedPasswordVisibility() {
        setPassword(prev => ({ ...prev, visible: !prev.visible }));
    };
    async function onConfirm() {
        if (validate()) {
            sessionDispatch({ type: 'signin', payload: { type: 'pw', password: password.value, email: email.value, recaptcha2: recaptcha2.value } })
        }
    }
    function onFacebokLogin(token: string) {
        console.debug(`[Signin] facebook ${token}`)
        sessionDispatch({ type: 'signin', payload: { type: 'fb', token } })
    }
    function onEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value
        setEmail(prev => ({ ...prev, value, error: '' }));
    }
    function onPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value
        setPassword(prev => ({ ...prev, value, error: '' }));
    }
    function onRecaptcha2Change(event: React.ChangeEvent<{}>, checked: boolean): void {
        const target = event.target as HTMLInputElement
        if (target.checked) {
            recaptchaRef.current!.execute();
        } else {
            recaptchaRef.current!.reset();
        }
        setRecaptcha2({ checked: target.checked, error: '', value: '' });
    };
    function onRecaptcha2Verified(token: string | null): void {
        setRecaptcha2({
            value: token ?? "",
            checked: token !== null,
            error: "",
        });
    };
    function onFailure(err: string) {
        console.error(err);
    }
    function validate() {
        let valid = true;
        if (validator.isEmpty(email.value) || !validator.isEmail(email.value)) {
            valid = false;
            setEmail({ ...email, error: 'ui@invalidEmail' })
        }
        if (validator.isEmpty(password.value)) {
            valid = false;
            setPassword({ ...password, error: 'ui@invalidPassword' })
        }
        if (validator.isEmpty(recaptcha2.value)) {
            valid = false;
            setRecaptcha2({ ...recaptcha2, error: 'ui@invalidRecaptcha2' })
        }
        return valid;
    }
    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Slide direction="down" in mountOnEnter unmountOnExit>
                    <Avatar className={classes.avatar}>
                        <LockIcon fontSize={'large'} />
                    </Avatar>
                </Slide>
                <form className={classes.form}>
                    <TextField
                        fullWidth
                        autoFocus
                        label={translate('ui@email')}
                        name={"email"}
                        value={email.value}
                        onChange={onEmailChange}
                        margin="normal"
                        helperText={translate(email.error)}
                        error={!!email.error}
                        autoComplete={"off"}
                    />
                    <TextField
                        label={translate('ui@password')}
                        name={"password"}
                        type={password.visible ? 'text' : 'password'}
                        value={password.value}
                        onChange={onPasswordChange}
                        autoComplete="current-password"
                        margin="normal"
                        fullWidth
                        helperText={translate(password.error)}
                        error={!!password.error}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="Toggle password visibility"
                                        onClick={onSwitchedPasswordVisibility}
                                    >
                                        {password.visible ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <ReCaptcha
                        ref={recaptchaRef}
                        sitekey="6LeionsUAAAAAD_73sJcZxlSa3PhivXpJY25KGhL"
                        size={'invisible'}
                        onChange={onRecaptcha2Verified}
                        theme={'dark'}
                    />
                    <FormControl required error={!!recaptcha2.error} margin={"normal"}>
                        <FormControlLabel
                            onChange={onRecaptcha2Change}
                            name={"reCaptchaChecked"}
                            control={<Checkbox
                                color="primary"
                                icon={
                                    recaptcha2.value === '' && recaptcha2.checked
                                        ? <CircularProgress size={24} />
                                        : undefined
                                }
                            />}
                            label={translate('ui@imNotARobot')}
                            checked={recaptcha2.value !== '' && recaptcha2.checked}
                        />
                        <FormHelperText>{recaptcha2.error}</FormHelperText>
                    </FormControl>


                    <Slide direction="up" in mountOnEnter unmountOnExit>
                        <div>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onConfirm}
                                disabled={email.value === "" || password.value === "" || recaptcha2.value === ""}
                            >
                                {translate('ui@signin')}
                            </Button>
                            <Facebook appId={process.env.FACEBOOK_ID!} onLogin={onFacebokLogin} onFailure={onFailure} />
                        </div>
                    </Slide>
                </form>
            </div>
        </Container>
    );
}
