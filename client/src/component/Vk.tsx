import React, {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Vk as VkIcon } from 'mdi-material-ui'

const useStyles = makeStyles((theme: Theme) => createStyles({
    button: {
        backgroundColor: '#4680C2',
        margin: theme.spacing(1),
        "&:hover": {
            backgroundColor: "#4680C2"
        }
    },
}));
declare var VK: any;

export default function Vk(props: { appId: string, onLogin: (token: string) => void, onFailure: (error: string) => void }) {
    const classes = useStyles({});
    const [loaded, setLoaded] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    function handleResponse(r: fb.StatusResponse) {
        console.log(r);
        // if (r.status === 'connected') {
        //     props.onLogin(r.authResponse.accessToken);
        //     setToken(r.authResponse.accessToken);
        // } else {
        //     props.onFailure(`error: status = ${r.status}`)
        // }
    }
    useEffect(() => {
        const id = 'vk-jssdk';
        if (document.getElementById(id)) return;
        const fjs = document.getElementsByTagName('script')[0];
        const js = document.createElement('script');
        js.id = id;
        js.src = "https://vk.com/js/api/openapi.js?162";
        js.async = true;

        function onLoad() {
            VK.init({
                apiId: props.appId
            });
            setLoaded(true);
        }
        function onError() {
            setLoaded(true);
        }

        js.addEventListener('load', onLoad);
        js.addEventListener('error', onError);

        fjs.parentNode.insertBefore(js, fjs);

        return () => {
            js.removeEventListener('load', onLoad);
            js.removeEventListener('error', onError);
        }

    }, [props.appId])
    function runLogin() {
        if (!token) {
            VK.Auth.login(handleResponse, 4194304);
        } else {
            props.onLogin(token);
        }
    }
    // function popup(){
    //     // console.log(1);
    //     // window.open(href, 'popup', 'width=600,height=600');
    //     location.replace(href);
    // }
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
            <VkIcon />
        </Button>
    )
}