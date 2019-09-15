import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Vk as VkIcon } from 'mdi-material-ui'
import Facebook from './Facebook';
import Vk from './Vk'

const useStyles = makeStyles((theme: Theme) => createStyles({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
    },
}));
export default function Signin() {
    const classes = useStyles({});
    
    function onLogin(provider: 'facebook' | 'vkontakte') {
        return (token: string) => {
            console.log(provider, token);
        }
    }

    function onFailure(err: string) {
        console.error(err);
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Facebook appId={process.env.FACEBOOK_ID} onLogin={onLogin('facebook')} onFailure={onFailure} />
                <Vk appId={process.env.VK_ID} onLogin={onLogin('vkontakte')} onFailure={onFailure} />
            </div>
        </Container>
    );
}
