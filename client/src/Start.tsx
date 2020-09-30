import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Card, CardMedia, CardContent, Typography, TextField, Input, InputBase, Container, Box, Paper } from '@material-ui/core';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import * as Entity from "./Entity";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: "100vh"
    },
    container: {
      height: '100%',
      marginTop: "0px"
    },
    paper: {
      height: "100%",
    },
  }),
);

export const Start: React.FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Box p={0} className={classes.root}>
      <Grid container direction={'row'} spacing={1} alignItems={'stretch'} justify={'center'} className={classes.container} >
        <Grid item md={3}>
          <Paper className={classes.paper} elevation={1}>

          </Paper>
        </Grid>
        <Grid item md={3}>
          <Paper className={classes.paper} elevation={1} />
        </Grid>
        <Grid item md={3}>
          <Paper className={classes.paper} elevation={1} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Start;