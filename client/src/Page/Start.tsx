import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import ChevronRight from '@material-ui/icons/ChevronRight';
import Add from '@material-ui/icons/Add';
import Avatar from '@material-ui/core/Avatar';
import Localization from "../Localization";
import * as Entity from "../Entity"
import Done from '@material-ui/icons/Done';
import Close from '@material-ui/icons/Close';
import InputBase from '@material-ui/core/Input';
import Tooltip from '@material-ui/core/Tooltip';
import WebSocket from "../WebSocket";
import Configuration from '../Configuration'
import Session from '../Session'

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

export function Start() {
  const classes = useStyles();
  const translate = Localization.useTranslator();
  const [isShowEditor, setShowEditor] = React.useState<boolean>(false)
  const onShowEditor = () => setShowEditor(true);
  const onCloseEditor = () => setShowEditor(false);


  return (
    <Box p={0} className={classes.root}>
      <Grid container direction={'row'} spacing={1} alignItems={'stretch'} justify={'center'} className={classes.container} >
        <Grid item md={3}>
          <List>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((value) => {
              const labelId = `checkbox-list-secondary-label-${value}`;
              return (
                <ListItem key={value} button divider>
                  <ListItemAvatar>
                    <Entity.Avatar />
                  </ListItemAvatar>
                  <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
                  {/* <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="comments">
                      <ChevronRight />
                    </IconButton>
                  </ListItemSecondaryAction> */}
                </ListItem>
              );
            })}
            {
              isShowEditor ? (
                <Start.Editor onClose={onCloseEditor} />
              ) : (
                <ListItem button divider onClick={onShowEditor}>
                  <ListItemAvatar>
                    <Avatar variant={'rounded'}>
                      <Add />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText>
                    {translate("ui@createNewCharacter")}
                  </ListItemText>
                </ListItem>
              )
            }
          </List>
        </Grid>
      </Grid>
    </Box>
  )
}

export namespace Start {
  export function Editor({ onClose }: Editor.Props) {
    const classes = Editor.useStyles();

    const translate = Localization.useTranslator();
    const configuration = Configuration.useContext();
    const sender = WebSocket.useSender();
    const [session] = Session.useContext();
    const [name, setName] = React.useState<{ value?: string, error?: string }>({ value: '' })
    const [icon, setIcon] = React.useState<{ value?: string }>({})

    const onConfirm: React.FormEventHandler = async function (e) {
      e.preventDefault()
      if (!name.value || (name.value.length && !Editor.namePattern.test(name.value))) {
        setName({ ...name, error: 'ui@invalidCharacterName' });
        return
      }
      sender({ event: { type: "hero:create", entity: { display: { name: name.value, icon: icon.value } } } })
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
          <ListItem divider>
            <ListItemAvatar>
              <Entity.Avatar.Editor onSrcChange={onIconChange} />
            </ListItemAvatar>
            <ListItemText>
              <Tooltip title={translate(name.error ?? '')} arrow open={name.error !== ''}>
                <InputBase
                  classes={{
                    // input: classes.name
                  }}
                  autoFocus
                  placeholder={translate('ui@name')}
                  value={name?.value}
                  onChange={onNameChange}
                  fullWidth
                  error={name?.error ? true : false}
                />
              </Tooltip>
            </ListItemText>
            <ListItemSecondaryAction>
              {
                name.value?.length ? (
                  <IconButton edge="end" type="submit">
                    <Done color={name?.error ? 'error' : 'primary'} />
                  </IconButton>
                ) : (
                  <IconButton edge="end" onClick={onClose}>
                    <Close color={'primary'} />
                  </IconButton>
                )
              }
            </ListItemSecondaryAction>
          </ListItem>
        </form>
      </div>
    )
  }
  export namespace Editor {
    export const namePattern = /^[A-z][A-z0-9_]{2,19}$/
    export type Props = { onClose: () => void } & ListItemProps
    export const useStyles = makeStyles((theme: Theme) =>
      createStyles({
        root: {
          flexGrow: 0
        }
      }),
    );
  }
}

export default Start;
