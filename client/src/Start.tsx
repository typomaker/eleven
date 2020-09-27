import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Card, CardMedia, CardContent, Typography, TextField, Input, InputBase, Container, Box } from '@material-ui/core';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import * as Entity from "./Entity";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      display: "flex",
      height: "120px",
    },
    media: {
      height: "120px",
      width: "120px",
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
    },
    grid: {
      height: "100vh"
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
  }),
);

export const Start: React.FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Box p={1}>
      <Grid container direction="row" spacing={1} justify={"center"}>
        <Grid item xs={3}>
          <Entity.Form />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Start;