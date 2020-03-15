import React, { useContext } from 'react';
import Localization from "./Localization"
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';


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
  const localization = useContext(Localization.Context);
  const classes = useStyles({});
  if (!localization.ready) {
    return (
      <div className={classes.root}>
        <LinearProgress variant="query" color="secondary" className={classes.loader} />
      </div>
    )
  }
  return <React.Fragment>{children}</React.Fragment>;
}

export default Splashscreen;