import React from 'react';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import red from '@material-ui/core/colors/red';

const theme = createMuiTheme({
    palette: {
        type: "dark",
        // primary: {
        //     main: '#18ffff',
        // },
        // secondary: {
        //     main: '#ff6e40',
        // },
    }
});

export default function Theme({ children }: React.Props<{}>) {
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
}