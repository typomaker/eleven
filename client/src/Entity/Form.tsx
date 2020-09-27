import React, { useState, useRef, useContext } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import InputBase from '@material-ui/core/InputBase'
import Button from '@material-ui/core/Button'
import ButtonBase from '@material-ui/core/ButtonBase'
import Avatar from '@material-ui/core/Avatar'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import Alert from '@material-ui/lab/Alert';
import Localization from "../Localization"
import Configuration from '../Configuration';
import CardHeader from '@material-ui/core/CardHeader';
import { red } from '@material-ui/core/colors';
import * as DataView from "../DataView"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      // display: "flex",
      // height: "110px",
    },
    media: {
      // height: "110px",
      // width: "110px",
      // alignItems: "center",
      // justifyContent: "center",
      // display: "flex",
    },
    details: {
      // display: "flex",
      // flexDirection: "column",
    },
    input: {
      display: "none",
    },
    name: {
      ...theme.typography.body2,
      padding: 0,
    },
    iconControl: {

    },
    avatar: {
      backgroundColor: theme.palette.secondary.main,
      width: 60,
      height: 60,
    },
  }),
);


export const Form: React.FunctionComponent = () => {
  const classes = useStyles();
  const localization = useContext(Localization.Context);
  const configuration = useContext(Configuration.Context);

  const [name, setName] = useState<{ value?: string, error?: string }>({});

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName({ ...name, value: event.target.value });
  };
  const handleNameBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const nameRegx = /^[A-z][A-z0-9_]{2,19}$/
    const value = event.target.value
    if (value.length && !nameRegx.test(value)) {
      setName({ ...name, error: localization.t.invalidCharacterName });
      return
    }
  }
  const handleNameErrorClose = (event: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setName({ ...name, error: undefined })
  }
  const handleConfirm = async () => {
    const result = await fetch(`${configuration.http}/game/start`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        name: name.value,
      })
    })
  }
  return (
    <Card className={classes.card} elevation={1}>
      <CardHeader
        title={
          <InputBase
            classes={{
              input: classes.name
            }}
            placeholder={localization.t.name}
            value={name.value ?? ""}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            fullWidth
          />
        }
        subheader="September 14, 2016"
      >

      </CardHeader>
      <Snackbar open={!!name.error} autoHideDuration={4000} onClose={handleNameErrorClose}>
        <Alert onClose={handleNameErrorClose} severity="warning">
          {name.error}
        </Alert>
      </Snackbar>
      <CardActions disableSpacing>
        <Button size="small" color="primary">
          SELECT
        </Button>
      </CardActions>
    </Card>
  )
}