import React from "react";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Add from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Done from '@material-ui/icons/Done';
import AvatarInput from './AvatarInput';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/Input';
import Avatar from './Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import List from "./List";
import Localization from "../Localization"
import WebSocket from "../WebSocket";
import Configuration from '../Configuration'
import Session from '../Session'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 0
    }
  }),
);

const nameRegx = /^[A-z][A-z0-9_]{2,19}$/
export const NewCharacter: React.FunctionComponent = () => {
  const classes = useStyles();

  const translate = Localization.useTranslator();
  const configuration = Configuration.useContext();
  const sender = WebSocket.useSender();
  const [session] = Session.useContext();
  const [edit, setEdit] = React.useState(false)
  const [name, setName] = React.useState<{ value?: string, error?: string }>({ value: '' })
  const [icon, setIcon] = React.useState<{ value?: string }>({})

  const onConfirm: React.FormEventHandler = async function (e) {
    e.preventDefault()
    if (!name.value || (name.value.length && !nameRegx.test(name.value))) {
      setName({ ...name, error: 'ui@invalidCharacterName' });
      return
    }
    // sender({ type: 'create:character', name: name.value, icon: icon.value, })
  }
  const onNameChange: React.ChangeEventHandler<HTMLInputElement> = function (e) {
    const value = e.target.value
    setName({ value, error: '' })
  }
  const onIconChange = function (value: string) {
    setIcon({ value })
  }
  return (
    <div className={classes.root}>
      <form onSubmit={onConfirm}>
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid container spacing={1} justify="center" alignItems="center">
            <Grid item xs={12}>
              <Paper>
                <Avatar />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <TextField id="standard-basic" label="Standard" fullWidth />
            </Grid>
          </Grid>
        </Grid>
        {/* <ListItem >
        <ListItemAvatar>
        </ListItemAvatar>
        <ListItemText>
          <Tooltip title={translate(name.error ?? '')} arrow open={name.error !== ''}>
            <InputBase
              classes={{
                input: classes.name
              }}
              autoFocus
              placeholder={translate('ui@name')}
              value={name.value}
              onChange={onNameChange}
              fullWidth
              error={name.error !== ''}
            />
          </Tooltip>
        </ListItemText>
        <ListItemSecondaryAction>
          <IconButton edge="end" type="submit">
            <Done color={name.error !== '' ? 'error' : 'primary'} />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem> */}
      </form>
    </div>
  )
}
export default NewCharacter