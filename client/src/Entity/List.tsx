import React from "react";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MUList from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Divider from '@material-ui/core/Divider';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from './Avatar';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

  }),
);

export const List: React.FunctionComponent = ({ children }) => {
  const classes = useStyles();
  return (
    <MUList dense >
      {[0, 1].map((value) => {
        const labelId = `checkbox-list-secondary-label-${value}`;
        return (
          <ListItem key={value} button divider>
            <ListItemAvatar>
              <Avatar />
            </ListItemAvatar>
            <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
            <ListItemSecondaryAction>

            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
      {children}
    </MUList>
  )
}
export default List