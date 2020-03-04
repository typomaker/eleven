import React from 'react';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

const theme = createMuiTheme({
    palette: {
        type: "light"
    }
});

export default function Theme({ children }: React.Props<{}>) {
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
}