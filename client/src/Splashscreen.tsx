import React, { useContext } from 'react';
import Localization from "./Localization"
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import WebSocket from './WebSocket';


const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  loader: {
    display: 'flex',
    width: '10vw'
  }
}));
const Splashscreen: React.FunctionComponent = ({ children }) => {
  const localization = Localization.useContext();
  const classes = useStyles({});
  const checklist = [
    localization.dictionary,
  ]
  if (checklist.filter(Boolean).length !== checklist.length) return (
    <div className={classes.root}>
      <LinearProgress variant="query" color="secondary" className={classes.loader} />
    </div>
  )
  return <React.Fragment>{children}</React.Fragment>;
}

export default Splashscreen;