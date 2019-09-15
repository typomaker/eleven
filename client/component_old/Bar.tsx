import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import {fade} from '@material-ui/core/styles/colorManipulator';
import {withStyles} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add';
import Api from './Api';
import LockIcon from '@material-ui/icons/LockOutlined';
import Avatar from "@material-ui/core/Avatar/Avatar";
import Dialog from "@material-ui/core/Dialog/Dialog";
import Grid from "@material-ui/core/Grid/Grid";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";

const styles = theme => ({
    root: {
        width: '100%',
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing.unit,
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('md')]: {
            marginLeft: theme.spacing.unit,
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing.unit * 5,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 5,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: 300,
        },
    },
    sectionDesktop: {
        display: 'flex',
    },
    entryIcon: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
        cursor: "pointer"
    },
});

class Bar extends React.Component {
    state = {
        anchorEl: null,
        mobileMoreAnchorEl: null,
        publish: false
    };

    handleProfileMenuOpen = event => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleMenuClose = () => {
        this.setState({anchorEl: null});
        this.handleMobileMenuClose();
    };

    handleMobileMenuOpen = event => {
        this.setState({mobileMoreAnchorEl: event.currentTarget});
    };

    handleMobileMenuClose = () => {
        this.setState({mobileMoreAnchorEl: null});
    };
    handlePublish = (value) => () => {
        this.setState({publish: value})
    };

    render() {
        const {anchorEl, mobileMoreAnchorEl} = this.state;
        const {classes} = this.props;
        const isMenuOpen = Boolean(anchorEl);

        const renderMenu = (
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                transformOrigin={{vertical: 'top', horizontal: 'right'}}
                open={isMenuOpen}
                onClose={this.handleMenuClose}
            >
                <MenuItem onClick={this.handleMenuClose}>Profile</MenuItem>
                <Divider/>
                <Api.Consumer>
                    {({signout}) => <MenuItem onClick={(e) => signout() && this.handleMenuClose()}>Logout</MenuItem>}
                </Api.Consumer>
            </Menu>
        );

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography className={classes.title} variant="h6" color="inherit" noWrap>
                            Placetalk
                        </Typography>
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon/>
                            </div>
                            <InputBase
                                placeholder="Search…"
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                            />
                        </div>
                        <div className={classes.grow}/>
                        <Api.Consumer>
                            {({isAnonymous, signin}) => isAnonymous() ? (
                                    <Avatar
                                        aria-owns={isMenuOpen ? 'material-appbar' : undefined}
                                        aria-haspopup="true"
                                        onClick={signin}
                                        color="primary"
                                        className={classes.entryIcon}
                                    >
                                        <LockIcon/>
                                    </Avatar>
                                )
                                :
                                (
                                    <React.Fragment>
                                        <IconButton color="inherit" onClick={this.handlePublish(true)}>
                                            <AddIcon/>
                                        </IconButton>
                                        <div className={classes.sectionDesktop}>
                                            <IconButton
                                                aria-owns={isMenuOpen ? 'material-appbar' : undefined}
                                                aria-haspopup="true"
                                                onClick={this.handleProfileMenuOpen}
                                                color="inherit"
                                            >
                                                <AccountCircle/>
                                            </IconButton>
                                        </div>
                                    </React.Fragment>
                                )
                            }
                        </Api.Consumer>
                    </Toolbar>
                </AppBar>
                {renderMenu}
            </div>
        );
    }
}

export default withStyles(styles)(Bar);
