import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { orange } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        type: "dark"
    }
});

export default function Theme({children}:React.Props<{}>) {
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
}