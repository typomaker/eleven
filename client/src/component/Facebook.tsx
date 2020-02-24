import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Facebook as FacebookIcon } from 'mdi-material-ui'

const useStyles = makeStyles((theme: Theme) => createStyles({
    button: {
        backgroundColor: '#3C5A99',
        marginTop: theme.spacing(1),
        "&:hover": {
            backgroundColor: "#3C5A99"
        }
    },
}));
export default function Facebook(props: { appId: string, onLogin: (token: string) => void, onFailure: (error: string) => void }) {
    const [loaded, setLoaded] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const classes = useStyles({});

    function handleResponse(r: fb.StatusResponse) {
        if (r.status === 'connected') {
            props.onLogin(r.authResponse.accessToken);
            setToken(r.authResponse.accessToken);
        } else {
            props.onFailure(`error: status = ${r.status}`)
        }
    }

    function runLogin() {
        if (!token) {
            FB.login(handleResponse, { scope: 'email' });
        } else {
            props.onLogin(token);
        }
    }

    useEffect(() => {
        const id = 'facebook-jssdk';
        if (document.getElementById(id)) return;
        const fjs = document.getElementsByTagName('script')[0];
        const js = document.createElement('script');
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.async = true;

        function onLoad() {
            FB.init({
                appId: props.appId,
                cookie: true,
                xfbml: true,
                version: `v4.0`,
            });

            FB.AppEvents.logPageView();
            FB.getLoginStatus(handleResponse);
            setLoaded(true);
        }
        function onError() {
            setLoaded(true);
        }

        js.addEventListener('load', onLoad);
        js.addEventListener('error', onError);

        fjs.parentNode!.insertBefore(js, fjs);

        return () => {
            js.removeEventListener('load', onLoad);
            js.removeEventListener('error', onError);
        }

    }, [props.appId])

    return (
        <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.button}
            centerRipple
            disabled={!loaded}
            onClick={runLogin}
        >
            <FacebookIcon />
        </Button>
    )
}